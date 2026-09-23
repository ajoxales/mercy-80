import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import VoiceWaveform from "./VoiceWaveform";
import { createBackgroundMusic, type BackgroundMusic } from "./backgroundMusic";
import {
  backgroundMusicUrl,
  backgroundMusicVolume,
  defaultContent,
  type KeepsakeContent,
  type LetterContent,
} from "./content";

type Scene = "intro" | "letter" | "finale" | "complete";
type UploadKind = "photo" | "audio" | "video";

const STORAGE_KEY = "birthday-keepsake-content-v4";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

function loadLetter(saved: unknown, fallback: LetterContent): LetterContent {
  if (!isRecord(saved)) return fallback;
  const savedSignature = asString(saved.signature, fallback.signature);
  return {
    ...fallback,
    sender: asString(saved.sender, fallback.sender),
    relationship: asString(saved.relationship, fallback.relationship),
    photoCaption: asString(saved.photoCaption, fallback.photoCaption),
    salutation: asString(saved.salutation, fallback.salutation),
    message: asString(saved.message, fallback.message),
    signature:
      savedSignature === "Your loving son,\nDondon" ||
      savedSignature === "Your loving son, Dondon"
        ? fallback.signature
        : savedSignature,
  };
}

function loadContent(): KeepsakeContent {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return defaultContent;
    const parsed: unknown = JSON.parse(saved);
    if (!isRecord(parsed)) return defaultContent;
    const savedLetters = Array.isArray(parsed.letters) ? parsed.letters : [];
    return {
      ...defaultContent,
      celebrant: asString(parsed.celebrant, defaultContent.celebrant),
      fullName: asString(parsed.fullName, defaultContent.fullName),
      closingName: asString(parsed.closingName, defaultContent.closingName),
      eyebrow: asString(parsed.eyebrow, defaultContent.eyebrow),
      title: asString(parsed.title, defaultContent.title),
      subtitle: asString(parsed.subtitle, defaultContent.subtitle),
      finaleTitle: asString(parsed.finaleTitle, defaultContent.finaleTitle),
      finaleMessage: asString(
        parsed.finaleMessage,
        defaultContent.finaleMessage,
      ),
      letters: [
        loadLetter(savedLetters[0], defaultContent.letters[0]),
        loadLetter(savedLetters[1], defaultContent.letters[1]),
      ],
    };
  } catch {
    return defaultContent;
  }
}

/** Flip to true to bring back the “Export video” and “Edit content” controls. */
const SHOW_TOOLBAR: boolean = false;

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0:00";
  const total = Math.floor(seconds);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

function Balloon({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 120 210" aria-hidden="true">
      <ellipse cx="60" cy="66" rx="46" ry="58" />
      <ellipse className="decor-sheen" cx="44" cy="46" rx="13" ry="19" />
      <path className="decor-knot" d="M54 122h12l-6 10z" />
      <path
        className="decor-string"
        d="M60 132c14 22-16 34-2 54s-10 14-2 22"
        fill="none"
      />
    </svg>
  );
}

function Bloom({
  className,
  petals = 6,
}: {
  className: string;
  petals?: number;
}) {
  return (
    <svg className={className} viewBox="0 0 120 120" aria-hidden="true">
      {Array.from({ length: petals }, (_, index) => (
        <ellipse
          key={index}
          cx="60"
          cy="30"
          rx="15"
          ry="27"
          transform={`rotate(${(360 / petals) * index} 60 60)`}
        />
      ))}
      <circle className="decor-heart" cx="60" cy="60" r="11" />
    </svg>
  );
}

function Sprig({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 90 190" aria-hidden="true">
      <path className="decor-stem" d="M45 188C45 130 45 70 45 8" fill="none" />
      {[28, 60, 92, 124].map((y, index) => (
        <g key={y}>
          <ellipse
            cx={index % 2 === 0 ? 24 : 66}
            cy={y}
            rx="19"
            ry="9"
            transform={`rotate(${index % 2 === 0 ? -28 : 28} ${index % 2 === 0 ? 24 : 66} ${y})`}
          />
        </g>
      ))}
    </svg>
  );
}

