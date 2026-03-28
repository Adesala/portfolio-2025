'use client'
import { useRef, useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { playFX } from "./audio/fxPlayer";
import { audioBuffers } from "./audio/audioBuffer";
import { useTransform } from "framer-motion";

/* ===========================
   CONFIG & UTILS
=========================== */
// Détection mobile simple basée sur la largeur
const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

// Vecteurs réutilisables pour éviter le Garbage Collection dans la loop
const _v1 = new THREE.Vector3();
const _v2 = new THREE.Vector3();
const _v3 = new THREE.Vector3();

/* ===========================
   MATERIAL
=========================== */
const MarbleMaterial = ({ isMobileDevice }) => {
  const textures = useTexture({
    map: '/marble/color.jpg',
    // On charge la normalMap mais on ne l'appliquera pas si mobile
    normalMap: '/marble/normal.jpg',
    roughnessMap: '/marble/roughness.jpg',
  });

  textures.map.colorSpace = THREE.SRGBColorSpace;

  return (
    <meshStandardMaterial
      map={textures.map}
      roughnessMap={textures.roughnessMap}
      // Astuce critique : on passe null à normalMap sur mobile pour gagner en perf
      normalMap={isMobileDevice ? null : textures.normalMap}
      roughness={0.4}
      metalness={0.05}
      transparent
    />
  );
};

/* ===========================
   FLOATING ICOSAHEDRON
=========================== */
const FloatingIcosahedron = ({
  position,
  scale,
  mousePositionRef,
  scrollProgress,
  targetPosition,
  nodes,
  isMobileDevice,
}) => {
  const meshRef = useRef();
  const velocity = useRef(new THREE.Vector3());
  const opacity = useRef(0);

  const stablePosition = useMemo(() => new THREE.Vector3(...position), [position]);
  const scrollValueRef = useRef(0);

  useEffect(() => {
    if (!scrollProgress) return;
    const unsubscribe = scrollProgress.on("change", v => {
      scrollValueRef.current = v;
    });
    return () => unsubscribe();
  }, [scrollProgress]);

  const initialPosition = useMemo(() => {
    return stablePosition.clone().add(
      new THREE.Vector3(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        -10 - Math.random() * 5
      )
    );
  }, [stablePosition]);

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.copy(initialPosition);
    }
  }, [initialPosition]);

  const speed = useMemo(() => Math.random() * 0.9 + 0.2, []);
  const direction = useMemo(() => new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize(), []);
  const rotationAxis = useMemo(() => {
    const axis = new THREE.Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
    return axis.lengthSq() === 0 ? new THREE.Vector3(1,0,0) : axis.normalize();
  }, []);

  useFrame(({ clock }, delta) => {
    if (!meshRef.current) return;

    // Limitation du delta sur mobile pour éviter les sauts physiques si le framerate chute
    const safeDelta = isMobileDevice ? Math.min(delta, 0.1) : delta;
    
    const t = clock.getElapsedTime();
    const progress = scrollValueRef.current;

    /* FLOAT */
    const floatInfluence = Math.pow(1 - progress, 2);
    // Réduction de l'amplitude du float sur mobile pour moins de calculs trigonométriques si nécessaire
    const floatAmp = isMobileDevice ? 0.05 : 0.1;
    
    _v1.set(
      Math.sin(t * speed) * floatAmp * direction.x * floatInfluence,
      Math.cos(t * speed) * floatAmp * direction.y * floatInfluence,
      0
    );

    /* MORPH VERS ANNEAU */
    const basePosition = stablePosition.clone().lerp(targetPosition, progress);
    const restPosition = basePosition.add(_v1);

    /* REPULSION CURSEUR (Optimisé) */
    // Sur mobile, on réduit la portée et la force de répulsion pour simplifier les calculs
    const mouse = mousePositionRef.current;
    
    // Utilisation de vecteurs temporaires globaux pour éviter l'allocation
    _v2.set(mouse.x, mouse.y, 0);
    _v3.copy(meshRef.current.position).sub(_v2);

    const distance = _v3.length();
    
    // Paramètres ajustés pour mobile
    const maxInfluence = isMobileDevice ? 2.5 : 3;
    const repulsionStrength = isMobileDevice ? 20 : 40;
    
    const influence = Math.max(0, maxInfluence - distance / 10);
    
    let repulsionForce = _v3.clone(); // Réutilise _v3
    
    if (influence > 0) {
      repulsionForce.normalize().multiplyScalar(influence * repulsionStrength);
    } else {
      repulsionForce.set(0, 0, 0);
    }

    /* SPRING */
    const springForce = restPosition.clone().sub(meshRef.current.position).multiplyScalar(12);
    const dampingForce = velocity.current.clone().multiplyScalar(-8);
    
    // Calcul accélération
    const acceleration = springForce.add(repulsionForce).add(dampingForce);
    
    velocity.current.add(acceleration.multiplyScalar(safeDelta));
    meshRef.current.position.add(velocity.current.clone().multiplyScalar(safeDelta));

    /* ROTATION INDIVIDUELLE */
    meshRef.current.rotateOnAxis(rotationAxis, safeDelta * 0.1);

    /* FADE */
    if (opacity.current < 1) {
      opacity.current = Math.min(1, opacity.current + safeDelta * 1.5);
      meshRef.current.material.opacity = opacity.current;
    }

    /* SOUND - Désactivé sur mobile pour perf et politique autoplay */
    if (!isMobileDevice) {
      const movementIntensity = velocity.current.length();
      if (movementIntensity > 0.8 && audioBuffers.meshMove) {
        const now = clock.getElapsedTime();
        if (now - (meshRef.current.lastSoundTime || 0) > 0.15) {
          const pan = THREE.MathUtils.clamp(meshRef.current.position.x / 10, -1, 1);
          playFX({ buffer: audioBuffers.meshMove, pan, volume: 0.03, lowpassFreq: 1200 });
          meshRef.current.lastSoundTime = now;
        }
      }
    }
  });

  return (
    <mesh
      ref={meshRef}
      geometry={nodes.Icosphere.geometry}
      scale={scale}
      // Ombres désactivées sur mobile (très coûteux)
      castShadow={!isMobileDevice}
      receiveShadow={!isMobileDevice}
    >
      <MarbleMaterial isMobileDevice={isMobileDevice} />
    </mesh>
  );
};

