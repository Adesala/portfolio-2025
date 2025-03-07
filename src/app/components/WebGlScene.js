'use client'
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture, ScrollControls, Scroll ,useScroll, Loader, useVideoTexture, Html, Environment} from "@react-three/drei";
import { Bloom, DepthOfField, EffectComposer, Noise, SelectiveBloom, Vignette , LensFlare, BrightnessContrast } from '@react-three/postprocessing'
import { useRef, useEffect, useState, Suspense } from "react";
import { motion, useTransform} from "framer-motion";
import IcosahedronScene from "./Icoshadedron";
import * as THREE from "three";
import styles from '../assets/home.module.scss';
import { ImgUrls } from '../constant/imgUrls';
import { useRouter } from "next/navigation";
import { oswald, wallpoet} from '../assets/fonts';
import MusicButton from "./MusicButton";



const vertexShader = `
varying vec2 vUv;
uniform float uTime;
uniform vec2 uMouse;
uniform float uScrollDistortion;
uniform float uDistortion;
uniform float uIntensity; // Ajout d'un paramètre d'intensité
uniform float uScroll; // Ajout d'un paramètre de scroll
uniform float uDistortionStrength; // Ajout d'un paramètre de force de distorsion

void main() {
    vUv = uv;

    // Distance entre la souris et chaque vertex
    float dist = distance(uv, uMouse);
    float strength = uDistortion * (1.0 - smoothstep(0.0, 0.3, dist));
    float distortionStrength = abs(uv.y - 0.5) * 2.0; // Plus proche du haut/bas, plus la distorsion est forte
    distortionStrength *= uDistortion;

    // Génération d'un facteur de séparation unique pour chaque vertex
    float separation = fract(sin(dot(position.xy, vec2(12.9898, 78.233))) * 43758.5453);

    float wave = sin(position.y * 0.5 + uTime / 2.0) * 0.05 * uScroll * uScrollDistortion;
    vec3 newPosition = position;
    newPosition.x += wave;
    

    newPosition.x += (sin(uTime * 3.0 + separation * 15.0) * strength * uIntensity);
    newPosition.y += (cos(uTime * 2.0 + separation * 20.0) * strength * uIntensity);
    newPosition.z += (sin(uTime * 4.0 + separation * 25.0) * strength * uIntensity * 0.5);


    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
`;

const fragmentShader = `
varying vec2 vUv;
uniform sampler2D uTexture;
uniform vec2 uTextureSize;
uniform vec2 uPlaneSize;
uniform float uIsClicked;

void main() {
  vec2 uv = vUv;

  // Définir un ratio fixe (par ex: 16:9)
  float fixedAspect = 16.0 / 9.0;

  // Calcul du ratio actuel
  float textureAspect = uTextureSize.x / uTextureSize.y;
  float planeAspect = uPlaneSize.x / uPlaneSize.y;

  // Définir le scale basé sur le ratio fixe
  vec2 scale = vec2(1.0);
  if (planeAspect > fixedAspect) {
    scale.y = fixedAspect / planeAspect;
  } else {
    scale.x = planeAspect / fixedAspect;
  }

  // Centrer l'image correctement
  uv = (uv - 0.5) * scale + 0.5;

  // Empêcher les UV de dépasser [0,1] pour éviter les artefacts
  uv = clamp(uv, 0.0, 1.0);

  // Échantillonnage de la texture
  vec4 color = texture2D(uTexture, uv);

  // Augmenter le contraste
  float contrast = 1.35;
  vec3 contrastedColor = ((color.rgb - 0.5) * contrast) + 0.5;

  // Légère réduction de la luminosité
  float brightness = 0.9;
  vec3 finalColor = contrastedColor * brightness;

  // Mix avec blanc si cliqué
  vec4 whiteColor = vec4(1.0);
  gl_FragColor = mix(vec4(finalColor, color.a), whiteColor, uIsClicked);
}
`;



