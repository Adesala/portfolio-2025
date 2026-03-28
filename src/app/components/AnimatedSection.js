'use client'
import { useMemo, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import { Suspense, useRef } from 'react'
import * as THREE from 'three'
import styles from '../assets/animatedSections.module.scss'
import { motion, useTransform} from 'framer-motion'
import { oswald, spaceGrotesk} from '../assets/fonts';

/* ============================= */
/* ===== Scene Image Mesh ====== */
/* ============================= */

const SceneImage = ({ image }) => {
  // memoiser la texture pour éviter de la recréer à chaque render
  const texture = useTexture(image)
  texture.colorSpace = THREE.SRGBColorSpace

  // memoiser le matériau
  const materialRef = useRef()
  const material = useMemo(() => new THREE.ShaderMaterial({
    uniforms: {
      uTexture: { value: texture },
      uTime: { value: 0 },
      uHover: { value: 0 }, 
    },
    vertexShader: `
varying vec2 vUv;

void main() {
  vUv = uv;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
    `,
    fragmentShader: `
varying vec2 vUv;
uniform sampler2D uTexture;
uniform float uHover;
uniform float uTime;

// pseudo-noise simple
float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0,0.0));
    float c = hash(i + vec2(0.0,1.0));
    float d = hash(i + vec2(1.0,1.0));
    vec2 u = f*f*(3.0-2.0*f);
    return mix(a,b,u.x) + (c-a)*u.y*(1.0-u.x) + (d-b)*u.x*u.y;
}

void main() {
    vec4 tex = texture2D(uTexture, vUv);

    // version sombre bleu cosmique
    vec3 cosmicBlue = vec3(0.02,0.04,0.12);
    float luma = dot(tex.rgb, vec3(0.299,0.587,0.114));
    vec3 darkVersion = cosmicBlue + luma*0.15;

    // noise pour dissolution
    float n = noise(vUv*5.0 + uTime*0.3); // vitesse animée

    // dissolve progressif lié au hover
    float dissolve = smoothstep(0.0, 1.0, uHover - (1.0 - n));

    vec3 finalColor = mix(darkVersion, tex.rgb, dissolve);

    gl_FragColor = vec4(finalColor,1.0);
}
    `,
  }), [texture])

const [hovered, setHovered] = useState(false)

useFrame(() => {
  if (!materialRef.current) return

  materialRef.current.uniforms.uHover.value = THREE.MathUtils.lerp(
    materialRef.current.uniforms.uHover.value,
    hovered ? 1 : 0,
    0.08
  )
})

  return (
    <mesh   onPointerEnter={() => setHovered(true)}
  onPointerLeave={() => setHovered(false)}>
      <planeGeometry args={[4, 3, 64, 64]} />
      <primitive ref={materialRef} object={material} attach="material" />
    </mesh>
  )
}
/* ============================= */
/* ===== Animated Section ====== */
/* ============================= */

export const AnimatedSection = ({
  id,
  title1,
  title2,
  subtitle,
  image,
  reverse = false,
  scrollProgress
}) => {
  // récupère la progression du scroll pour cette section

  // transforme la progression du scroll en opacité
  const opacity = useTransform(scrollProgress, [0, 0.2, 1], [0, 1, 1])

  return (
    <section id={id}  className={styles.section}>
      <div className={`${styles.inner} ${reverse ? styles.reverse : ''}`}>

        {/* TEXT BLOCK */}
        <div className={styles.textBlock}>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2,delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className={`${styles.title} ${spaceGrotesk.className}`}
          >
            {title1} <br /> {title2}
          </motion.h2>
          <motion.p  initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }} 
            className={`${styles.subtitle} `}>
        
            {subtitle}
          </motion.p>
          <button type="button" className="my-2 text-body bg-neutral-secondary-medium box-border border border-default-medium hover:bg-neutral-tertiary-medium hover:text-heading focus:ring-4 focus:ring-neutral-tertiary shadow-xs font-medium leading-5 rounded-full text-base px-6 py-2.5 focus:outline-none">See More</button>
        </div>

        {/* CANVAS BLOCK */}
        <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className={styles.canvasBlock}>
          <Canvas
            camera={{ position: [0, 0, 4], fov: 45 }}
            gl={{ antialias: true }}
          >
            <Suspense fallback={null}>
              <SceneImage image={image} />
            </Suspense>
          </Canvas>
        </motion.div>

      </div>
    </section>
  )
}