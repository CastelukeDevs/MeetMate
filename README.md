# MeetMate

A React Native mobile app for recording, transcribing, and summarizing meetings using AI.

## Requirements

Before you begin, ensure you have the following installed:

| Tool                | Version | Installation                                                                        |
| ------------------- | ------- | ----------------------------------------------------------------------------------- |
| **Node.js**         | 18+     | [nodejs.org](https://nodejs.org/)                                                   |
| **npm** or **yarn** | Latest  | Comes with Node.js                                                                  |
| **Python**          | 3.9+    | [python.org](https://www.python.org/)                                               |
| **Expo CLI**        | Latest  | `npm install -g expo-cli`                                                           |
| **EAS CLI**         | Latest  | `npm install -g eas-cli`                                                            |
| **Xcode**           | 15+     | Mac App Store (iOS development)                                                     |
| **Android Studio**  | Latest  | [developer.android.com](https://developer.android.com/studio) (Android development) |

### Accounts Required

- [Expo Account](https://expo.dev/signup) - For building and deploying
- [Supabase Account](https://supabase.com/) - Database and authentication
- [OpenAI Account](https://platform.openai.com/) - For transcription and summarization

## Features

- 🎙️ **Audio Recording** - Record meetings directly in the app
- 📝 **AI Transcription** - Automatic transcription using OpenAI Whisper
- 📊 **Smart Summaries** - AI-generated meeting summaries with key points
- 🔔 **Push Notifications** - Get notified when transcription is complete
- 🌙 **Dark Mode** - Full light/dark theme support
- 🔐 **Authentication** - Secure user accounts via Supabase

## Tech Stack

### Mobile App

- **Framework**: React Native with Expo (SDK 54)
- **Navigation**: Expo Router (file-based routing)
- **State Management**: Zustand with MMKV persistence
- **Database/Auth**: Supabase

### Backend

- **Framework**: FastAPI (Python)
- **AI**: OpenAI (Whisper for transcription, GPT-4o-mini for summaries)

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/MeetMate.git
cd MeetMate
```

### 2. Install app dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# Supabase configuration (get from Supabase dashboard)
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_STORAGE_URL=https://your-project.storage.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key

# Backend API URL - IMPORTANT: Use your local IP address!
EXPO_PUBLIC_BACKEND_URL=http://YOUR_IP_ADDRESS:8000
```

#### Finding Your Local IP Address

Since the mobile app runs on your phone/simulator and needs to connect to your local backend, you must use your computer's local IP address (not `localhost`).

**macOS:**

```bash
ipconfig getifaddr en0
```

**Windows:**

```bash
ipconfig
# Look for "IPv4 Address" under your active network adapter
```

**Linux:**

```bash
hostname -I | awk '{print $1}'
```

Example: If your IP is `192.168.1.100`, set:

```env
EXPO_PUBLIC_BACKEND_URL=http://192.168.1.100:8000
```

> ⚠️ **Note**: Your IP address may change. Update this value if you switch networks or restart your router.

### 4. Setup the Backend

Navigate to the backend directory:

```bash
cd backend
```

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `backend/.env` with your values:

```env
# Supabase configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key

# OpenAI configuration (get from platform.openai.com)
OPENAI_API_KEY=sk-your-openai-api-key
```

Run the setup script (creates virtual environment and installs dependencies):

```bash
bash setup.sh
```

Start the backend server:

```bash
bash start.sh
```

The backend will run at `http://0.0.0.0:8000`.

### 5. Setup Supabase

Create the following tables in your Supabase project:

#### `profiles` table

```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email TEXT,
  device_token TEXT
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read/update their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);
```

#### `meetings` table

```sql
CREATE TABLE meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  users UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  recording TEXT,
  annotation JSONB,
  summary JSONB,
  "inProgress" BOOLEAN DEFAULT NULL
);

-- Enable RLS
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can CRUD their own meetings
CREATE POLICY "Users can view own meetings" ON meetings
  FOR SELECT USING (auth.uid() = users);

CREATE POLICY "Users can insert own meetings" ON meetings
  FOR INSERT WITH CHECK (auth.uid() = users);

CREATE POLICY "Users can update own meetings" ON meetings
  FOR UPDATE USING (auth.uid() = users);

CREATE POLICY "Users can delete own meetings" ON meetings
  FOR DELETE USING (auth.uid() = users);
```

#### Storage bucket

1. Go to **Storage** in Supabase dashboard
2. Create a new bucket named `meetings_bucket`
3. Set appropriate RLS policies for authenticated users

### 6. Run the App

Make sure the backend is running in a separate terminal, then:

```bash
# In the root directory
npx expo start
```

**Options:**

- Press `i` to open iOS Simulator
- Press `a` to open Android Emulator
- Scan QR code with Expo Go app on your phone

## Project Structure

```
MeetMate/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx      # Home (recording screen)
│   │   ├── meetings.tsx   # Meetings list
│   │   └── me.tsx         # Profile screen
│   ├── meeting/
│   │   └── [id].tsx       # Meeting detail screen
│   ├── auth.tsx           # Authentication screen
│   └── _layout.tsx        # Root layout
├── backend/               # FastAPI backend
│   ├── main.py           # API endpoints
│   ├── requirements.txt  # Python dependencies
│   ├── setup.sh          # Setup script
│   └── start.sh          # Start script
├── components/
│   ├── meetings/         # Meeting-specific components
│   └── ui/               # Reusable UI components
├── hooks/                # Custom React hooks
├── theme/                # Theme configuration
├── types/                # TypeScript type definitions
└── utils/                # Utility functions
```

## Building for Production

> **Note:** Since MeetMate uses push notifications, for iOS it is strongly recommended to build the app using EAS Build. Expo Go and local builds do not support push notifications on iOS due to Apple restrictions. EAS Build ensures proper provisioning profiles and notification entitlements for your app.

### Install EAS CLI

```bash
npm install -g eas-cli
eas login
```

### Configure EAS

```bash
eas build:configure
```

### Build

```bash
# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android

# Build for both
eas build --platform all
```

## Troubleshooting

### Backend won't start

If you see path errors about Python, the virtual environment may have stale paths (happens when you move the project folder). Run:

```bash
cd backend
bash setup.sh  # Recreates the venv with correct paths
bash start.sh
```

### App can't connect to backend

1. **Check your IP address** - Make sure `EXPO_PUBLIC_BACKEND_URL` in `.env` uses your current local IP
2. **Check firewall** - Ensure port 8000 is not blocked
3. **Check backend is running** - Visit `http://YOUR_IP:8000` in browser
4. **Restart Expo** - Run `npx expo start --clear` to clear cache

### Push notifications not working

1. Push notifications only work on **physical devices** (not simulators)
2. Ensure `device_token` is saved in the user's profile
3. Check Expo push notification service status

### Audio recording issues

Ensure the app has microphone permissions:

- iOS: Configured in `app.config.ts` under `infoPlist`
- Android: Granted at runtime when first recording

## Environment Variables Reference

### Root `.env`

| Variable                               | Description                     |
| -------------------------------------- | ------------------------------- |
| `EXPO_PUBLIC_SUPABASE_URL`             | Supabase project URL            |
| `EXPO_PUBLIC_SUPABASE_STORAGE_URL`     | Supabase storage URL            |
| `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable/anon key   |
| `EXPO_PUBLIC_BACKEND_URL`              | Backend API URL (use local IP!) |

### Backend `.env`

| Variable            | Description            |
| ------------------- | ---------------------- |
| `SUPABASE_URL`      | Supabase project URL   |
| `SUPABASE_ANON_KEY` | Supabase anonymous key |
| `OPENAI_API_KEY`    | OpenAI API key         |

## License

This project is private and not licensed for public use.
