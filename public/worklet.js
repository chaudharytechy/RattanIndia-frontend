class MicCapture extends AudioWorkletProcessor {
  constructor() {
    super();
    this._buffer = [];
    this._samplesPerChunk = 1600; // 100ms @ 16kHz
  }

  process(inputs) {
    const input = inputs[0];
    if (input.length > 0) {
      const channelData = input[0];
      for (let i = 0; i < channelData.length; i++) {
        const s = Math.max(-1, Math.min(1, channelData[i]));
        const intSample = Math.round(s * 32767);
        this._buffer.push(intSample);
      }

      while (this._buffer.length >= this._samplesPerChunk) {
        const chunk = this._buffer.splice(0, this._samplesPerChunk);
        const int16 = new Int16Array(chunk);
        this.port.postMessage(int16.buffer, [int16.buffer]);
      }
    }

    return true;
  }
}

registerProcessor("mic-capture", MicCapture);
