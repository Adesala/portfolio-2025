'use client';
import { createContext, useState, useContext, useEffect } from 'react';
import { Howl } from 'howler';
import { unlockAudio } from './SoundInteractionManager';



const MusicContext = createContext();

export function MusicProvider({ children }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState(null);




  useEffect(() => {
    if (typeof window !== 'undefined') {
      const music = new Howl({
        src: ['/images/musique-fond.mp3'],
        loop: true,
        volume: 0,
      });
      setSound(music);
    }
  }, []);


const togglePlay = () => {
  if (!sound) return;

  if (isPlaying) {
    sound.fade(0.30, 0, 3000);
    setTimeout(() => sound.stop(), 3000);
  } else {
    sound.volume(0);
    sound.play();
    sound.fade(0, 0.30, 3000);
  }

  setIsPlaying(!isPlaying);
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

