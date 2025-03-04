'use client'
import { createContext, useState, useRef, useContext, useEffect } from "react";

const MusicContext = createContext();

export function MusicProvider({ children }) {
  const [isClient, setIsClient] = useState(false);

  // Utilisation de useRef pour conserver l'audio
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Assurez-vous que le code ne s'exécute que côté client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const audio = new Audio("/images/musicfond.mp3");
      audio.loop = true;
      audioRef.current = audio;
      setIsClient(true); // Le client est maintenant prêt
    }
  }, []);

  // Fonction pour effectuer un fade (augmentation ou diminution du volume)
  const fadeAudio = (audio, fadeTime, type) => {
    let volume = type === "in" ? 0 : 1;
    audio.volume = Math.min(1, Math.max(0, volume));

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
      audio.volume = Math.min(1, Math.max(0, volume));
    }, fadeTime / 20);
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        fadeAudio(audioRef.current, 1000, "out"); // Fondu de sortie sur 1s
      } else {
        audioRef.current.play();
        fadeAudio(audioRef.current, 1000, "in"); // Fondu d’entrée sur 1s
      }
      setIsPlaying(!isPlaying);
    }
  };

  if (!isClient) {
    return null; // Ne pas rendre le composant tant que le client n'est pas prêt
  }

  return (
    <MusicContext.Provider value={{ isPlaying, togglePlay }}>
      {children}
    </MusicContext.Provider>
  );
}

export function useMusic() {
  return useContext(MusicContext);
}
