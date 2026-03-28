// audio/audioBuffers.js
import { getAudioContext } from './audioContext';

export const audioBuffers = {};

async function loadBuffer(url) {
  const ctx = getAudioContext();
  const res = await fetch(url);
  const arrayBuffer = await res.arrayBuffer();
  return await ctx.decodeAudioData(arrayBuffer);
}

export async function loadFXBuffers() {
  audioBuffers.meshMove = await loadBuffer('/sounds/asteroide.mp3');
/*   audioBuffers.ctaHover = await loadBuffer('/sounds/cta-hover.wav'); */
}
