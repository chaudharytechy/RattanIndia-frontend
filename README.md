# Revolt Motors Voice Assistant – Frontend

This is the frontend for the **Revolt Motors Voice Assistant**. It connects to the backend via WebSocket, streams microphone input in real-time, and plays back Gemini AI-generated audio responses.

---

## Features

- Live microphone input (captured via Web Audio API)
- Real-time audio streaming to backend (16kHz PCM)
- AI audio + text responses streamed back from Gemini (24kHz PCM)
- Text display of AI messages
- Audio playback using `AudioContext`
- Supports interruption – allows you to speak over the assistant

---

## Folder Structure

frontend/
├── public/
│ └── worklet.js # AudioWorkletProcessor for mic capture
├── src/
│ └── App.js # Main React component
│ └── index.js # React entry point
├── package.json # Project configuration and dependencies
├── package-lock.json # Lock file for reproducible installs
├── README.md # This documentation file





---

## Prerequisites

- Node.js v16 or later
- A running backend WebSocket server (see `../backend/README.md`)
  - Default backend WebSocket URL: `ws://localhost:5000/live`

---
Running the App
npm start


Open your browser at:
http://localhost:3000

Usage
1. Click Connect

This initializes:

Microphone capture (ask for permission)

WebSocket connection to the backend

Audio streaming begins

2. Speak into your mic

Your voice is streamed in real time to the backend Gemini API.

3. Listen to AI reply

Gemini responds with both text and audio, which is played back in your browser.

4. Interrupt

You can speak again before the AI finishes — it will stop and respond to your new input.

5. Click End Call to disconnect

This stops the audio stream, closes the WebSocket, and resets the app.

Audio Notes

Capture Audio:
Uses AudioWorklet to stream mic audio in 16kHz chunks (100ms each)

Playback Audio:
Gemini returns base64-encoded 16-bit PCM audio at 24kHz, converted and played using Web Audio API

Known Issues

Audio playback clarity depends on device microphone and network conditions.

If Gemini quota is exceeded or model is unavailable, backend will close the connection.

Frontend does not currently show loading or error states.



