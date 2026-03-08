
/**
 * AudioProcessor - Gestisce il campionamento audio in un thread separato.
 * Converte il segnale in ingresso a 16000Hz per Gemini Live API.
 */
class AudioProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.bufferSize = 4096;
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
