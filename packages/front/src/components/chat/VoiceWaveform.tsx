import { useEffect, useRef } from 'react';

interface VoiceWaveformProps {
  analyser: AnalyserNode | null;
  isActive: boolean;
}

export const VoiceWaveform = ({ analyser, isActive }: VoiceWaveformProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const BAR_COUNT = 10;
    const BAR_GAP = 3;

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      if (!analyser || !isActive) {
        // Idle state: static short bars
        const barW = (W - BAR_GAP * (BAR_COUNT - 1)) / BAR_COUNT;
        for (let i = 0; i < BAR_COUNT; i++) {
          const x = i * (barW + BAR_GAP);
          const h = 4;
          ctx.fillStyle = 'rgba(255,255,255,0.3)';
          ctx.beginPath();
          ctx.roundRect(x, (H - h) / 2, barW, h, 2);
          ctx.fill();
        }
        return;
      }

      const data = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(data);

      const barW = (W - BAR_GAP * (BAR_COUNT - 1)) / BAR_COUNT;
      const step = Math.floor(data.length / BAR_COUNT);

      for (let i = 0; i < BAR_COUNT; i++) {
        const value = data[i * step] / 255;
        const minH = 4;
        const maxH = H - 4;
        const h = minH + value * (maxH - minH);
        const x = i * (barW + BAR_GAP);
        const y = (H - h) / 2;

        // Lime gradient: brighter at top
        const gradient = ctx.createLinearGradient(0, y, 0, y + h);
        gradient.addColorStop(0, 'rgba(163,230,53,0.95)');   // lime-400
        gradient.addColorStop(1, 'rgba(101,163,13,0.7)');    // lime-600

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barW, h, 3);
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [analyser, isActive]);

  return (
    <canvas
      ref={canvasRef}
      width={80}
      height={32}
      className="block"
      aria-hidden="true"
    />
  );
};