function BackgroundDecor() {
  return (
    <div className="decor" aria-hidden="true">
      <Balloon className="decor-item decor-balloon decor-balloon--one" />
      <Balloon className="decor-item decor-balloon decor-balloon--two" />
      <Balloon className="decor-item decor-balloon decor-balloon--three" />
      <Bloom className="decor-item decor-bloom decor-bloom--one" petals={6} />
      <Bloom className="decor-item decor-bloom decor-bloom--two" petals={8} />
      <Bloom className="decor-item decor-bloom decor-bloom--three" petals={5} />
      <Bloom className="decor-item decor-bloom decor-bloom--four" petals={7} />
      <Sprig className="decor-item decor-sprig decor-sprig--one" />
      <Sprig className="decor-item decor-sprig decor-sprig--two" />
    </div>
  );
}

function AmbientParticles({ celebration = false }: { celebration?: boolean }) {
  const particles = useMemo(
    () =>
      Array.from({ length: celebration ? 72 : 24 }, (_, index) => ({
        id: index,
        left: (index * 37 + 11) % 100,
        delay: (index * 0.37) % 7,
        duration: 6 + (index % 7),
        size: 4 + (index % 5) * 2,
        petal: index % 4 === 0,
      })),
    [celebration],
  );

  return (
    <div
      className={`particles ${celebration ? "particles--celebration" : ""}`}
      aria-hidden="true"
    >
      {particles.map((particle) => (
        <i
          className={particle.petal ? "petal" : "bokeh"}
          key={particle.id}
          style={
            {
              "--left": `${particle.left}%`,
              "--delay": `${particle.delay}s`,
              "--duration": `${particle.duration}s`,
              "--size": `${particle.size}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

interface EnvelopeProps {
  open: boolean;
  exiting?: boolean;
  ornate?: boolean;
  children: React.ReactNode;
}

function Envelope({
  open,
  exiting = false,
  ornate = false,
  children,
}: EnvelopeProps) {
  return (
    <div
      className={`envelope-stage ${open ? "is-open" : ""} ${exiting ? "is-exiting" : ""}`}
    >
      <div className={`envelope ${ornate ? "envelope--ornate" : ""}`}>
        <div className="envelope__back" />
        <div className="envelope__contents">{children}</div>
        <div className="envelope__pocket">
          <span className="pocket-line pocket-line--left" />
          <span className="pocket-line pocket-line--right" />
        </div>
        <div className="envelope__flap" />
        <div className="wax-seal" aria-hidden="true">
          <span>{ornate ? "80" : "❤"}</span>
        </div>
      </div>
    </div>
  );
}

interface LetterSceneProps {
  letter: LetterContent;
  celebrantName: string;
  position: number;
  exiting: boolean;
  onComplete: () => void;
}

function LetterScene({
  letter,
  celebrantName,
  position,
  exiting,
  onComplete,
}: LetterSceneProps) {
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [narrationAudio, setNarrationAudio] = useState<HTMLAudioElement | null>(
    null,
  );
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(0);
  const paperRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const rafRef = useRef<number | null>(null);
  const overrideUntilRef = useRef(0);
  const progressRef = useRef(0);
  const completedRef = useRef(false);

  const finish = useCallback(() => {
    if (completedRef.current) return;
    completedRef.current = true;
    progressRef.current = 1;
    window.setTimeout(onComplete, 1000);
  }, [onComplete]);

  useEffect(() => {
    const openTimer = window.setTimeout(() => setOpen(true), 650);
    return () => window.clearTimeout(openTimer);
  }, []);

  useEffect(() => {
    if (!open) return;
    const paper = paperRef.current;
    if (!paper) return;
    const narrationText = `${letter.salutation} ${letter.message} ${letter.signature}`;
    let speechStart = 0;
    const estimatedSpeechDuration = Math.max(
      12,
      narrationText.split(/\s+/).length / 2.35,
    );

    let displayedProgress = 0;

    const animateScroll = () => {
      const audio = audioRef.current;
      if (
        audio &&
        Number.isFinite(audio.duration) &&
        audio.duration > 0 &&
        !audio.paused
      ) {
        progressRef.current = Math.min(1, audio.currentTime / audio.duration);
      }

      displayedProgress += (progressRef.current - displayedProgress) * 0.12;
      const maxScroll = Math.max(0, paper.scrollHeight - paper.clientHeight);
      const target = displayedProgress * maxScroll;

      if (Date.now() > overrideUntilRef.current) {
        const next = paper.scrollTop + (target - paper.scrollTop) * 0.16;
        paper.scrollTop = Math.abs(target - next) < 0.35 ? target : next;
      }
      rafRef.current = requestAnimationFrame(animateScroll);
    };

    const startTimer = window.setTimeout(() => {
      setPlaying(true);
      animateScroll();

      if (letter.audioUrl) {
        const audio = new Audio(letter.audioUrl);
        audioRef.current = audio;
        audio.preload = "auto";
        setNarrationAudio(audio);
        audio.ontimeupdate = () => {
          if (Number.isFinite(audio.duration) && audio.duration > 0) {
            progressRef.current = Math.min(
              1,
              audio.currentTime / audio.duration,
            );
          }
        };
        audio.onended = finish;
        audio.onerror = finish;
        void audio.play().catch(() => {
          setPlaying(false);
        });
        return;
      }

      const utterance = new SpeechSynthesisUtterance(narrationText);
      utteranceRef.current = utterance;
      utterance.rate = 0.88;
      utterance.pitch = 0.96;
      utterance.onboundary = (event: SpeechSynthesisEvent) => {
        progressRef.current = Math.min(
          0.98,
          event.charIndex / narrationText.length,
        );
      };
      utterance.onend = finish;
      speechStart = performance.now();
      window.speechSynthesis.speak(utterance);
    }, 1350);

    const speechProgressTimer = window.setInterval(() => {
      if (!letter.audioUrl && speechStart > 0 && !completedRef.current) {
        progressRef.current = Math.min(
          0.97,
          (performance.now() - speechStart) / 1000 / estimatedSpeechDuration,
        );
      }
    }, 100);

    const clockTimer = window.setInterval(() => {
      const audio = audioRef.current;
      if (audio && Number.isFinite(audio.duration) && audio.duration > 0) {
        setElapsed(audio.currentTime);
        setDuration(audio.duration);
      } else if (speechStart > 0) {
        setElapsed(
          Math.min(
            estimatedSpeechDuration,
            (performance.now() - speechStart) / 1000,
          ),
        );
        setDuration(estimatedSpeechDuration);
      }
    }, 250);

    return () => {
      window.clearTimeout(startTimer);
      window.clearInterval(speechProgressTimer);
      window.clearInterval(clockTimer);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      audioRef.current?.pause();
      if (utteranceRef.current) window.speechSynthesis.cancel();
    };
  }, [finish, letter, open]);

  const noteManualScroll = () => {
    overrideUntilRef.current = Date.now() + 2000;
  };

  const toggleNarration = () => {
    const audio = audioRef.current;
    if (audio) {
      if (audio.paused) {
        void audio.play();
        setPlaying(true);
      } else {
        audio.pause();
        setPlaying(false);
      }
      return;
    }
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setPlaying(true);
    } else {
      window.speechSynthesis.pause();
      setPlaying(false);
    }
  };

  return (
    <section className="scene letter-scene" aria-label={`Letter ${position}`}>
      <div className="scene-heading">
        <span>With love, always</span>
        <h2>A letter from {letter.sender}</h2>
      </div>
      <Envelope open={open} exiting={exiting}>
        <div className="letter-layout">
          <figure className="polaroid">
            <img
              src={letter.photoUrl}
              alt={`${letter.sender} with ${celebrantName}`}
            />
            <figcaption>{letter.photoCaption}</figcaption>
          </figure>
          <div className="letter-column">
            <article
              className="letter-paper"
              ref={paperRef}
              onWheel={noteManualScroll}
              onTouchMove={noteManualScroll}
            >
              <div className="letter-paper__inner">
                <h3>{letter.salutation}</h3>
                {letter.message.split("\n\n").map((paragraph, index) => (
                  <p key={`${letter.id}-p-${index}`}>{paragraph}</p>
                ))}
                <p className="signature">{letter.signature}</p>
                <span className="letter-flourish">❦</span>
              </div>
            </article>
            <div className="voice-bar">
              <button
                className="voice-bar__toggle"
                type="button"
                onClick={toggleNarration}
                aria-label={
                  playing ? "Pause voice message" : "Play voice message"
                }
              >
                <span aria-hidden="true">{playing ? "❚❚" : "▶"}</span>
              </button>
              <VoiceWaveform audio={narrationAudio} active={playing} />
              <span className="voice-bar__time">
                {formatTime(elapsed)}
                <i aria-hidden="true">/</i>
                {formatTime(duration)}
              </span>
            </div>
          </div>
        </div>
      </Envelope>
    </section>
  );
}

interface FinaleSceneProps {
  content: KeepsakeContent;
  onComplete: () => void;
}

function FinaleScene({ content, onComplete }: FinaleSceneProps) {
  const [open, setOpen] = useState(false);
  const [reveal, setReveal] = useState(false);
  const [fallbackProgress, setFallbackProgress] = useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => setOpen(true), 700);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => setReveal(true), 1600);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!reveal || content.videoUrl) return;
    const startedAt = performance.now();
    const timer = window.setInterval(() => {
      const progress = Math.min(1, (performance.now() - startedAt) / 8000);
      setFallbackProgress(progress);
      if (progress === 1) {
        window.clearInterval(timer);
        onComplete();
      }
    }, 100);
    return () => window.clearInterval(timer);
  }, [content.videoUrl, onComplete, reveal]);

  return (
    <section className="scene finale-scene" aria-label="Final video greeting">
      <div className="scene-heading">
        <span>And one more surprise…</span>
        <h2>{content.finaleMessage}</h2>
      </div>
      <Envelope open={open} ornate>
        <div className="video-card">
          <div className="video-frame">
            {reveal && content.videoUrl ? (
              <video
                src={content.videoUrl}
                autoPlay
                playsInline
                controls
                onEnded={onComplete}
                aria-label="Birthday video greeting"
              />
            ) : (
              <div className="video-placeholder">
                <span className="video-placeholder__rings" aria-hidden="true">
                  80
                </span>
                <p>
                  {content.videoUrl
                    ? "A surprise for you, Ma"
                    : "Your family film will play here"}
                </p>
                <small>
                  {content.videoUrl
                    ? "The greeting is about to begin"
                    : "Add it anytime with “Edit content”"}
                </small>
                <span className="demo-progress">
                  <i style={{ transform: `scaleX(${fallbackProgress})` }} />
                </span>
              </div>
            )}
          </div>
          <h3>{content.finaleTitle}</h3>
        </div>
      </Envelope>
    </section>
  );
}

interface EditorProps {
  content: KeepsakeContent;
  onChange: (content: KeepsakeContent) => void;
  onClose: () => void;
}

function ContentEditor({ content, onChange, onClose }: EditorProps) {
  const updateLetter = (index: 0 | 1, patch: Partial<LetterContent>) => {
    const letters: [LetterContent, LetterContent] = [...content.letters];
    letters[index] = { ...letters[index], ...patch };
    onChange({ ...content, letters });
  };

  const loadFile = (kind: UploadKind, index: 0 | 1 | null, file?: File) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (kind === "video") {
      onChange({ ...content, videoUrl: url });
    } else if (index !== null) {
      updateLetter(
        index,
        kind === "photo" ? { photoUrl: url } : { audioUrl: url },
      );
    }
  };

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className="editor"
        role="dialog"
        aria-modal="true"
        aria-labelledby="editor-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="editor__header">
          <div>
            <span>Make it yours</span>
            <h2 id="editor-title">Edit keepsake content</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close editor">
            ×
          </button>
        </header>
        <div className="editor__body">
          <label>
            Celebrant name
            <input
              value={content.celebrant}
              onChange={(event) =>
                onChange({ ...content, celebrant: event.target.value })
              }
            />
          </label>
          <label>
            Full name
            <input
              value={content.fullName}
              onChange={(event) =>
                onChange({ ...content, fullName: event.target.value })
              }
            />
          </label>
          <label>
            Closing name
            <input
              value={content.closingName}
              onChange={(event) =>
                onChange({ ...content, closingName: event.target.value })
              }
            />
          </label>
          <label>
            Opening title
            <input
              value={content.title}
              onChange={(event) =>
                onChange({ ...content, title: event.target.value })
              }
            />
          </label>
          <label className="field-wide">
            Opening note
            <textarea
              value={content.subtitle}
              onChange={(event) =>
                onChange({ ...content, subtitle: event.target.value })
              }
            />
          </label>
          {content.letters.map((letter, arrayIndex) => {
            const index: 0 | 1 = arrayIndex === 0 ? 0 : 1;
            return (
              <fieldset className="field-wide" key={letter.id}>
                <legend>Letter {index + 1}</legend>
                <div className="editor__grid">
                  <label>
                    Sender
                    <input
                      value={letter.sender}
                      onChange={(event) =>
                        updateLetter(index, { sender: event.target.value })
                      }
                    />
                  </label>
                  <label>
                    Relationship
                    <input
                      value={letter.relationship}
                      onChange={(event) =>
                        updateLetter(index, {
                          relationship: event.target.value,
                        })
                      }
                    />
                  </label>
                  <label>
                    Photo caption
                    <input
                      value={letter.photoCaption}
                      onChange={(event) =>
                        updateLetter(index, {
                          photoCaption: event.target.value,
                        })
                      }
                    />
                  </label>
                  <label className="field-wide">
                    Greeting
                    <input
                      value={letter.salutation}
                      onChange={(event) =>
                        updateLetter(index, { salutation: event.target.value })
                      }
                    />
                  </label>
                  <label className="field-wide">
                    Letter message
                    <textarea
                      rows={8}
                      value={letter.message}
                      onChange={(event) =>
                        updateLetter(index, { message: event.target.value })
                      }
                    />
                  </label>
                  <label>
                    Signature
                    <textarea
                      value={letter.signature}
                      onChange={(event) =>
                        updateLetter(index, { signature: event.target.value })
                      }
                    />
                  </label>
                  <div className="upload-pair">
                    <label className="file-field">
                      Replace photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(event) =>
                          loadFile("photo", index, event.target.files?.[0])
                        }
                      />
                    </label>
                    <label className="file-field">
                      Add voice audio
                      <input
                        type="file"
                        accept=".mp3,.m4a,audio/*"
                        onChange={(event) =>
                          loadFile("audio", index, event.target.files?.[0])
                        }
                      />
                    </label>
                  </div>
                </div>
              </fieldset>
            );
          })}
          <fieldset className="field-wide">
            <legend>Grand finale</legend>
            <div className="editor__grid">
              <label>
                Finale title
                <input
                  value={content.finaleTitle}
                  onChange={(event) =>
                    onChange({ ...content, finaleTitle: event.target.value })
                  }
                />
              </label>
              <label className="file-field">
                Replace ending video
                <input
                  type="file"
                  accept="video/*"
                  onChange={(event) =>
                    loadFile("video", null, event.target.files?.[0])
                  }
                />
              </label>
            </div>
          </fieldset>
        </div>
        <footer className="editor__footer">
          <button
            className="text-button"
            type="button"
            onClick={() => onChange(defaultContent)}
          >
            Restore template
          </button>
          <button
            className="primary-button primary-button--small"
            type="button"
            onClick={onClose}
          >
            Save keepsake
          </button>
        </footer>
      </section>
    </div>
  );
}

function App() {
  const [content, setContent] = useState<KeepsakeContent>(loadContent);
  const [scene, setScene] = useState<Scene>("intro");
  const [letterIndex, setLetterIndex] = useState<0 | 1>(0);
  const [exiting, setExiting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [recording, setRecording] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const musicRef = useRef<HTMLAudioElement>(null);
  const gaplessMusicRef = useRef<BackgroundMusic | null>(null);

  useEffect(() => {
    if (musicRef.current) musicRef.current.volume = backgroundMusicVolume;

    const music = createBackgroundMusic(
      backgroundMusicUrl,
      backgroundMusicVolume,
    );
    gaplessMusicRef.current = music;
    return () => {
      music.dispose();
      gaplessMusicRef.current = null;
    };
  }, []);

  useEffect(() => {
    const serializable: KeepsakeContent = {
      ...content,
      videoUrl: "",
      letters: [
        { ...content.letters[0], photoUrl: "", audioUrl: "" },
        { ...content.letters[1], photoUrl: "", audioUrl: "" },
      ],
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable));
  }, [content]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [scene, letterIndex]);

  const playFallbackMusic = () => {
    const music = musicRef.current;
    if (!music || !music.paused) return;
    music.play().catch(() => {
      const retry = () => {
        music.play().catch(() => undefined);
      };
      window.addEventListener("pointerdown", retry, { once: true });
      window.addEventListener("keydown", retry, { once: true });
    });
  };

  const playBackgroundMusic = () => {
    const gapless = gaplessMusicRef.current;
    if (!gapless) {
      playFallbackMusic();
      return;
    }
    void gapless.start().then((started) => {
      if (!started) playFallbackMusic();
    });
  };

  const startExperience = () => {
    window.speechSynthesis.cancel();
    playBackgroundMusic();
    setLetterIndex(0);
    setExiting(false);
    setScene("letter");
  };

  const finishLetter = useCallback(() => {
    setExiting(true);
    window.setTimeout(() => {
      setExiting(false);
      if (letterIndex === 0) {
        setLetterIndex(1);
      } else {
        setScene("finale");
      }
    }, 1250);
  }, [letterIndex]);

  const replay = () => {
    setScene("intro");
    setLetterIndex(0);
    setExiting(false);
  };

  const stopRecording = useCallback(() => {
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  }, []);

  /** Ends the capture a beat after the confetti so the finale is included. */
  useEffect(() => {
    if (!recording || scene !== "complete") return;
    const timer = window.setTimeout(stopRecording, 4500);
    return () => window.clearTimeout(timer);
  }, [recording, scene, stopRecording]);

  /** The toolbar is hidden while capturing, so Escape is the manual way out. */
  useEffect(() => {
    if (!recording) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") stopRecording();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [recording, stopRecording]);

  const toggleRecording = async () => {
    if (recorderRef.current?.state === "recording") {
      stopRecording();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      const supportedTypes = [
        "video/mp4",
        "video/webm;codecs=vp9,opus",
        "video/webm",
      ];
      const mimeType =
        supportedTypes.find((type) => MediaRecorder.isTypeSupported(type)) ??
        "";
      const recorder = new MediaRecorder(
        stream,
        mimeType ? { mimeType } : undefined,
      );
      chunksRef.current = [];
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const type = recorder.mimeType || "video/webm";
        const blob = new Blob(chunksRef.current, { type });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = `mercedes-at-80.${type.includes("mp4") ? "mp4" : "webm"}`;
        anchor.click();
        URL.revokeObjectURL(url);
        stream.getTracks().forEach((track) => track.stop());
        setRecording(false);
      };
      stream.getVideoTracks()[0]?.addEventListener("ended", () => {
        if (recorder.state === "recording") recorder.stop();
      });
      recorder.start(1000);
      setRecording(true);

      // Play the keepsake through from the title card so the capture is complete.
      replay();
      window.setTimeout(startExperience, 2200);
    } catch {
      setRecording(false);
    }
  };

  return (
    <main
      className={`app scene-${scene}${recording ? " is-capturing" : ""}${
        SHOW_TOOLBAR ? "" : " no-toolbar"
      }`}
    >
      <audio ref={musicRef} src={backgroundMusicUrl} loop preload="auto" />
      <AmbientParticles celebration={scene === "complete"} />
      <BackgroundDecor />
      <div className="marble-wash" aria-hidden="true" />
      <header className="topbar" hidden={!SHOW_TOOLBAR}>
        <div className="topbar__actions">
          <button
            className={
              recording ? "utility-button is-recording" : "utility-button"
            }
            type="button"
            onClick={toggleRecording}
          >
            <span className="record-dot" />
            {recording ? "Stop & download" : "Export video"}
          </button>
          <button
            className="utility-button"
            type="button"
            onClick={() => setEditing(true)}
          >
            <span aria-hidden="true">✦</span>
            Edit content
          </button>
        </div>
      </header>

      {scene === "intro" && (
        <section className="scene intro-scene">
          <p className="eyebrow">{content.eyebrow}</p>
          <h1>{content.title}</h1>
          <p className="intro-copy">{content.subtitle}</p>
          <button
            className="primary-button"
            type="button"
            onClick={startExperience}
          >
            <span className="button-sparkle" aria-hidden="true">
              ✦
            </span>
            Open {content.celebrant}’s Keepsake
            <span className="button-arrow" aria-hidden="true">
              →
            </span>
          </button>

          <div className="intro-bloom intro-bloom--left" aria-hidden="true">
            ❀
          </div>
          <div className="intro-bloom intro-bloom--right" aria-hidden="true">
            ❀
          </div>
        </section>
      )}

      {scene === "letter" && (
        <LetterScene
          key={content.letters[letterIndex].id}
          letter={content.letters[letterIndex]}
          celebrantName={content.fullName}
          position={letterIndex + 1}
          exiting={exiting}
          onComplete={finishLetter}
        />
      )}

      {scene === "finale" && (
        <FinaleScene
          content={content}
          onComplete={() => setScene("complete")}
        />
      )}

      {scene === "complete" && (
        <section className="scene complete-scene">
          <div className="final-medallion">
            <span>80</span>
          </div>
          <p className="eyebrow">Eight decades, countless memories</p>
          <h1>
            Happy Birthday,
            <br />
            <em>{content.closingName}</em>
          </h1>
          <br />
          <button className="primary-button" type="button" onClick={replay}>
            <span aria-hidden="true">↻</span>
            Replay Celebration
          </button>
          <span className="final-signoff">With all our love</span>
        </section>
      )}

      {editing && (
        <ContentEditor
          content={content}
          onChange={setContent}
          onClose={() => setEditing(false)}
        />
      )}
    </main>
  );
}

export default App;
