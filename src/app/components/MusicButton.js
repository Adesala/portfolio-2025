'use client'
import { useMusic } from "../components/MusicProvider/MusicProvider";
import styles from '../assets/home.module.scss';

export default function MusicButton() {
  const { isPlaying, togglePlay } = useMusic();

  return <button className={styles.musicButton} onClick={togglePlay}>
    <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    fill={isPlaying ? "white" : "rgba(255, 255, 255, 0.447)"}
    viewBox="0 -960 960 960"
  >
    <path d="M440-120v-240h80v80h320v80H520v80zm-320-80v-80h240v80zm160-160v-80H120v-80h160v-80h80v240zm160-80v-80h400v80zm160-160v-240h80v80h160v80H680v80zm-480-80v-80h400v80z"></path>
  </svg>
  </button>;
}