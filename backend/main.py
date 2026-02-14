from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from openai import OpenAI
import httpx
import os
import tempfile
import logging
from typing import Optional, Any, List
from concurrent.futures import ThreadPoolExecutor
import asyncio

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

load_dotenv()

app = FastAPI(title="MeetMate Backend")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

# Connection pool for Supabase requests
http_client: Optional[httpx.Client] = None


def get_http_client() -> httpx.Client:
    """Get or create HTTP client with connection pooling"""
    global http_client
    if http_client is None:
        http_client = httpx.Client(timeout=30)
    return http_client


@app.on_event("shutdown")
async def shutdown_event():
    """Clean up HTTP client on shutdown"""
    global http_client
    if http_client:
        http_client.close()
        http_client = None


class SupabaseSession(BaseModel):
    access_token: str
    refresh_token: str


class ProcessMeetingRequest(BaseModel):
    audio_url: str
    meeting_id: str
    session: SupabaseSession


class ProcessMeetingResponse(BaseModel):
    success: bool
    message: str


def get_openai_client() -> OpenAI:
    """Create OpenAI client"""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY must be set")
    return OpenAI(api_key=api_key)


def transcribe_audio_sync(audio_content: bytes) -> List[dict]:
    """
    Transcribe audio using OpenAI Whisper-1
    Returns list of transcript segments
    """
    client = get_openai_client()
    
    # Save audio to temporary file (OpenAI API requires file)
    with tempfile.NamedTemporaryFile(suffix=".m4a", delete=False) as tmp_file:
        tmp_file.write(audio_content)
        tmp_file_path = tmp_file.name
    
    try:
        with open(tmp_file_path, "rb") as audio_file:
            response = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
                response_format="verbose_json",
                timestamp_granularities=["segment"]
            )
        
        # Process segments into our format
        segments = []
        for segment in response.segments:
            # Handle both dict and object access patterns
            if isinstance(segment, dict):
                segments.append({
                    "text": segment["text"].strip(),
                    "start": segment["start"],
                    "end": segment["end"]
                })
            else:
                segments.append({
                    "text": segment.text.strip(),
                    "start": segment.start,
                    "end": segment.end
                })
        
        return segments
    finally:
        os.unlink(tmp_file_path)


def generate_summary(transcript_segments: List[dict]) -> dict:
    """
    Generate summaries of the meeting from transcript segments using GPT.
    Returns dict with 'text' (full summary) and 'short' (250 char max) keys.
    Uses parallel execution for both summaries.
    """
    client = get_openai_client()
    
    # Combine all transcript text
    full_transcript = "\n".join([seg["text"] for seg in transcript_segments])
    
    if not full_transcript.strip():
        return {"text": "No content to summarize.", "short": "No content."}
    
    def generate_full_summary():
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant that summarizes meeting transcripts. Provide a clear, concise summary of the key points, decisions, and action items discussed in the meeting."
                },
                {
                    "role": "user",
                    "content": f"Please summarize this meeting transcript:\n\n{full_transcript}"
                }
            ],
            max_tokens=500
        )
        return response.choices[0].message.content.strip()
    
    def generate_short_summary():
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant. Provide an extremely brief summary in 250 characters or less. Be direct and concise."
                },
                {
                    "role": "user",
                    "content": f"Summarize this meeting in 250 characters or less:\n\n{full_transcript}"
                }
            ],
            max_tokens=100
        )
        return response.choices[0].message.content.strip()[:250]
    
    # Execute both summaries in parallel
    with ThreadPoolExecutor(max_workers=2) as executor:
        full_future = executor.submit(generate_full_summary)
        short_future = executor.submit(generate_short_summary)
        
        text_summary = full_future.result()
        short_summary = short_future.result()
    
    return {"text": text_summary, "short": short_summary}


def supabase_request(method: str, endpoint: str, access_token: str, data: dict = None) -> dict:
    """Make authenticated request to Supabase REST API using connection pool"""
    url = f"{SUPABASE_URL}/rest/v1/{endpoint}"
    headers = {
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
        "Prefer": "return=representation"
    }
    
    client = get_http_client()
    if method == "GET":
        response = client.get(url, headers=headers)
    elif method == "PATCH":
        response = client.patch(url, headers=headers, json=data)
    else:
        response = client.request(method, url, headers=headers, json=data)
    
    if response.status_code >= 400:
        raise Exception(f"Supabase error: {response.status_code} - {response.text}")
    
    return response.json() if response.text else {}


