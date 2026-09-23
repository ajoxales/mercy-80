import { useEffect, useRef } from "react";

const BAR_COUNT = 34;
const BAR_GAP = 2;

interface VoiceWaveformProps {
  audio: HTMLAudioElement | null;
  active: boolean;
}

interface AudioContextConstructor {
  new (contextOptions?: AudioContextOptions): AudioContext;
}

interface Analysis {
  context: AudioContext;
  analyser: AnalyserNode;
  data: Uint8Array<ArrayBuffer>;
}

function getAudioContextCtor(): AudioContextConstructor | null {
  const scope = window as Window & {
    webkitAudioContext?: AudioContextConstructor;
  };
  return window.AudioContext ?? scope.webkitAudioContext ?? null;
}

/**
 * Routes the narration through an analyser. Returns null when Web Audio is
 * unavailable so the caller keeps the element playing untouched.
 */
function connectAnalyser(audio: HTMLAudioElement): Analysis | null {
  const AudioContextCtor = getAudioContextCtor();
  if (!AudioContextCtor) return null;

  try {
    const context = new AudioContextCtor();
    const source = context.createMediaElementSource(audio);
    const analyser = context.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.82;
    source.connect(analyser);
    analyser.connect(context.destination);
    void context.resume();
    return {
      context,
      analyser,
      data: new Uint8Array(new ArrayBuffer(analyser.frequencyBinCount)),
    };
  } catch {
    return null;
  }
}

function VoiceWaveform({ audio, active }: VoiceWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const activeRef = useRef(active);
  activeRef.current = active;

  useEffect(() => {
    const canvas = canvasRef.current;
    const context2d = canvas?.getContext("2d");
    if (!canvas || !context2d) return;

    const analysis = audio ? connectAnalyser(audio) : null;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const levels = new Array<number>(BAR_COUNT).fill(0);
    let frame: number | null = null;
    let tick = 0;

    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      canvas.width = Math.round(canvas.clientWidth * ratio);
      canvas.height = Math.round(canvas.clientHeight * ratio);
      context2d.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    /** Frequency bins are bottom heavy, so sample them on a curve. */
    const sampleAnalyser = ({ analyser, data }: Analysis, index: number) => {
      analyser.getByteFrequencyData(data);
      const position = (index / BAR_COUNT) ** 1.7;
      const bin = Math.min(data.length - 1, Math.floor(position * data.length));
      return data[bin] / 255;
    };

    const sampleSynthetic = (index: number) => {
      const phase = tick / 9 + index * 0.55;
      return (Math.sin(phase) * 0.5 + 0.5) * 0.75 * (0.65 + 0.35 * Math.sin(tick / 23));
    };

    const draw = () => {
      tick += 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const barWidth = (width - BAR_GAP * (BAR_COUNT - 1)) / BAR_COUNT;
      const radius = barWidth / 2;

      context2d.clearRect(0, 0, width, height);

      const gradient = context2d.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, "#e8a598");
      gradient.addColorStop(0.5, "#b76e79");
      gradient.addColorStop(1, "#c7a15a");
      context2d.fillStyle = gradient;

      for (let index = 0; index < BAR_COUNT; index += 1) {
        let level = 0;
        if (activeRef.current && !reduceMotion) {
          level = analysis
            ? sampleAnalyser(analysis, index)
            : sampleSynthetic(index);
        }

        // Taper the ends so the waveform reads as a single ribbon.
        const taper = Math.sin((index / (BAR_COUNT - 1)) * Math.PI) ** 0.6;
        const targetHeight = Math.max(2, level * taper * height);
        levels[index] += (targetHeight - levels[index]) * 0.28;

        const barHeight = Math.max(2, levels[index]);
        const x = index * (barWidth + BAR_GAP);
        const y = (height - barHeight) / 2;
        context2d.beginPath();
        context2d.roundRect(x, y, barWidth, barHeight, radius);
        context2d.fill();
      }

      frame = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    draw();

    return () => {
      window.removeEventListener("resize", resize);
      if (frame !== null) cancelAnimationFrame(frame);
      void analysis?.context.close();
    };
  }, [audio]);

  return <canvas className="voice-waveform" ref={canvasRef} aria-hidden="true" />;
}

export default VoiceWaveform;