// 🎨 ShaderMaterial (composant pour gérer le shader de la texture)
const TextureMaterial = ({ texture, mouseRef, distortionRef, uTime, scrollRef, isScrolling, imageHeight, imageWidth,  clicked}) => {
  const materialRef = useRef();
  const previousScroll = useRef(scrollRef.current);
  const scrollVelocity = useRef(0);
  const transitionRef = useRef(0);  

  useFrame(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTexture.value = texture;
      materialRef.current.uniforms.uMouse.value = mouseRef.current;
      materialRef.current.uniforms.uDistortion.value = distortionRef.current;
      if(isScrolling) { 
        if (previousScroll.current === undefined) {
            previousScroll.current = scrollRef.current;
          }
        
          // Calcul de la vitesse du scroll
          let scrollSpeed = scrollRef.current - previousScroll.current;
        
          // On applique un facteur d'amplification
          scrollVelocity.current = scrollVelocity.current * 0.98 + scrollSpeed * 2;
        
          previousScroll.current = scrollRef.current;
        
          // Si la vitesse est très faible, on la remet à zéro progressivement
          if (Math.abs(scrollVelocity.current) < 0.001) {
            scrollVelocity.current *= 0.9;
          }
        
          // Mise à jour du shader
          materialRef.current.uniforms.uScroll.value = scrollVelocity.current;
    
    } // Mettre à jour la valeur du scroll

    if (clicked) {
        materialRef.current.uniforms.uDistortion.value = 0;
      } else {
        materialRef.current.uniforms.uDistortion.value = distortionRef.current;
      }


    if (clicked && transitionRef.current < 1) {
        // Accélérer la transition vers 1 si le clic est activé
        transitionRef.current += 0.05;  // Change la vitesse de la transition ici
        
      } else if (!clicked && transitionRef.current > 0) {
        // Accélérer la transition vers 0 si le clic est désactivé
        transitionRef.current -= 0.05;
      }
  
      // Mettre à jour le uniform avec la valeur de transition
      if (materialRef.current) {
        materialRef.current.uniforms.uIsClicked.value = transitionRef.current;
      }
      materialRef.current.uniforms.uTime.value += 0.05; // Mise à jour du temps pour l'animation
    }
  });

  return <shaderMaterial ref={materialRef} args={[{
    uniforms: {
      uTexture: { value: null },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) }, 
      uScroll: { value: 0.0},// Valeur initiale définie
      uDistortion: { value: 0.0 },
      uTime: { value: 0.0 },
      uIntensity: { value: 2.0 },
      uDistortionStrength: { value: 2.0 },
      uScrollDistortion: { value: 8.0 },
      uTextureSize: { value: new THREE.Vector2(texture.image?.width || 1, texture.image?.height || 1) },
      uPlaneSize: { value: new THREE.Vector2(imageWidth, imageHeight) },
      uIsClicked: { value: clicked ? 1 : 0 },// Ajouter une valeur pour savoir si l'image est cliquée
       // Taille du plane
      // Valeur d'intensité
    },
    vertexShader,
    fragmentShader,
  }]} />;
};