def process_meeting_background(
    audio_url: str,
    meeting_id: str,
    user_id: str,
    access_token: str,
    meeting_name: str = "Your meeting"
):
    """Background task to process meeting transcription"""
    try:
        # Mark meeting as in progress
        supabase_request(
            "PATCH",
            f"meetings?id=eq.{meeting_id}",
            access_token,
            {"inProgress": True}
        )
        
        # Get user profile for device token
        profiles = supabase_request(
            "GET",
            f"profiles?id=eq.{user_id}&select=device_token",
            access_token
        )
        device_token = profiles[0].get("device_token") if profiles else None
        logger.info(f"Device token found: {bool(device_token)}")
        
        # Convert public URL to authenticated URL if needed
        # Public: /storage/v1/object/public/bucket/path
        # Authenticated: /storage/v1/object/bucket/path
        download_url = audio_url.replace("/object/public/", "/object/")
        
        # Download audio file with authentication for Supabase storage
        headers = {
            "apikey": SUPABASE_ANON_KEY,
            "Authorization": f"Bearer {access_token}"
        }
        
        logger.info(f"Downloading audio from: {download_url}")
        
        with httpx.Client(timeout=300) as client:
            audio_response = client.get(download_url, headers=headers)
            if audio_response.status_code != 200:
                logger.error(f"Failed to download audio: {audio_response.status_code} - {audio_response.text}")
                return
            audio_content = audio_response.content
        
        logger.info(f"Downloaded audio: {len(audio_content)} bytes")
        
        # Transcribe
        transcript_json = transcribe_audio_sync(audio_content)
        
        logger.info(f"Transcription complete: {len(transcript_json)} segments")
        
        # Generate summaries (text and short)
        summary_json = generate_summary(transcript_json)
        
        logger.info(f"Summary generated: {len(summary_json['text'])} chars (text), {len(summary_json['short'])} chars (short)")
        
        # Save to Supabase via REST API
        supabase_request(
            "PATCH",
            f"meetings?id=eq.{meeting_id}",
            access_token,
            {
                "annotation": transcript_json,
                "summary": summary_json,
                "inProgress": False
            }
        )
        
        # Send push notification to user
        if device_token:
            try:
                with httpx.Client() as push_client:
                    push_response = push_client.post(
                        "https://exp.host/--/api/v2/push/send",
                        json={
                            "to": device_token,
                            "title": "Transcription Complete",
                            "body": f"\"{meeting_name}\" has been transcribed and summarized.",
                            "data": {"meeting_id": meeting_id},
                            "sound": "default"
                        },
                        headers={"Content-Type": "application/json"}
                    )
                    logger.info(f"Push notification sent: {push_response.status_code}")
            except Exception as push_error:
                logger.error(f"Failed to send push notification: {push_error}")
        else:
            logger.warning(f"No device token found for user {user_id}")
        
        logger.info(f"Transcription completed for meeting {meeting_id}")
        
    except Exception as e:
        logger.error(f"Background processing failed: {e}", exc_info=True)


@app.post("/process-meeting", response_model=ProcessMeetingResponse)
async def process_meeting(request: ProcessMeetingRequest, background_tasks: BackgroundTasks):
    """
    Start background processing of meeting transcription
    Returns immediately, processes in background
    """
    try:
        # Verify session is valid by checking meeting exists and get user id
        meetings = supabase_request(
            "GET",
            f"meetings?id=eq.{request.meeting_id}&select=id,users,name",
            request.session.access_token
        )
        
        if not meetings or len(meetings) == 0:
            return ProcessMeetingResponse(
                success=False,
                message=f"Meeting not found: {request.meeting_id}"
            )
        
        user_id = meetings[0].get("users")
        meeting_name = meetings[0].get("name", "Your meeting")
        
        # Add background task
        background_tasks.add_task(
            process_meeting_background,
            request.audio_url,
            request.meeting_id,
            user_id,
            request.session.access_token,
            meeting_name
        )
        
        return ProcessMeetingResponse(
            success=True,
            message="Processing started"
        )
        
    except Exception as e:
        return ProcessMeetingResponse(
            success=False,
            message=f"Failed to start processing: {str(e)}"
        )


@app.get("/")
async def root():
    return {"message": "MeetMate Backend API", "status": "running"}
