'use client'
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture, ScrollControls, Scroll ,useScroll, Loader, useVideoTexture, Html, Environment} from "@react-three/drei";
import { Bloom, DepthOfField, EffectComposer, Noise, SelectiveBloom, Vignette , LensFlare, BrightnessContrast } from '@react-three/postprocessing'
import React, {Suspense, useState, useRef} from 'react';
import styles from '../assets/home.module.scss';
import IcosahedronScene from './Icoshadedron';
import * as THREE from "three";
import {motion} from 'framer-motion';
import FramerMagnetic from './FramerMagnetic';
import Link from 'next/link';
import { oswald } from '../assets/fonts';
import MusicButton from "./MusicButton";
import { Value } from "sass";


const FogBackground = () => {
  const { scene } = useThree();
 

  // Couleur et distances de fog
  scene.fog = new THREE.FogExp2('#193b5a', 0.0025); // brume exponentielle

  return null;
}


const SceneLoadedCallback = ({ onLoaded }) => {
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      onLoaded();
    }, 50); // délai pour s'assurer que le Canvas est rendu
    return () => clearTimeout(timeout);
  }, [onLoaded]);

  return null;
};


const Gallery = ({ setSceneLoaded }) => {
    

  
      
  return (
    <div
      className={styles.homeGalleryContainer}
    >
        <MusicButton />
      
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
  color={'blue'} 
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
    <IcosahedronScene  ref={IcosahedronScene}  />
      <SceneLoadedCallback onLoaded={() => setSceneLoaded(true)} />
</Suspense>
         <Environment preset="studio" environmentIntensity={0.1} />
         <EffectComposer>
     {/*  <LensFlare enabled={true}  opacity={1} followMouse={true} /> */}
        <Bloom luminanceThreshold={0.15} luminanceSmoothing={0.7} height={480} kernelSize={7}  mipmapBlur />
        <Noise opacity={0.02} />
        <Vignette eskil={false} offset={0.6} darkness={0.8} />
         </EffectComposer>
      </Canvas>
      <Loader  dataInterpolation={(p) => `Loading ${p.toFixed(0)}%`} barStyles={{ background: 'blue', height: '4px', borderRadius: '2px' }} />
    </div>
  );
};

const FloatingLights = () => {
    const lightRef = useRef();
    
    useFrame(({ clock }) => {
      const t = clock.getElapsedTime();
      lightRef.current.position.x = Math.sin(t * 1.5) * 2;
      lightRef.current.position.y = Math.cos(t * 1.2) * 2;
      lightRef.current.position.z = Math.sin(t * 2) * 2;
    });
  
    return (
      <pointLight ref={lightRef} intensity={20} color="blue" distance={4} />
    );
  };


const Home = () => {
   const [sceneLoaded, setSceneLoaded] = useState(false);
   console.log('Scene loaded state:', sceneLoaded);
    return (
        <div className={styles.homeContainer}>
          {sceneLoaded && (         <><div className={styles.infoContainer}>

          <motion.p
            initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 1, delay: 0.2 }}
            className={styles.homeSubTitle}>{`[ UX UI Design, Front-end Development, 3D Modeling ]`}</motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 2, delay: 0.8, type: 'linear', stiffness: 120 }}
            className={`${styles.homeTitle} ${oswald.className}`}>Creative Studio</motion.h1>

        </div><div className={styles.btnContainer}>
            <FramerMagnetic>
              <Link style={{ textAlign: 'center' , display: sceneLoaded ? 'block' : 'none' }} href={'/projects'}>
                <motion.div

                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.5, delay: 0.8, type: 'linear' }}
                  className={styles.btnToSite}>
                  <p className={styles.btnText}>{"SEE PROJECTS"}</p>
                  <p className={styles.btnIcon}>&#10170;</p>

                </motion.div>
              </Link>
            </FramerMagnetic>
          </div>  </> )}


            
            <div className={styles.homeHeader}>
<Gallery setSceneLoaded={setSceneLoaded} />
            </div>
          
        </div>
    )
}

export default Home;