// Composant pour afficher une image avec un mesh plane
const WebGlImage = ({ url, position, uMouse, uDistortion, onPointerOver, onPointerOut, imageIndex, imageName, projectUrl}) => {
  const texture = useVideoTexture(url); // Chargement de la texture de l'image
  const meshRef = useRef();
  const scroll = useScroll(); // Utilisation du hook useScroll directement dans Image
  const { camera, raycaster, size, viewport } = useThree();
  const mouseRef = useRef(new THREE.Vector2(0.5, 0.5));
  const distortionRef = useRef(0);
  const scrollRef = useRef(0); // Créer une référence pour la position du scroll
  const [hovered, setHovered] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [clicked, setClicked] = useState(false);
  const groupRef = useRef();
  const htmlRef = useRef();
  const worldPosition = useRef(new THREE.Vector3());
  const scaleRef = useRef(1);
  const initialPosition = new THREE.Vector3(...position);
  const positionRef = useRef(initialPosition.clone());
  const router = useRouter();
  const projectIndexRef = useRef(null)

  // Mettre à jour la valeur du scroll dans la référence à chaque frame



  useFrame((_,delta) => {
    const currentScroll = scroll.offset;
  
    if (Math.abs(currentScroll - scrollRef.current) > 0.001) {
      // Si le scroll bouge, on met à jour directement la valeur
      setIsScrolling(true);
      scrollRef.current = currentScroll;
    } else if (scrollRef.current !== 0) {
      // Si le scroll s'est arrêté, on diminue progressivement vers 0
      scrollRef.current = THREE.MathUtils.lerp(scrollRef.current, 0, 0.01);
  
      // Si la valeur devient trop faible, on la force à 0 pour éviter des résidus visuels
      if (Math.abs(scrollRef.current) < 0.001) {
        scrollRef.current = 0;
      }
    }
    
      if (meshRef.current) {
        const targetScale = clicked ? viewport.width : 1;
        scaleRef.current = THREE.MathUtils.lerp(scaleRef.current, targetScale, 5 * delta); // 5 = ajustable
  
    
          // Interpolation fluide de la position pour recentrer le plane
          positionRef.current.lerp(
            clicked ? new THREE.Vector3(0, 0, 0) : initialPosition, 
            0.1
          );
        meshRef.current.scale.set(scaleRef.current, scaleRef.current, 1);
        meshRef.current.position.copy(positionRef.current);
      }

  });

  const imageWidth = viewport.width * 0.6; // 40% de la largeur de l'écran
  const imageHeight = viewport.height * 0.6; // 60% de la hauteur de l'écran


  const handlePointerMove = (event) => {

   
    const mouse = new THREE.Vector2(
      (event.clientX / size.width) * 2 - 1,
      -(event.clientY / size.height) * 2 + 1
    );

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObject(meshRef.current);

    if (intersects.length > 0) {
      const intersect = intersects[0];

      // Prendre directement les UV locales de l'intersection
      mouseRef.current.set(intersect.uv.x, intersect.uv.y);
      distortionRef.current = 0.2; // Appliquer l'effet
    }
  };

  const [distortionStrength, setDistortionStrength] = useState(0);
  
  // Lorsque le curseur sort de l'image, commencer à réduire la distorsion progressivement
  const handlePointerOut = () => {
    // Lancer une animation de transition pour diminuer la distorsion progressivement
    let startTime = performance.now();
    document.body.style.cursor = 'default'; 
    const reduceDistortion = () => {
      const elapsed = performance.now() - startTime;
      const progress = Math.min(elapsed / 1000, 1); // transition sur 1 seconde
  
      distortionRef.current = Math.max(0, distortionRef.current - 0.02); // Réduit progressivement la distorsion
  
// Réduit progressivement la distorsion
      setDistortionStrength(distortionRef.current);
  
      if (progress < 1) {
        requestAnimationFrame(reduceDistortion); // Continue l'animation jusqu'à ce que la distorsion atteigne 0
      } else {
        distortionRef.current = 0;
      }
    };
  
    reduceDistortion();
  };

  const handleClick = () => {
    router.push(projectUrl);


  };


  const handlePointerOver = () => {
    document.body.style.cursor = 'pointer'; 
  }


  return (
    <group ref={groupRef}> 
    <motion.mesh
    onClick={handleClick}
    onPointerOver={handlePointerOver}
    initial={{ scale: 1, position: [0, 0, 0] }}
    animate={{
      scale: clicked ? [1, 1, 1] : [viewport.width / 2, viewport.height / 2, 1],
      position: clicked ? [0, 0, 0] : [0, 0, -1],
      transition: { duration: 1, ease: 'easeInOut' }
    }}
    onPointerMove={handlePointerMove} 
    onPointerOut={handlePointerOut}// Ajouter un événement pour suivre la souris relative à chaque image
    ref={meshRef} position={position}>
      <planeGeometry args={[imageWidth, imageHeight, 128,128]} />  {/* Images plus grandes */}
      {texture && <TextureMaterial texture={texture} mouseRef={mouseRef} distortionRef={distortionRef} uTime={0} scrollRef={scrollRef} isScrolling={isScrolling} imageWidth={imageWidth} imageHeight={imageHeight} clicked={clicked}  />}
    
    </motion.mesh>

          </group>
  );
};



