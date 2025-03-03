'use client'
import { useRef, useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Icosahedron, Octahedron } from "@react-three/drei";
import * as THREE from "three";

const FloatingIcosahedron = ({ position, scale, mousePositionRef }) => {
  const meshRef = useRef();
  const speed = Math.random() * 0.9 + 0.2; // Vitesse aléatoire
  const direction = new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize(); // Direction aléatoire

  // Génération d'un axe de rotation aléatoire mais NORMALISÉ
  const rotationAxis = useMemo(() => {
    let axis = new THREE.Vector3(
      Math.random() * 2 - 1, 
      Math.random() * 2 - 1, 
      Math.random() * 2 - 1
    );
    return axis.lengthSq() === 0 ? new THREE.Vector3(1, 0, 0) : axis.normalize();
  }, []);

  const stablePosition = useMemo(() => position, []);

  // Calculer la distance en X/Y entre la souris et l'icosahedron
  const distance = useRef(0);
  useEffect(() => {
    const mousePosition = mousePositionRef.current;
    const meshPos = new THREE.Vector3(position[0], position[1], position[2]);
    const mouseVec = new THREE.Vector3(mousePosition.x, mousePosition.y, 0); // Position de la souris
    distance.current = meshPos.distanceTo(mouseVec); // Calculer la distance (X et Y uniquement)
  }, [position, mousePositionRef]);

  useFrame(({ clock }) => {
    if (meshRef.current) {
      const t = clock.getElapsedTime();

      const oscillationFactor = 0.1; // Faible oscillation pour limiter les mouvements excessifs
      const x = Math.sin(t * speed) * oscillationFactor * direction.x;
      const y = Math.cos(t * speed) * oscillationFactor * direction.y;
      const z = Math.sin(t * speed * 0.7) * oscillationFactor * direction.z;

      // Appliquer la position avec lerp pour lisser le mouvement
      meshRef.current.position.x = THREE.MathUtils.lerp(
        meshRef.current.position.x, 
        stablePosition[0] + x, 
        0.1 // Le facteur de lissage (plus élevé pour un mouvement plus doux)
      );
      meshRef.current.position.y = THREE.MathUtils.lerp(
        meshRef.current.position.y, 
        stablePosition[1] + y, 
        0.1
      );
      meshRef.current.position.z = THREE.MathUtils.lerp(
        meshRef.current.position.z, 
        stablePosition[2] + z, 
        0.1
      );

      // Appliquer l'effet de mouvement si la distance est suffisamment proche
      const maxDistance = 20; // Limiter la distance pour déclencher l'effet
      const distanceFactor = Math.max(0, Math.min(1, 1 - distance.current / maxDistance)); // Facteur basé sur la distance

      // Plus la distance est petite, plus l'effet est grand
      if (distance.current < maxDistance) {
        const moveFactor = 1; // Ajuster la vitesse du mouvement ici

        // Mouvement inverse par rapport à la souris pour donner l'effet de recul
        meshRef.current.position.x -= (meshRef.current.position.x - mousePositionRef.current.x * 2) * moveFactor * distanceFactor;
        meshRef.current.position.y -= (meshRef.current.position.y - mousePositionRef.current.y * 2) * moveFactor * distanceFactor;
      }
    }
  });

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotateOnAxis(rotationAxis, delta * 0.1); // Rotation lente
    }
  });

  return (
    <Octahedron ref={meshRef} args={[1, 0]} position={position} scale={scale}>
      <meshStandardMaterial metalness={1} roughness={0} color="#272d29" />
    </Octahedron>
  );
};

const IcosahedronScene = ({ count = 200 }) => {
  const { size } = useThree();
  const mousePositionRef = useRef({ x: 0, y: 0 });
  const dispersionFactor = size.width < 768 ? 3 : 10;
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
    const handleMouseMove = (event) => {
      const x = (event.clientX / window.innerWidth) * 2 - 1;
      const y = -(event.clientY / window.innerHeight) * 2 + 1;
      mousePositionRef.current = { x, y };
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <>
      {positionsRef.current.map((props, i) => (
        <FloatingIcosahedron key={i} {...props} mousePositionRef={mousePositionRef} />
      ))}
    </>
  );
};

export default IcosahedronScene;




