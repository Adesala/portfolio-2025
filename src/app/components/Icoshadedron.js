'use client'
import { useRef, useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Icosahedron, Octahedron, useGLTF, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils'


const MarbleMaterial = () => {
  const textures = useTexture({
    map: '/marble/color.jpg',
    normalMap: '/marble/normal.jpg',
    roughnessMap: '/marble/roughness.jpg',
  
  })

  // CORRECTION color space (obligatoire)
  textures.map.colorSpace = THREE.SRGBColorSpace

  return (
    <meshStandardMaterial
      {...textures}
      roughness={0.4}
      metalness={0.05}
    />
  )
}


const FloatingIcosahedron = ({ position, scale, mousePositionRef }) => {
  const meshRef = useRef();
  const velocity = useRef(new THREE.Vector3());
  const { nodes } = useGLTF('/savalouobject.glb');

  const geometry = useMemo(() => {
    let geo = nodes.Icosphere.geometry.clone();
    geo = mergeVertices(geo, 1e-4);
    const pos = geo.attributes.position;
    const normal = geo.attributes.normal;
    const v = new THREE.Vector3();
    const n = new THREE.Vector3();
    const strength = 0.05;
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      n.fromBufferAttribute(normal, i);
      v.addScaledVector(n, (Math.random() - 0.5) * strength);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    pos.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }, [nodes.Icosphere.geometry]);

  const stablePosition = useMemo(() => new THREE.Vector3(...position), [position]);

  // ✅ Position initiale hors de la scène pour effet d'entrée
  const initialPosition = useMemo(() => {
    return stablePosition.clone().add(new THREE.Vector3(
      (Math.random() - 0.5) * 20,    // décalage X
      (Math.random() - 0.5) * 20,    // décalage Y
      -10 - Math.random() * 5         // départ en Z derrière la caméra
    ));
  }, [stablePosition]);

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.position.copy(initialPosition);
    }
  }, [initialPosition]);

  const speed = Math.random() * 0.9 + 0.2;
  const direction = useMemo(() => new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize(), []);
  const rotationAxis = useMemo(() => {
    let axis = new THREE.Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
    return axis.lengthSq() === 0 ? new THREE.Vector3(1, 0, 0) : axis.normalize();
  }, []);


  const opacity = useRef(0);

  useFrame(({ clock }, delta) => {
    if (!meshRef.current) return;

    const t = clock.getElapsedTime();

    // FLOATING
    const floatOffset = new THREE.Vector3(
      Math.sin(t * speed) * 0.1 * direction.x,
      Math.cos(t * speed) * 0.1 * direction.y,
      0
    );
    const restPosition = stablePosition.clone().add(floatOffset);

    // CURSOR REPULSION
    const mouse = mousePositionRef.current;
    const toMesh = stablePosition.clone().sub(new THREE.Vector3(mouse.x, mouse.y, 0));
    const distance = toMesh.length();
    const influence = Math.max(0, 3 - distance / 10);

    let repulsionForce = new THREE.Vector3();
    if (influence > 0) {
      repulsionForce.copy(toMesh).normalize().multiplyScalar(influence * 40);
    }

    // SPRING & DAMPING
    const springForce = restPosition.clone().sub(meshRef.current.position).multiplyScalar(12);
    const dampingForce = velocity.current.clone().multiplyScalar(-8);
    const acceleration = springForce.add(repulsionForce).add(dampingForce);

    velocity.current.add(acceleration.multiplyScalar(delta));
    meshRef.current.position.add(velocity.current.clone().multiplyScalar(delta));

    // ROTATION
    meshRef.current.rotateOnAxis(rotationAxis, delta * 0.1);

      if (opacity.current < 1) {
    opacity.current = Math.min(1, opacity.current + delta * 1.5); // augmente l'opacité progressivement
    meshRef.current.material.transparent = opacity.current < 1;
    meshRef.current.material.opacity = opacity.current;
  }

  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      scale={scale}
      castShadow
      receiveShadow
    >
      <MarbleMaterial />
    </mesh>
  );
};


const IcosahedronScene = ({ count = 200 }) => {
  const { size } = useThree();
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const dispersionFactor = size.width < 768 ? 8 : 10;
  // Stocker les positions et tailles des objets une fois pour toute
  const positionsRef = useRef(null);

  if (!positionsRef.current) {
    positionsRef.current = Array.from({ length: count }, () => ({
      position: [
        (Math.random() - 0.5) * size.width  / dispersionFactor,   // Utilisation de la taille fixe
        (Math.random() - 0.5) * size.height  / dispersionFactor,
        -Math.random() * 5 - 5,                    // Position Z derrière
      ],
      scale: Math.random() * 1.5 + 0.3,
    }));
  }

  // Détecter la position de la souris
useEffect(() => {
  const handleMouseMove = (e) => {
    mousePositionRef.current = {
      x: (e.clientX - window.innerWidth / 2) / dispersionFactor,
      y: -(e.clientY - window.innerHeight / 2) / dispersionFactor,
    };
  };

  window.addEventListener("mousemove", handleMouseMove);
  return () => window.removeEventListener("mousemove", handleMouseMove);
}, [dispersionFactor]);

  return (
    <>
      {positionsRef.current.map((props, i) => (
        <FloatingIcosahedron key={i} {...props} mousePositionRef={mousePositionRef} />
      ))}
    </>
  );
};

export default IcosahedronScene;




