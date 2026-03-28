'use client'
import { useRef,useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'


const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const fragmentShader = `
uniform float uTime;
uniform vec2 uMouse;
uniform float uStrength;

varying vec2 vUv;

/* =========================
   HASH / NOISE
   ========================= */

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);

  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));

  vec2 u = f * f * (3.0 - 2.0 * f);

  return mix(a, b, u.x)
       + (c - a) * u.y * (1.0 - u.x)
       + (d - b) * u.x * u.y;
}

/* =========================
   FLOW FIELD DYNAMIQUE
   ========================= */

vec2 flow(vec2 p, float t) {
  float n = noise(p * 1.2 + vec2(t, -t));
  float angle = n * 6.28318;
  return vec2(cos(angle), sin(angle));
}


void main() {

  vec2 uv = vUv;

  /* =========================
     ADVECTION TEMPORELLE
     ========================= */

  vec2 p = uv * 3.0;
  float t = uTime * 0.15;

  // déplacement réel dans le temps
  p += flow(p, t) * 0.4;
  p += flow(p + 4.0, t * 1.3) * 0.3;
  p += flow(p + 8.0, t * 1.7) * 0.2;

  /* =========================
     STRUCTURE DES BLOBS
     ========================= */

  float field = 0.0;
  field += noise(p);
  field += noise(p * 2.0) * 0.5;
  field += noise(p * 4.0) * 0.25;
  field /= 1.75;

  /* =========================
     SEUIL LAVA LAMP
     ========================= */

  float fog = smoothstep(0.5, 0.72, field);

  /* =========================
     DISSIPATION SOURIS
     ========================= */

  float d = distance(uv, uMouse);
  fog *= smoothstep(0.0, 0.35, d);

  /* =========================
     OPACITÉ FINALE
     ========================= */

  fog *= uStrength;

  gl_FragColor = vec4(vec3(1.0), fog);
}
`





const FogPlane = () => {
  const materialRef = useRef()
  const mouseRef = useRef(new THREE.Vector2(0.5, 0.5))
  const { viewport } = useThree()

const shaderMaterial = useMemo(() => new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    uRadius: { value: 0.5 },
    uStrength: { value: 0.0025 },
  },
  transparent: true,
}), []);

  useFrame(({ clock }) => {
    if (!materialRef.current) return
    materialRef.current.uniforms.uTime.value = clock.elapsedTime
    materialRef.current.uniforms.uMouse.value= mouseRef.current
  })

  return (
    <mesh
      position={[0, 0, 0]}
      onPointerMove={(e) => {
        if (e.uv) mouseRef.current.copy(e.uv)
      }}
    >
      <planeGeometry args={[viewport.width, viewport.height]} />
  <primitive object={shaderMaterial} ref={materialRef} />
    </mesh>
  )
}



export default FogPlane
