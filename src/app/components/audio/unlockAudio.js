// audio/unlockAudio.js
import { getAudioContext } from './audioContext';

export function unlockAudio() {
  const ctx = getAudioContext();
  if (ctx.state !== 'running') {
    ctx.resume();
  }
}
