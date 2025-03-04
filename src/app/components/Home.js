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


const Gallery = () => {
    
      
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
      
         </Suspense>
         <Environment preset="studio" />
         <EffectComposer>
         <IcosahedronScene ref={IcosahedronScene} />
        <Bloom luminanceThreshold={0} luminanceSmoothing={0.9} height={300} />
        <Noise opacity={0.02} />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
         </EffectComposer>
      </Canvas>
      <Loader />
    </div>
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


const Home = () => {
    return (
        <div className={styles.homeContainer}>
            <div className={styles.infoContainer}>
            <motion.p
             initial={{ opacity: 0, y:10, filter: 'blur(10px)'}}
             animate={{ opacity: 1, y:0, filter: 'blur(0px)'}}
             transition={{ duration: 1, delay: 0.2}}
            className={styles.homeSubTitle}>{`[ UX UI Design, Front-end Development, 3D Modeling ]`}</motion.p>
            <motion.h1
            initial={{ opacity: 0, y:10, filter: 'blur(10px)'}}
            animate={{ opacity: 1, y:0, filter: 'blur(0px)'}}
            transition={{ duration: 2, delay: 0.8, type: 'linear', stiffness: 120}}
            className={`${styles.homeTitle} ${oswald.className}`}>Creative Developer</motion.h1>

            </div>
            <div className={styles.btnContainer}>
            <FramerMagnetic>
    <Link style={{textAlign:'center'}} href={'/projects'}>    
       <motion.div

 initial={{ opacity: 0 ,x:20}}
 animate={{ opacity: 1, x:0 }}
 transition={{duration:1.5,delay:3.5, type:'spring'}}
className={styles.btnToSite}>
 <p className={styles.btnText}>{"SEE PROJECTS"}</p>
    <p className={styles.btnIcon}>&#10170;</p>

</motion.div>
</Link>
</FramerMagnetic>
</div>

            
            <div className={styles.homeHeader}>
<Gallery />
            </div>
        </div>
    )
}

export default Home;