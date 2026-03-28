'use client'
import { useRef, useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { playFX } from "./audio/fxPlayer";
import { audioBuffers } from "./audio/audioBuffer";
import { useTransform } from "framer-motion";

/* ===========================
   MATERIAL
=========================== */
const MarbleMaterial = () => {
  const textures = useTexture({
    map: '/marble/color.jpg',
    normalMap: '/marble/normal.jpg',
    roughnessMap: '/marble/roughness.jpg',
  });

  textures.map.colorSpace = THREE.SRGBColorSpace;

  return (
    <meshStandardMaterial
      {...textures}
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

    const t = clock.getElapsedTime();
    const progress = scrollValueRef.current;

    /* FLOAT */
    const floatInfluence = Math.pow(1 - progress, 2);
    const floatOffset = new THREE.Vector3(
      Math.sin(t * speed) * 0.1 * direction.x * floatInfluence,
      Math.cos(t * speed) * 0.1 * direction.y * floatInfluence,
      0
    );

    /* MORPH VERS ANNEAU */
    const basePosition = stablePosition.clone().lerp(targetPosition, progress);
    const restPosition = basePosition.clone().add(floatOffset);

    /* REPULSION CURSEUR */
    const mouse = mousePositionRef.current;
  const toMesh = meshRef.current.position.clone().sub(new THREE.Vector3(mouse.x, mouse.y, 0));

    const distance = toMesh.length();
    const influence = Math.max(0, 3 - distance / 10);
    let repulsionForce = new THREE.Vector3();
    if (influence > 0) {
      repulsionForce.copy(toMesh).normalize().multiplyScalar(influence * 40);
    }

    /* SPRING */
    const springForce = restPosition.clone().sub(meshRef.current.position).multiplyScalar(12);
    const dampingForce = velocity.current.clone().multiplyScalar(-8);
    const acceleration = springForce.add(repulsionForce).add(dampingForce);
    velocity.current.add(acceleration.multiplyScalar(delta));
    meshRef.current.position.add(velocity.current.clone().multiplyScalar(delta));

    /* ROTATION INDIVIDUELLE */
    meshRef.current.rotateOnAxis(rotationAxis, delta * 0.1);

    /* FADE */
    if (opacity.current < 1) {
      opacity.current = Math.min(1, opacity.current + delta * 1.5);
      meshRef.current.material.opacity = opacity.current;
    }

    meshRef.current.material.normalMap = null;

    /* SOUND */
    const movementIntensity = velocity.current.length();
    if (movementIntensity > 0.8 && audioBuffers.meshMove) {
      const now = clock.getElapsedTime();
      if (now - (meshRef.current.lastSoundTime || 0) > 0.15) {
        const pan = THREE.MathUtils.clamp(meshRef.current.position.x / 10, -1, 1);
        playFX({ buffer: audioBuffers.meshMove, pan, volume: 0.03, lowpassFreq: 1200 });
        meshRef.current.lastSoundTime = now;
      }
    }
  });

  return (
    <mesh
      ref={meshRef}
      geometry={nodes.Icosphere.geometry}
      scale={scale}
      castShadow
      receiveShadow
    >
      <MarbleMaterial />
    </mesh>
  );
};

/* ===========================
   SCENE
=========================== */
const IcosahedronScene = ({ count = 200, scrollProgress }) => {
  const { size } = useThree();
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const dispersionFactor = size.width < 768 ? 8 : 10;
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
    positionsRef.current = Array.from({ length: count }, () => ({
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

  /* -------- ANNEAU -------- */

 const worldWidth = size.width / dispersionFactor;
const worldHeight = size.height / dispersionFactor;

const radius = Math.min(worldWidth, worldHeight) * 0.4;


  const targetPositions = useMemo(() => {
    return positionsRef.current.map((_, i) => {
      const angle = (i / count) * Math.PI * 2;
      const radialNoise = (Math.random() - 0.5) * 2;

      const x = Math.cos(angle) * (radius + radialNoise);
      const y = Math.sin(angle) * (radius + radialNoise);
      const z = (Math.random() - 0.5) * 4;

      return new THREE.Vector3(x, y, z);
    });
  }, [count, radius]);

  const { nodes } = useGLTF('/savalouobject.glb');

  /* ROTATION GLOBALE UNIQUEMENT AU SCROLL */

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
        />
      ))}
    </group>
  );
};

export default IcosahedronScene;

