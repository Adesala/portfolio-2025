'use client';
import { createContext, useState, useContext, useEffect } from 'react';
import { Howl } from 'howler';

const MusicContext = createContext();

export function MusicProvider({ children }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const music = new Howl({
        src: ['/images/musicfond.mp3'],
        loop: true,
        volume: 0,
      });
      setSound(music);
    }
  }, []);

  const fadeAudio = (audio, fadeTime, type) => {
    let volume = type === 'in' ? 0 : 1;
    audio.volume(volume);

    const interval = setInterval(() => {
      if (type === 'in') {
        volume += 0.05;
        if (volume >= 1) {
          clearInterval(interval);
          audio.volume(1);
        }
      } else {
        volume -= 0.05;
        if (volume <= 0) {
          clearInterval(interval);
          audio.stop();
        }
      }
      audio.volume(Math.min(1, Math.max(0, volume)));
    }, fadeTime / 20);
  };

  const togglePlay = () => {
    if (sound) {
      if (isPlaying) {
        fadeAudio(sound, 1000, 'out');
      } else {
        sound.play();
        fadeAudio(sound, 1000, 'in');
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <MusicContext.Provider value={{ isPlaying, togglePlay }}>
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  return useContext(MusicContext);
}

