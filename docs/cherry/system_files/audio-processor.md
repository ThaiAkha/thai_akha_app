# 🎙️ Audio Processor (Gemini Live Engine)

**Source File:** `packages/front/public/audio-processor.js`  
**Description:** The low-level audio worklet that handles real-time sampling for Gemini Live (Voice Mode). It runs in its own thread to ensure zero UI lag.

---

## 📄 Full File Content (1:1 with Code)

```javascript
/**
 * AudioProcessor - Gestisce il campionamento audio in un thread separato.
 * Converte il segnale in ingresso a 16000Hz per Gemini Live API.
 */
class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.bufferSize = 1024; // MODIFIED: Aumentato a 1024 per ridurre messaggi WebSocket
    this.buffer = new Float32Array(this.bufferSize);
    this.bufferIndex = 0;
  }

  process(inputs) {
    const input = inputs[0];
    if (!input || !input[0]) return true;

    const channelData = input[0];
    
    for (let i = 0; i < channelData.length; i++) {
      this.buffer[this.bufferIndex++] = channelData[i];
      
      if (this.bufferIndex >= this.bufferSize) {
        // Inviamo il chunk di dati Float32 al thread principale
        this.port.postMessage(this.buffer);
        this.bufferIndex = 0;
        // Non resettiamo l'array per performance, lo sovrascriviamo
      }
    }

    return true;
  }
}

registerProcessor('audio-processor', AudioProcessor);
```

---

## ⚡ Performance optimization (April 2026)
As per the recent performance audit, the `bufferSize` was increased from 512 to **1024 samples**.
- **Reason**: Reduced WebSocket message frequency from ~62Hz to **~31Hz**.
- **Impact**: Significant reduction in CPU overhead and background communication traffic, while maintaining an acceptable input latency of **64ms**.
