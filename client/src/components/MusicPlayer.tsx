'use client';

import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { useSounds } from './SoundEffects';

interface MusicPlayerProps {
  enabled?: boolean;
  volume?: number;
}

const MusicPlayer = ({ enabled = true, volume = 0.3 }: MusicPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [musicEnabled, setMusicEnabled] = useState(enabled);
  
  const { sounds } = useSounds();

  // Game background music tracks (using data URLs for simple tones)
  const tracks = [
    {
      name: 'Battle Theme',
      frequency: 440, // A note
      type: 'sawtooth' as OscillatorType
    },
    {
      name: 'Victory Theme', 
      frequency: 523, // C note
      type: 'sine' as OscillatorType
    },
    {
      name: 'Mystery Theme',
      frequency: 330, // E note
      type: 'triangle' as OscillatorType
    }
  ];

  useEffect(() => {
    if (!musicEnabled) return;

    // Initialize AudioContext
    const initAudio = async () => {
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContext();
        setAudioContext(ctx);
      } catch (error) {
        console.warn('Failed to initialize audio context:', error);
      }
    };

    initAudio();

    return () => {
      if (audioContext) {
        audioContext.close();
      }
    };
  }, [musicEnabled]);

  const playBackgroundMusic = () => {
    if (!musicEnabled || !audioContext || isPlaying) return;

    const track = tracks[currentTrack];
    
    try {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      const filterNode = audioContext.createBiquadFilter();

      oscillator.connect(filterNode);
      filterNode.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = track.frequency;
      oscillator.type = track.type;
      
      // Create a gentle, looping background sound
      filterNode.type = 'lowpass';
      filterNode.frequency.value = 1000;
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume * 0.1, audioContext.currentTime + 1);
      gainNode.gain.linearRampToValueAtTime(volume * 0.05, audioContext.currentTime + 2);

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 3);

      setIsPlaying(true);
      
      // Loop to next track
      setTimeout(() => {
        setIsPlaying(false);
        setCurrentTrack((prev) => (prev + 1) % tracks.length);
      }, 3000);

    } catch (error) {
      console.warn('Failed to play background music:', error);
    }
  };

  const stopBackgroundMusic = () => {
    setIsPlaying(false);
  };

  const toggleMusic = () => {
    if (isPlaying) {
      stopBackgroundMusic();
    } else {
      playBackgroundMusic();
    }
  };

  // Auto-play when enabled changes
  useEffect(() => {
    if (musicEnabled && !isPlaying) {
      playBackgroundMusic();
    } else if (!musicEnabled && isPlaying) {
      stopBackgroundMusic();
    }
  }, [musicEnabled]);

  // Handle user interaction for audio activation
  useEffect(() => {
    const handleUserInteraction = () => {
      if (audioContext && audioContext.state === 'suspended') {
        audioContext.resume();
      }
    };

    document.addEventListener('click', handleUserInteraction, { once: true });
    document.addEventListener('touchstart', handleUserInteraction, { once: true });

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, [audioContext]);

  return (
    <div className="fixed top-4 right-4 z-50 bg-black/80 backdrop-blur-sm rounded-lg p-3 border border-white/20">
      <div className="flex items-center space-x-3">
        <button
          onClick={toggleMusic}
          className={`p-2 rounded-lg transition-colors ${
            musicEnabled && isPlaying 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
          }`}
          title={musicEnabled && isPlaying ? 'Pause Music' : 'Play Music'}
        >
          {musicEnabled && isPlaying 
            ? <Volume2 size={18} strokeWidth={1.8} />
            : <VolumeX size={18} strokeWidth={1.8} />
          }
        </button>
        
        <div className="text-white">
          <div className="text-xs opacity-75">Music</div>
          {musicEnabled && (
            <div className="text-xs">
              {tracks[currentTrack].name}
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