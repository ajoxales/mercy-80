const SILENCE_THRESHOLD = 0.0025;
const FADE_IN_SECONDS = 1.2;

interface AudioContextConstructor {
  new (contextOptions?: AudioContextOptions): AudioContext;
}

interface LoopBounds {
  loopStart: number;
  loopEnd: number;
}

export interface BackgroundMusic {
  /** Resolves false when Web Audio is unavailable, so the caller can fall back. */
  start: () => Promise<boolean>;
  setVolume: (volume: number) => void;
  dispose: () => void;
}

function getAudioContextCtor(): AudioContextConstructor | null {
  const scope = window as Window & { webkitAudioContext?: AudioContextConstructor };
  return window.AudioContext ?? scope.webkitAudioContext ?? null;
}

function peakAt(channels: Float32Array[], index: number): number {
  let peak = 0;
  for (const channel of channels) {
    const value = Math.abs(channel[index]);
    if (value > peak) peak = value;
  }
  return peak;
}

/**
 * MP3 encoders pad the start and end of a file with silence, which is what
 * makes `<audio loop>` sound gapped. Trimming that padding lets the buffer
 * source wrap around on a sample boundary instead.
 */
function findLoopBounds(buffer: AudioBuffer): LoopBounds {
  const channels: Float32Array[] = [];
  for (let index = 0; index < buffer.numberOfChannels; index += 1) {
    channels.push(buffer.getChannelData(index));
  }

  let head = 0;
  while (head < buffer.length && peakAt(channels, head) < SILENCE_THRESHOLD) {
    head += 1;
  }

  let tail = buffer.length - 1;
  while (tail > head && peakAt(channels, tail) < SILENCE_THRESHOLD) {
    tail -= 1;
  }

  if (tail <= head) {
    return { loopStart: 0, loopEnd: buffer.duration };
  }

  return {
    loopStart: head / buffer.sampleRate,
    loopEnd: (tail + 1) / buffer.sampleRate,
  };
}

export function createBackgroundMusic(url: string, volume: number): BackgroundMusic {
  let context: AudioContext | null = null;
  let gain: GainNode | null = null;
  let source: AudioBufferSourceNode | null = null;
  let currentVolume = volume;
  let disposed = false;

  const start = async (): Promise<boolean> => {
    if (disposed || source) return true;

    const AudioContextCtor = getAudioContextCtor();
    if (!AudioContextCtor) return false;

    try {
      context = context ?? new AudioContextCtor();
      if (context.state === "suspended") await context.resume();

      const response = await fetch(url);
      if (!response.ok) return false;
      const buffer = await context.decodeAudioData(await response.arrayBuffer());
      if (disposed) return false;

      const { loopStart, loopEnd } = findLoopBounds(buffer);

      gain = context.createGain();
      gain.gain.setValueAtTime(0, context.currentTime);
      gain.gain.linearRampToValueAtTime(
        currentVolume,
        context.currentTime + FADE_IN_SECONDS,
      );
      gain.connect(context.destination);

      source = context.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      source.loopStart = loopStart;
      source.loopEnd = loopEnd;
      source.connect(gain);
      source.start(0, loopStart);
      return true;
    } catch {
      return false;
    }
  };

  const setVolume = (next: number): void => {
    currentVolume = next;
    if (gain && context) {
      gain.gain.linearRampToValueAtTime(next, context.currentTime + 0.25);
    }
  };

  const dispose = (): void => {
    disposed = true;
    source?.stop();
    source?.disconnect();
    gain?.disconnect();
    void context?.close();
    source = null;
    gain = null;
    context = null;
  };

  return { start, setVolume, dispose };
}
