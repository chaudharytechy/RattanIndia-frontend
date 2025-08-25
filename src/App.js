import { useRef, useState } from "react";

export default function App() {
  const wsRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const captureCtxRef = useRef(null);
  const playbackCtxRef = useRef(null);
  const streamRef = useRef(null);

  const connect = async () => {
    wsRef.current = new WebSocket("ws://localhost:5000/live");
    wsRef.current.binaryType = "arraybuffer";

    wsRef.current.onopen = () => {
      console.log("✅ Connected to backend");
      setConnected(true);

      // Resume playback context on user interaction (some browsers block autoplay)
      if (playbackCtxRef.current?.state === "suspended") {
        playbackCtxRef.current.resume();
      }
    };

    wsRef.current.onmessage = (e) => {
      const msg = JSON.parse(e.data);

      if (msg.type === "text") {
        setMessages((prev) => [...prev, { from: "bot", text: msg.text }]);
      }

      if (msg.type === "audio") {
        const bin = Uint8Array.from(atob(msg.b64), (c) => c.charCodeAt(0));
        const samples = new Int16Array(bin.buffer);

        const f32 = new Float32Array(samples.length);
        for (let i = 0; i < samples.length; i++) {
          const s = samples[i];
          f32[i] = s < 0 ? s / 32768 : s / 32767;
        }

        // Create or reuse AudioContext with proper sample rate
        let ctx = playbackCtxRef.current;
        if (!ctx || ctx.state === "closed") {
          ctx = new AudioContext({ sampleRate: msg.rate || 24000 });
          playbackCtxRef.current = ctx;
        }

        const buffer = ctx.createBuffer(1, f32.length, msg.rate || 24000);
        buffer.copyToChannel(f32, 0);

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.start();
      }
    };

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;

    const captureCtx = new AudioContext({ sampleRate: 16000 });
    captureCtxRef.current = captureCtx;
    playbackCtxRef.current = new AudioContext({ sampleRate: 24000 });

    const src = captureCtx.createMediaStreamSource(stream);
    await captureCtx.audioWorklet.addModule("/worklet.js");
    const micNode = new AudioWorkletNode(captureCtx, "mic-capture");

    micNode.port.onmessage = (event) => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(event.data);
      }
    };

    src.connect(micNode);
  };

  const endCall = () => {
    wsRef.current?.close();
    captureCtxRef.current?.close();
    playbackCtxRef.current?.close();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setConnected(false);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>🎙 Revolt Voice Assistant</h1>
      <button disabled={connected} onClick={connect}>Connect</button>
      <button disabled={!connected} onClick={endCall}>End Call</button>
      <div style={{ marginTop: 20 }}>
        <h3>Conversation</h3>
        <div style={{ border: "1px solid #ccc", padding: 10, minHeight: 100 }}>
          {messages.map((m, i) => (
            <p key={i}><b>{m.from}:</b> {m.text}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
