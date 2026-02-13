import { supabase } from "@/utils/supabase";
import { File } from "expo-file-system";
import * as tus from "tus-js-client";

export interface AudioFileInfo {
  filename: string;
  filetype: string;
  size: number; // in bytes
  sizeFormatted: string; // human readable
}

export interface UploadResult {
  url: string;
  fileInfo: AudioFileInfo;
}

export interface UploadProgress {
  bytesUploaded: number;
  bytesTotal: number;
  percentage: number;
}

/**
 * Get file info from a local URI
 */
export async function getAudioFileInfo(uri: string): Promise<AudioFileInfo> {
  const file = new File(uri);

  if (!file.exists) {
    throw new Error("File does not exist");
  }

  // Get detailed file info
  const fileInfo = file.info();

  // Extract filename from URI
  const filename = file.name || `recording_${Date.now()}.m4a`;

  // Determine file type from extension
  const extension = file.extension?.replace(".", "").toLowerCase() || "m4a";
  const mimeTypes: Record<string, string> = {
    m4a: "audio/mp4",
    mp4: "audio/mp4",
    mp3: "audio/mpeg",
    wav: "audio/wav",
    aac: "audio/aac",
    ogg: "audio/ogg",
    webm: "audio/webm",
  };
  const filetype = mimeTypes[extension] || "audio/mp4";

  const size = fileInfo.size || 0;

  return {
    filename,
    filetype,
    size,
    sizeFormatted: formatFileSize(size),
  };
}

/**
 * Format bytes to human readable string
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Upload audio file to Supabase Storage using TUS (resumable uploads)
 */
export async function uploadAudioToSupabase(
  uri: string,
  bucketName: string = "recordings",
  onProgress?: (progress: UploadProgress) => void,
): Promise<UploadResult> {
  try {
    // Get file info for logging
    const fileInfo = await getAudioFileInfo(uri);

    console.log("📁 Audio File Info:");
    console.log(`  Filename: ${fileInfo.filename}`);
    console.log(`  Type: ${fileInfo.filetype}`);
    console.log(`  Size: ${fileInfo.sizeFormatted} (${fileInfo.size} bytes)`);

    // Use expo-file-system File which implements Blob interface
    const file = new File(uri);

    // Get Supabase session for auth
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("User not authenticated");
    }

    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const uniqueFilename = `${timestamp}_${fileInfo.filename}`;
    const filePath = `${session.user.id}/${uniqueFilename}`;

    // Get Supabase URL for TUS endpoint
    const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_STORAGE_URL as string;
    const tusEndpoint = `${supabaseUrl}/storage/v1/upload/resumable`;

    return new Promise((resolve, reject) => {
      // expo-file-system File implements Blob interface directly
      const upload = new tus.Upload(file as unknown as Blob, {
        endpoint: tusEndpoint,
        retryDelays: [0, 3000, 5000, 10000, 20000],
        headers: {
          authorization: `Bearer ${session.access_token}`,
          "x-upsert": "true",
        },
        uploadDataDuringCreation: true,
        removeFingerprintOnSuccess: true,
        metadata: {
          bucketName: bucketName,
          objectName: filePath,
          contentType: fileInfo.filetype,
          cacheControl: "3600",
        },
        chunkSize: 6 * 1024 * 1024, // 6MB chunks

        onError: (error) => {
          console.error("❌ Upload failed:", error);
          reject(new Error(error.message));
        },

        onProgress: (bytesUploaded, bytesTotal) => {
          const percentage = Math.round((bytesUploaded / bytesTotal) * 100);
          console.log(`📤 Upload progress: ${percentage}%`);

          onProgress?.({
            bytesUploaded,
            bytesTotal,
            percentage,
          });
        },

        onSuccess: () => {
          // Construct the public URL
          const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/${filePath}`;

          console.log("✅ Upload complete!");
          console.log(`📍 URL: ${publicUrl}`);

          resolve({
            url: publicUrl,
            fileInfo,
          });
        },
      });

      // Check for previous uploads and resume or start
      upload.findPreviousUploads().then((previousUploads) => {
        if (previousUploads.length) {
          upload.resumeFromPreviousUpload(previousUploads[0]);
        }
        upload.start();
      });
    });
  } catch (error) {
    console.error("❌ Upload error:", error);
    throw error instanceof Error ? error : new Error("Upload failed");
  }
}

/**
 * Simple upload using Supabase Storage SDK (non-resumable)
 * Use this for smaller files or when TUS is not needed
 */
export async function uploadAudioSimple(
  uri: string,
  bucketName: string = "recordings",
): Promise<UploadResult> {
  try {
    const fileInfo = await getAudioFileInfo(uri);

    console.log("📁 Audio File Info:");
    console.log(`  Filename: ${fileInfo.filename}`);
    console.log(`  Type: ${fileInfo.filetype}`);
    console.log(`  Size: ${fileInfo.sizeFormatted} (${fileInfo.size} bytes)`);

    // Use expo-file-system File which implements Blob interface
    const file = new File(uri);

    // Get session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      throw new Error("User not authenticated");
    }

    // Generate unique path
    const timestamp = Date.now();
    const uniqueFilename = `${timestamp}_${fileInfo.filename}`;
    const filePath = `${session.user.id}/${uniqueFilename}`;

    // Upload using Supabase Storage - File implements Blob interface
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file as unknown as Blob, {
        contentType: fileInfo.filetype,
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(bucketName).getPublicUrl(data.path);

    console.log("✅ Upload complete!");
    console.log(`📍 URL: ${publicUrl}`);

    return {
      url: publicUrl,
      fileInfo,
    };
  } catch (error) {
    console.error("❌ Upload error:", error);
    throw error instanceof Error ? error : new Error("Upload failed");
  }
}

/**
 * Get a signed URL for a file in Supabase Storage with 60-minute lifetime
 * @param filePathOrUrl - Either a storage path (user-id/filename.m4a) or a full public URL
 * @param bucketName - The storage bucket name (default: "recordings")
 */
export async function getSignedUrl(
  filePathOrUrl: string,
  bucketName: string = "recordings",
): Promise<string> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("User not authenticated");
  }

  // Extract path from URL if a full URL is provided
  let filePath = filePathOrUrl;

  // Check if it's a full Supabase storage URL
  if (filePathOrUrl.includes("/storage/v1/object/public/")) {
    // Extract path after bucket name: .../public/recordings/user-id/file.m4a -> user-id/file.m4a
    const match = filePathOrUrl.match(
      new RegExp(`/public/${bucketName}/(.+)$`),
    );
    if (match) {
      filePath = decodeURIComponent(match[1]);
    }
  }

  const { data, error } = await supabase.storage
    .from(bucketName)
    .createSignedUrl(filePath, 60 * 60); // 60 minutes in seconds

  if (error) {
    console.error("Error creating signed URL:", error);
    throw error;
  }

  return data.signedUrl;
}