const Gallery = () => {
    
    const [uMouse, setUMouse] = useState(new THREE.Vector2(0.5, 0.5)); // Position de la souris
    const [uDistortion, setUDistortion] = useState(0); // Intensité de la distorsion
    const router = useRouter();

    // Nom du projet actuel

    const goToProject = (url) => {
      router.push(url);
    }
        
  return (
    <> 
    <div
      className={styles.galleryContainer}
    >
      <MusicButton />
<motion.p
initial={{opacity:0}}
animate={{opacity:1, transition:{
    type:"linear",
    duration:3,
    stiffness:50,
    repeat:Infinity,
    repeatType: "reverse"
}}}
className={styles.scrollDown}>Scroll Down</motion.p>



      
      {/* Canvas pour les images */}
      <Canvas
        style={{ width: '100%', height: '100%' }}
        camera={{ position: [0, 0, 25], near: 0.1, far: 1000 }}
        gl={{ toneMapping: THREE.NoToneMapping }}
      >
  
       <directionalLight 
  position={[5, 5, 5]} 
  intensity={1.5} 
  castShadow 
  shadow-mapSize={[1024, 1024]}
/>
<spotLight 
  position={[-5, 5, 5]} 
  angle={0.3} 
  intensity={1} 
  penumbra={0.5}
/>
<spotLight 
  position={[5, -5, -5]} 
  angle={0.3} 
  intensity={1} 
  penumbra={0.5}
/>
        <FloatingLights />
<FloatingLights />
<FloatingLights />
         <Suspense fallback={null}>
         <Items uMouse={uMouse} uDistortion={uDistortion}  />
        <IcosahedronScene ref={IcosahedronScene} />
         </Suspense>
         <Environment preset="studio" />
         <EffectComposer>
         <SelectiveBloom lights selection={IcosahedronScene.current}  luminanceThreshold={0} luminanceSmoothing={0.9} height={300} />
         <Vignette eskil={false} offset={0.1} darkness={0.8} />

         </EffectComposer>
      </Canvas>
      <Loader />
    </div>
    <div className={styles.mobileGalleryContainer}>
      <div className={`${styles.mobileProjectLinks}`}>
        {ImgUrls.map((item, i) => (
          <motion.div
            key={i}
            className={styles.projectLink}
            onClick={() => goToProject(item.url)}
            initial={{ opacity: 0, y:10, filter: 'blur(10px)'}}
            animate={{ opacity: 1, y:0, filter: 'blur(0px)'}}
            transition={{ duration: 1, delay: 0.2 * i}}
          >
            <p className={`${styles.mobileIndex}  ${wallpoet.className}`}>{`[ 0${i + 1} ]`}</p>
           <motion.p className={`${styles.mobileLinks}  ${oswald.className}`}>{item.name}</motion.p>
         
          </motion.div>
        ))}
      </div>
    <Canvas
        style={{ width: '100%', height: '100%' }}
        camera={{ position: [0, 0, 25], near: 0.1, far: 1000 }}
        gl={{ toneMapping: THREE.NoToneMapping }}
      >
  
       <directionalLight 
  position={[5, 5, 5]} 
  intensity={1.5} 
  castShadow 
  shadow-mapSize={[1024, 1024]}
/>
<spotLight 
  position={[-5, 5, 5]} 
  angle={0.3} 
  intensity={1} 
  penumbra={0.5}
/>
<spotLight 
  position={[5, -5, -5]} 
  angle={0.3} 
  intensity={1} 
  penumbra={0.5}
/>
        <FloatingLights />
<FloatingLights />
<FloatingLights />
         <Suspense fallback={null}>
       
        <IcosahedronScene ref={IcosahedronScene} />
         </Suspense>
         <Environment preset="studio" />
         <EffectComposer>
         <Bloom luminanceThreshold={0} luminanceSmoothing={0.9} height={300} />
         <Vignette eskil={false} offset={0.1} darkness={0.8} />

         </EffectComposer>
      </Canvas>
      <Loader />
    </div>
    </>
  );
};



const FloatingLights = () => {
    const lightRef = useRef();
    
    useFrame(({ clock }) => {
      const t = clock.getElapsedTime();
      lightRef.current.position.x = Math.sin(t * 1.5) * 2;
      lightRef.current.position.y = Math.cos(t * 1.2) * 2;
      lightRef.current.position.z = Math.sin(t * 0.8) * 2;
    });
  
    return (
      <pointLight ref={lightRef} intensity={20} color="white" distance={4} />
    );
  };


const ScrollTrigger = () => {
    const scroll = useScroll();
  
    return (
      <Html >
        <div style={{ position: 'fixed', bottom: 0, padding: 20 }}>
          <p>Scroll: {scroll?.offset}</p>
        </div>
      </Html>
    );
  }





const Items = ({ w = 0.7, gap = 20, uDistortion, uMouse, onPointerOver, onPointerOut}) => {
    const { viewport } = useThree()

  

/*     const images = [
        '/images/rendureliqueHd.png',
        '/images/Arthur.jpg',
        '/images/Alpine.png',
        '/images/NatureMorte.png',
      ]; */




   // Récupère la largeur de l'écran en 3D
      const imageWidth = viewport.width * 0.6; // Chaque image fait 60% de la largeur du viewport
      const spacing = viewport.width * 0.25; // Espacement entre les images (5% de la largeur du viewport)
    
      // Calcul du nombre de pages
      const totalWidth = ImgUrls.length * imageWidth + spacing * (ImgUrls.length - 1);
      const pageLength = totalWidth / viewport.width; 
    return (
      <ScrollControls horizontal damping={0.1} pages={pageLength}>
       <GalleryImages images={ImgUrls} uMouse={uMouse} uDistortion={uDistortion}   />
      </ScrollControls>
    )
  }

const GalleryImages = ({ images, uMouse, uDistortion, onPointerOver, onPointerOut  }) => {

const { viewport } = useThree();


  return (
    <>
      {/* Utilisation de Scroll pour rendre les images scrollables */}
      <Scroll>
        {ImgUrls.map((item, i) => (
          <WebGlImage
            imageIndex={i}
            key={i}
            url={item.src}
            position={[i * viewport.width * 0.7, 0, 0]}  // Position initiale des images
            uMouse={uMouse}
            uDistortion={uDistortion}
            imageName={item.name}
            projectUrl={item.url}
        
      
          />
        ))}
      </Scroll>
    </>
  );
};

export default Gallery;