/* ===========================
   SCENE
=========================== */
const IcosahedronScene = ({ count = 200, scrollProgress }) => {
  const { size } = useThree();
  const mousePositionRef = useRef({ x: 0, y: 0 });
  
  // Ajustement dynamique de la dispersion et du compte
  const isMobileDevice = useMemo(() => size.width < 768, [size.width]);
  const dispersionFactor = isMobileDevice ? 8 : 10;
  
  // Réduction drastique du nombre d'objets sur mobile (de 200 à ~60)
  const finalCount = useMemo(() => {
    return isMobileDevice ? Math.floor(count * 0.35) : count;
  }, [count, isMobileDevice]);

  const positionsRef = useRef(null);
  const groupRef = useRef();
  const scrollValueRef = useRef(0);

  useEffect(() => {
    if (!scrollProgress) return;
    const unsubscribe = scrollProgress.on("change", v => {
      scrollValueRef.current = v;
    });
    return () => unsubscribe();
  }, [scrollProgress]);

  if (!positionsRef.current) {
    positionsRef.current = Array.from({ length: finalCount }, () => ({
      position: [
        (Math.random() - 0.5) * size.width / dispersionFactor,
        (Math.random() - 0.5) * size.height / dispersionFactor,
        -Math.random() * 5 - 5,
      ],
      scale: Math.random() * 1.5 + 0.3,
    }));
  }

  useEffect(() => {
    const handlePointerMove = (e) => {
      mousePositionRef.current = {
        x: (e.clientX - window.innerWidth / 2) / dispersionFactor,
        y: -(e.clientY - window.innerHeight / 2) / dispersionFactor,
      };
    };
    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [dispersionFactor]);

  const worldWidth = size.width / dispersionFactor;
  const worldHeight = size.height / dispersionFactor;
  const radius = Math.min(worldWidth, worldHeight) * 0.4;

  const targetPositions = useMemo(() => {
    return positionsRef.current.map((_, i) => {
      const angle = (i / finalCount) * Math.PI * 2;
      const radialNoise = (Math.random() - 0.5) * 2;
      const x = Math.cos(angle) * (radius + radialNoise);
      const y = Math.sin(angle) * (radius + radialNoise);
      const z = (Math.random() - 0.5) * 4;
      return new THREE.Vector3(x, y, z);
    });
  }, [finalCount, radius]);

  const { nodes } = useGLTF('/savalouobject.glb');

  const rotationZ = useTransform(
    scrollProgress,
    [0, 1],
    [0, Math.PI * 2]
  );

  useFrame(() => {
    if (!groupRef.current) return;
    groupRef.current.rotation.z = rotationZ.get();
  });

  return (
    <group ref={groupRef}>
      {positionsRef.current.map((props, i) => (
        <FloatingIcosahedron
          key={i}
          {...props}
          mousePositionRef={mousePositionRef}
          scrollProgress={scrollProgress}
          targetPosition={targetPositions[i]}
          nodes={nodes}
          isMobileDevice={isMobileDevice}
        />
      ))}
    </group>
  );
};

export default IcosahedronScene;