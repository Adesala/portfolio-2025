import { useEffect, useRef, useState } from "react";

export default function WaveMusicIcon({ isPlaying = true }) {
  
  const pathRef = useRef(null);
  const frameRef = useRef(null);

  const startX = 10;
  const endX = 110;
  const centerY = 60;
  const amplitude = 10;
  const wavelength = 40;
  const points = 120;
  let currentColor = isPlaying ? "white" : "rgba(255, 255, 255, 0.447)";

  const phaseRef = useRef(0);
  const currentAmplitudeRef = useRef(amplitude);

  useEffect(() => {
    const path = pathRef.current;

    function generateWave() {
      let d = "";

      for (let i = 0; i <= points; i++) {
        const progress = i / points;
        const x = startX + (endX - startX) * progress;

        // Envelope = apparition / disparition douce
        const envelope = Math.sin(progress * Math.PI);

        const y =
          centerY +
          Math.sin(
            (progress * (endX - startX)) / wavelength * 2 * Math.PI +
              phaseRef.current
          ) *
            currentAmplitudeRef.current *
            envelope;

        d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
      }

      path.setAttribute("d", d);
    }

function animate() {
  const targetAmplitude = isPlaying ? amplitude : 0;

  // interpolation douce (plus petit = plus lent)
  const smoothing = 0.02;

  currentAmplitudeRef.current +=
    (targetAmplitude - currentAmplitudeRef.current) * smoothing;

  if (isPlaying) {
    phaseRef.current += isPlaying ? 0.12 : 0.02;
  }

  generateWave();
  frameRef.current = requestAnimationFrame(animate);
}


    animate();

    return () => cancelAnimationFrame(frameRef.current);
  }, [isPlaying]);

  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 120 120"
      xmlns="http://www.w3.org/2000/svg"

    >
      <defs>
        <clipPath id="clipCircle">
          <circle cx="60" cy="60" r="55" />
        </clipPath>

      <linearGradient
  id="fadeStroke"
  gradientUnits="userSpaceOnUse"
  x1={startX}
  y1="0"
  x2={endX}
  y2="0"
>
  <stop offset="0%" stopColor="transparent" />
  <stop offset="15%" stopColor={currentColor} />
  <stop offset="85%" stopColor={currentColor} />
  <stop offset="100%" stopColor="transparent" />
</linearGradient>
      </defs>

      {/* Cercle */}
      <circle
        cx="60"
        cy="60"
        r="55"
        fill="none"
        stroke={currentColor}
        strokeWidth="1.2"
      />

      <g clipPath="url(#clipCircle)">
        {/* Ligne base */}
    {/*       <line
            x1="30"
            y1="60"
            x2="110"
            y2="60"
            stroke="currentColor"
            strokeWidth="1"
            opacity="0.3"
            /> */}

        {/* Onde dynamique */}
        <path
          ref={pathRef}
          fill="none"
          stroke="url(#fadeStroke)"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}
