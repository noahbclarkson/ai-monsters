import { useEffect, useRef, useState } from 'react';

interface SoundEffectsProps {
  enabled?: boolean;
  volume?: number;
}

const SoundEffects = ({ enabled = true, volume = 0.7 }: SoundEffectsProps) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // Initialize AudioContext
    const initAudio = () => {
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContext();
        masterGainNodeRef.current = audioContextRef.current.createGain();
        masterGainNodeRef.current.connect(audioContextRef.current.destination);
        masterGainNodeRef.current.gain.value = volume;
        setIsInitialized(true);
      } catch (error) {
        console.warn('Failed to initialize audio:', error);
      }
    };

    // Handle user interaction to enable audio
    const handleUserInteraction = () => {
      if (!isInitialized && audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }
    };

    document.addEventListener('click', handleUserInteraction, { once: true });
    document.addEventListener('touchstart', handleUserInteraction, { once: true });

    initAudio();

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, [enabled, volume, isInitialized]);

  const playSound = (frequency: number, duration: number, type: OscillatorType = 'sine') => {
    if (!enabled || !isInitialized || !audioContextRef.current) return;

    try {
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(masterGainNodeRef.current!);

      oscillator.frequency.value = frequency;
      oscillator.type = type;

      gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContextRef.current.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration);

      oscillator.start(audioContextRef.current.currentTime);
      oscillator.stop(audioContextRef.current.currentTime + duration);
    } catch (error) {
      console.warn('Failed to play sound:', error);
    }
  };

  // Public sound API
  const sounds = {
    playCardPlace: () => playSound(800, 0.1, 'sine'),
    playCardFlip: () => {
      playSound(600, 0.05, 'sine');
      setTimeout(() => playSound(800, 0.05, 'sine'), 50);
    },
    playAttack: () => {
      playSound(200, 0.2, 'sawtooth');
      setTimeout(() => playSound(150, 0.3, 'sawtooth'), 100);
    },
    playDefense: () => playSound(400, 0.15, 'triangle'),
    playWin: () => {
      [523, 659, 784, 1047].forEach((freq, i) => {
        setTimeout(() => playSound(freq, 0.3, 'sine'), i * 100);
      });
    },
    playLose: () => {
      [400, 350, 300, 250].forEach((freq, i) => {
        setTimeout(() => playSound(freq, 0.4, 'square'), i * 150);
      });
    },
    playPackOpen: () => {
      [800, 1000, 1200, 1400].forEach((freq, i) => {
        setTimeout(() => playSound(freq, 0.1, 'sine'), i * 80);
      });
    },
    playButton: () => playSound(1000, 0.05, 'sine'),
    playNotification: () => playSound(1200, 0.1, 'sine'),
  };

  return null; // This is a provider component
};

export default SoundEffects;

// Hook for using sounds in other components
export const useSounds = () => {
  const [soundsEnabled, setSoundsEnabled] = useState(true);
  const [volume, setVolume] = useState(0.7);

  // Create a simple sound player for the hook
  const playSimpleSound = (frequency: number, duration: number) => {
    if (!soundsEnabled) return;
    
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      gainNode.gain.value = volume * 0.3;
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
      console.warn('Failed to play simple sound:', error);
    }
  };

  return {
    soundsEnabled,
    setSoundsEnabled,
    volume,
    setVolume,
    sounds: {
      playCardPlace: () => playSimpleSound(800, 0.1),
      playCardFlip: () => {
        playSimpleSound(600, 0.05);
        setTimeout(() => playSimpleSound(800, 0.05), 50);
      },
      playAttack: () => playSimpleSound(200, 0.2),
      playDefense: () => playSimpleSound(400, 0.15),
      playWin: () => [523, 659, 784].forEach((freq, i) => setTimeout(() => playSimpleSound(freq, 0.2), i * 100)),
      playLose: () => [400, 350, 300].forEach((freq, i) => setTimeout(() => playSimpleSound(freq, 0.3), i * 150)),
      playPackOpen: () => [800, 1000, 1200].forEach((freq, i) => setTimeout(() => playSimpleSound(freq, 0.1), i * 80)),
      playButton: () => playSimpleSound(1000, 0.05),
      playNotification: () => playSimpleSound(1200, 0.1),
    },
  };
};