import React, { useEffect, useRef } from 'react';

interface LiveEcgWaveformProps {
  ecgSampleRef: React.MutableRefObject<number>;
  isPaused: boolean;
  bpm: number;
}

export const LiveEcgWaveform: React.FC<LiveEcgWaveformProps> = ({
  ecgSampleRef,
  isPaused,
  bpm,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pausedRef = useRef(isPaused);
  pausedRef.current = isPaused;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLen = 140;
    const samples = new Float32Array(bufferLen);
    let animId = 0;
    let lastDraw = 0;

    const renderWave = (ts: number) => {
      animId = requestAnimationFrame(renderWave);
      if (ts - lastDraw < 28) return;
      lastDraw = ts;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const cssW = canvas.clientWidth || 320;
      const cssH = canvas.clientHeight || 110;
      if (canvas.width !== Math.floor(cssW * dpr) || canvas.height !== Math.floor(cssH * dpr)) {
        canvas.width = Math.floor(cssW * dpr);
        canvas.height = Math.floor(cssH * dpr);
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, cssW, cssH);

      if (!pausedRef.current) {
        for (let i = 0; i < bufferLen - 1; i++) {
          samples[i] = samples[i + 1];
        }
        samples[bufferLen - 1] = ecgSampleRef.current;
      }

      // Subtle clinical grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.09)';
      ctx.lineWidth = 1;
      for (const ratio of [0.24, 0.56, 0.84]) {
        const gy = Math.round(cssH * ratio) + 0.5;
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(cssW, gy);
        ctx.stroke();
      }

      const baseline = cssH * 0.58;
      const amp = cssH * 0.34;

      // Hodan Teal-to-White-to-Amber clinical ECG waveform stroke
      const grad = ctx.createLinearGradient(0, 0, cssW, 0);
      grad.addColorStop(0, 'rgba(45, 212, 191, 0.08)');
      grad.addColorStop(0.28, 'rgba(153, 246, 228, 0.78)');
      grad.addColorStop(0.84, 'rgba(255, 255, 255, 0.96)');
      grad.addColorStop(1, 'rgba(234, 158, 36, 0.45)');

      ctx.strokeStyle = grad;
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      for (let i = 0; i < bufferLen; i++) {
        const x = (i / (bufferLen - 1)) * cssW;
        const y = baseline - samples[i] * amp;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Highlighted heart marker along the active lead point (~68% across)
      const markerIndex = Math.floor(bufferLen * 0.68);
      const mx = (markerIndex / (bufferLen - 1)) * cssW;
      const my = baseline - samples[markerIndex] * amp;

      // Vertical dashed connector up toward SpO2 97% badge
      ctx.save();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.48)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(mx, 8);
      ctx.lineTo(mx, my - 10);
      ctx.stroke();
      ctx.restore();

      // Teal heart marker matching Hodan brand & reference composition
      ctx.save();
      ctx.translate(mx, my);
      ctx.fillStyle = '#2DD4BF';
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(0, 5.5);
      ctx.bezierCurveTo(-1.5, 4, -8.5, -1, -8.5, -5.2);
      ctx.bezierCurveTo(-8.5, -8.8, -3.2, -9.8, 0, -5.5);
      ctx.bezierCurveTo(3.2, -9.8, 8.5, -8.8, 8.5, -5.2);
      ctx.bezierCurveTo(8.5, -1, 1.5, 4, 0, 5.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      ctx.restore();
    };

    animId = requestAnimationFrame(renderWave);
    return () => cancelAnimationFrame(animId);
  }, [ecgSampleRef]);

  return (
    <div className="relative w-full">
      {/* SpO2 97% & BPM clinical readout anchored above waveform marker */}
      <div className="mb-1 flex items-center justify-end pr-[12%]">
        <div className="inline-flex items-center gap-2.5 rounded-full bg-white/95 px-3.5 py-1 text-xs font-medium text-slate-900 shadow-lg tabular-nums">
          <span className="text-slate-500">SpO2</span>
          <span className="font-semibold text-slate-950">97%</span>
          <span className="text-slate-300" aria-hidden="true">·</span>
          <span className="font-mono text-[11px] font-semibold text-[#1F6E7A]">{bpm} BPM</span>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className="h-28 w-full"
        aria-label="Synchronized cardiac pulse and ECG waveform"
      />
    </div>
  );
};
