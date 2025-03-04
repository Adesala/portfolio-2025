'use client'
import { createContext, useState, useRef, useContext } from "react";

const MusicContext = createContext();

export function MusicProvider({ children }) {
  const audioRef = useRef(new Audio("/images/musicfond.mp3"));
  audioRef.current.loop = true;

  const [isPlaying, setIsPlaying] = useState(false);

  const fadeAudio = (audio, fadeTime, type) => {
    let volume = type === "in" ? 0 : 1;
    audio.volume =  Math.min(1, Math.max(0, volume));

    const interval = setInterval(() => {
      if (type === "in") {
        volume += 0.05;
        if (volume >= 1) {
          clearInterval(interval);
          audio.volume = 1;
        }
      } else {
        volume -= 0.05;
        if (volume <= 0) {
          clearInterval(interval);
          audio.pause();
          audio.volume = 0;
        }
      }
      audio.volume =  Math.min(1, Math.max(0, volume));
    }, fadeTime / 20);
  };

  const togglePlay = () => {
    if (isPlaying) {
      fadeAudio(audioRef.current, 1000, "out"); // Fondu de sortie sur 1s
    } else {
      audioRef.current.play();
      fadeAudio(audioRef.current, 1000, "in"); // Fondu d’entrée sur 1s
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
