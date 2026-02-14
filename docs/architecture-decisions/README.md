# Architecture Decision Notes

This folder documents key architectural decisions and future development considerations for MeetMate.

## Current Architecture

- **Frontend:** React Native (Expo) app using Expo Router, Zustand, and Supabase for authentication and storage.
- **Backend:** FastAPI (Python) for AI processing (transcription, summary, notifications).
- **Database:** Supabase (Postgres) with RLS policies for user data isolation.
- **Storage:** Supabase Storage for audio files.
- **Notifications:** Expo push notifications, triggered by backend after processing.

## Key Decisions

- Use of Supabase for authentication, storage, and database.
- Separate backend for AI processing to keep mobile app lightweight and secure API keys.
- Expo Router for scalable navigation structure.
- Zustand for simple, persistent state management.

## Areas for Refinement & Further Development

- **Refine authentication:** Add social login (Google, Apple, etc.) for easier onboarding.
- **API call flow:** Migrate from direct point-to-point API calls to using Supabase Functions. When a user uploads a recording, the app should create a new meeting row in Supabase, and Supabase Functions should trigger all necessary backend processing (transcription, summary, notifications).
- **Notification page:** Add a dedicated notification page in the app so users can track new and unread notifications.
- **Speaker differentiation:** Enhance meeting post-processing to differentiate between speakers in transcripts.
- **Custom widgets:** Add custom UI widgets for richer user experience.
- **Media session integration:** Implement Android media session and iOS Now Playing info to control recording playback and processing.
- **Realtime transcription:** Explore generating transcripts as recording progresses, so users can see live speech-to-text.
- **Meeting tagging & search:** Add tagging, search, sort, and filter features to help users find past meeting recordings easily.
- **Download options:** Allow users to download recordings, transcripts, and summaries as files.
- **Spotify-like transcription:** Implement interactive transcription where users can tap on a transcript line to play the audio from that exact moment, similar to Spotify lyrics. While audio is playing, animate and highlight the currently spoken transcript line in real time.

---

These points should be refined and prioritized in future development cycles. Contributions and suggestions are welcome.
