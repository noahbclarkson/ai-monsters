'use client';

import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface MusicPlayerProps {
  enabled?: boolean;
  volume?: number;
}

// Musical chord voicings — consonant intervals that sound pleasant
// Each track is a set of frequencies that harmonize together
const TRACKS = [
  {
    name: 'Battle Theme',
    // Minor chord with fifth — tense, driving
    frequencies: [220, 261.63, 329.63], // Am chord: A3, C4, E4
    beatDuration: 0.8,
  },
  {
    name: 'Victory Theme',
    // Major chord — bright, triumphant
    frequencies: [261.63, 329.63, 392], // C major: C4, E4, G4
    beatDuration: 1.0,
  },
  {
    name: 'Mystery Theme',
    // Whole-tone cluster — ambiguous, ethereal
    frequencies: [196, 233.08, 277.18, 311.13], // D whole-tone cluster
    beatDuration: 1.2,
  },
];

/** Fade in/out over this many seconds at each loop boundary */
const FADE_SECONDS = 0.4;
/** How many beats to play before advancing to next track */
const BEATS_PER_TRACK = 8;

function buildChordOscillator(
  audioCtx: AudioContext,
  destination: AudioNode,
  frequencies: number[],
  volume: number,
  startTime: number,
  duration: number
): OscillatorNode[] {
  const oscs: OscillatorNode[] = [];

  frequencies.forEach((freq, i) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    // Slight detune per voice for a richer, chorus-like texture
    osc.frequency.value = freq;
    osc.detune.value = (i % 2 === 0 ? -8 : 8) + i * 3;

    // Low-pass filter: smooth out the harsh upper harmonics
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 800 + i * 100;
    filter.Q.value = 0.5;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(destination);

    // Fade in/out envelope
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume * 0.06, startTime + FADE_SECONDS);
    gain.gain.setValueAtTime(volume * 0.06, startTime + duration - FADE_SECONDS);
    gain.gain.linearRampToValueAtTime(0, startTime + duration);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);

    oscs.push(osc);
  });

  return oscs;
}

const MusicPlayer = ({ enabled = true, volume = 0.4 }: MusicPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [musicEnabled, setMusicEnabled] = useState(enabled);

  // AudioContext must be kept as a ref — storing it in state causes stale-closure bugs
  // because state updates are async and the cleanup effect captures the wrong value
  const audioCtxRef = useRef<AudioContext | null>(null);
  const nextTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Initialise (or tear down) the AudioContext when the enabled prop changes
  useEffect(() => {
    if (musicEnabled && !audioCtxRef.current) {
      const AudioCtxClass = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtxClass) return;
      audioCtxRef.current = new AudioCtxClass();

      // Master gain — all music routes through this
      const masterGain = audioCtxRef.current.createGain();
      masterGain.gain.value = volume;
      masterGain.connect(audioCtxRef.current.destination);
      gainNodeRef.current = masterGain;
    }

    if (!musicEnabled && audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
      gainNodeRef.current = null;
    }
  }, [musicEnabled, volume]);

  // Stop any scheduled music and clear timeouts
  const stopMusic = () => {
    if (nextTimeoutRef.current) {
      clearTimeout(nextTimeoutRef.current);
      nextTimeoutRef.current = null;
    }
    setIsPlaying(false);
  };

  // Schedule one chord beat and arrange for the next after that
  const scheduleBeat = (trackIndex: number, beatCount: number) => {
    const ctx = audioCtxRef.current;
    const masterGain = gainNodeRef.current;
    if (!ctx || !masterGain || !musicEnabled) return;

    const track = TRACKS[trackIndex];
    const beatDuration = track.beatDuration;
    const totalDuration = beatDuration + FADE_SECONDS * 2;

    buildChordOscillator(ctx, masterGain, track.frequencies, volume, ctx.currentTime, totalDuration);

    if (beatCount < BEATS_PER_TRACK - 1) {
      nextTimeoutRef.current = setTimeout(() => {
        scheduleBeat(trackIndex, beatCount + 1);
      }, beatDuration * 1000);
    } else {
      // End of this track — advance to next after a short pause
      nextTimeoutRef.current = setTimeout(() => {
        setCurrentTrack(prev => (prev + 1) % TRACKS.length);
      }, (beatDuration + 1) * 1000);
    }
  };

  // Watch for track changes and kick off the next sequence
  useEffect(() => {
    if (!isPlaying || !musicEnabled) return;
    scheduleBeat(currentTrack, 0);
    return () => {
      if (nextTimeoutRef.current) clearTimeout(nextTimeoutRef.current);
    };
    // Only restart when the track index changes — not on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentTrack, isPlaying, musicEnabled]);

  const toggleMusic = () => {
    if (isPlaying) {
      stopMusic();
    } else {
      // Resume suspended AudioContext (required after user-gesture gate)
      if (audioCtxRef.current?.state === 'suspended') {
        audioCtxRef.current.resume().catch(() => {});
      }
      setIsPlaying(true);
    }
  };

  // Keep isPlaying in sync when musicEnabled is toggled off
  useEffect(() => {
    if (!musicEnabled && isPlaying) {
      stopMusic();
    }
  }, [musicEnabled, isPlaying]);

  // Attempt to resume AudioContext on first user interaction
  useEffect(() => {
    const resume = () => {
      if (audioCtxRef.current?.state === 'suspended') {
        audioCtxRef.current.resume().catch(() => {});
      }
    };
    document.addEventListener('click', resume, { once: true });
    document.addEventListener('touchstart', resume, { once: true });
    return () => {
      document.removeEventListener('click', resume);
      document.removeEventListener('touchstart', resume);
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (nextTimeoutRef.current) clearTimeout(nextTimeoutRef.current);
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50 bg-black/80 backdrop-blur-sm rounded-lg p-3 border border-white/20">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMusic}
          className={`p-2 rounded-lg transition-colors ${
            isPlaying
              ? 'bg-green-600 text-white'
              : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
          }`}
          title={isPlaying ? 'Pause Music' : 'Play Music'}
        >
          {isPlaying
            ? <Volume2 size={18} strokeWidth={1.8} />
            : <VolumeX size={18} strokeWidth={1.8} />
          }
        </button>

        <div className="text-white">
          <div className="text-xs opacity-75">Music</div>
          {isPlaying && (
            <div className="text-xs">
              {TRACKS[currentTrack].name}
            </div>
          )}
        </div>

        <button
          onClick={() => setMusicEnabled(!musicEnabled)}
          className={`p-1 rounded text-xs transition-colors ${
            musicEnabled
              ? 'text-green-400 hover:text-green-300'
              : 'text-gray-400 hover:text-gray-300'
          }`}
          title={musicEnabled ? 'Disable Music' : 'Enable Music'}
        >
          {musicEnabled ? 'ON' : 'OFF'}
        </button>
      </div>
    </div>
  );
};

export default MusicPlayer;
