// audio/fxPlayer.js
import { getAudioContext } from './audioContext';

export function playFX({
  buffer,
  pan = 0,        // -1 gauche → 1 droite
  volume = 0.4,
  lowpassFreq = 1200,
}) {
  if (!buffer) return;

  const ctx = getAudioContext();

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const gainNode = ctx.createGain();
  gainNode.gain.value = volume;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = lowpassFreq;

  const panner = ctx.createStereoPanner();
  panner.pan.value = pan;

  source
    .connect(filter)
    .connect(panner)
    .connect(gainNode)
    .connect(ctx.destination);

  source.start();
}
