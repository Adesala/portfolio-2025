'use client'
import { useMusic } from "../components/MusicProvider/MusicProvider";
import styles from '../assets/home.module.scss';
import WaveMusicIcon from "./musicButtonPremium";

export default function MusicButton() {
  const { isPlaying, togglePlay } = useMusic();

  return <button className={styles.musicButton} onClick={togglePlay}>
 <WaveMusicIcon isPlaying={isPlaying} />
  </button>;
}