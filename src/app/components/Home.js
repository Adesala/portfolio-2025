'use client'
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture, ScrollControls, Scroll, Loader, useVideoTexture, Html, Environment, useProgress} from "@react-three/drei";
import { Bloom, DepthOfField, EffectComposer, Noise, SelectiveBloom, Vignette , LensFlare, BrightnessContrast } from '@react-three/postprocessing'
import React, {Suspense, useState,useRef, useEffect} from 'react';
import styles from '../assets/home.module.scss';
import IcosahedronScene from './Icoshadedron';
import * as THREE from "three";
import {motion, useScroll, useSpring, useTransform} from 'framer-motion';
import FramerMagnetic from './FramerMagnetic';
import Link from 'next/link';
import { oswald, spaceGrotesk} from '../assets/fonts';
import MusicButton from "./MusicButton";
import { Value } from "sass";
import { loadFXBuffers } from './audio/audioBuffer';
import FogPlane from "./BackgroundSmoke";
import WelcomeModal from "./WelcomeModal";
import Image from "next/image";
import projectInfos from "../constant/projectsInfos";
import { ScrollTimeline } from "./scrollingTimeLine";
import { AnimatedSection } from "./AnimatedSection";
import { sectionsData } from "../constant/sectionsData";


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

const CameraRig = () => {
  const { camera, mouse } = useThree()
  const target = useRef(new THREE.Vector3())

  useFrame(() => {
    const intensity = 0.3 // très faible pour effet premium

    target.current.set(
      mouse.x * intensity,
      mouse.y * intensity,
      camera.position.z
    )

    camera.position.lerp(target.current, 0.05)

    camera.lookAt(0, 0, 0)
  })

  return null
}



function MyLoader() {
  const { active, progress } = useProgress()
  const [visible, setVisible] = useState(true)
  const [displayProgress, setDisplayProgress] = useState(0)

  // Smooth progress interpolation
  useEffect(() => {
    let raf
    const update = () => {
      setDisplayProgress(prev => {
        const diff = progress - prev
        if (Math.abs(diff) < 0.5) return progress
        return prev + diff * 0.08
      })
      raf = requestAnimationFrame(update)
    }
    update()
    return () => cancelAnimationFrame(raf)
  }, [progress])

  // Hide loader only when everything is fully done
  useEffect(() => {
    if (!active && progress === 100) {
      const timeout = setTimeout(() => {
        setVisible(false)
        document.body.style.overflow = "auto"
      }, 500) // petite latence premium
      return () => clearTimeout(timeout)
    }
  }, [active, progress])

  // Block scroll while loading
  useEffect(() => {
    if (visible) {
      document.body.style.overflow = "hidden"
    }
  }, [visible])

  if (!visible) return null

  return (
    <motion.div
      className={styles.loaderPage}
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      <Image src="/images/loader.svg" alt="Loading..." width={300} height={300} />
      <p>{displayProgress.toFixed(0)} % </p>
   
    </motion.div>
  )
}

const SectionWrapper = ({ data, reverse, scrollProgress }) =>  {


  return (
    <AnimatedSection
      id={data.id}
      title1={data.title1}
      title2={data.title2}
      subtitle={data.subtitle}
      image={data.image}
      reverse={reverse}
      scrollProgress={scrollProgress}
    />
  )
}


const Gallery = ({ setSceneLoaded, scrollProgress }) => {
    
  const [buffersLoaded, setBuffersLoaded] = useState(false);

  useEffect(() => {
    loadFXBuffers().then(() => setBuffersLoaded(true));
  }, []);

  const bgPositionY = useTransform(
  scrollProgress,
  [0, 1],
  ['0%', '50%']
)
  
      
  return (
    <motion.div
      className={styles.homeGalleryContainer}
      style={{
    backgroundPositionY: bgPositionY
  }}
    >
       
      
      {/* Canvas pour les images */}
      <Canvas
      className={styles.homeGalleryCanvas}
        style={{ width: '100%', height: '100%' }}
      
        camera={{ position: [0, 0, 25], near: 0.1, far: 1000 }}
        gl={{ toneMapping: THREE.NoToneMapping }}
      >
  <FogPlane />
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
    <IcosahedronScene  ref={IcosahedronScene}  scrollProgress={scrollProgress} projectInfos={projectInfos} />
      <SceneLoadedCallback onLoaded={() => setSceneLoaded(true)} />
</Suspense>
         <Environment preset="studio" environmentIntensity={0.1} />
         <EffectComposer>
     {/*  <LensFlare enabled={true}  opacity={1} followMouse={true} /> */}
        <Bloom luminanceThreshold={0.15} luminanceSmoothing={0.7} height={480} kernelSize={7}  mipmapBlur />
        <Noise opacity={0.05} />
        <Vignette eskil={false} offset={0.6} darkness={0.8} />
         </EffectComposer>
     <CameraRig />
      </Canvas>
         
    </motion.div>
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





const Home = ({setLoading}) => {

const totalSections = sectionsData.length
const totalBlocks = totalSections + 1
const blockSize = 1 / totalBlocks

const sections = [
  {
    start: 0,
    end: blockSize,
    link: '#intro',
    label1: "Intro",
    label2: "Intro"
  },
  ...sectionsData.map((s, i) => ({
    start: blockSize * (i + 1),
    end: blockSize * (i + 2),
    link: `#${s.id}`,
    label1: s.title1,
    label2: s.title2
  }))
]

  const { scrollYProgress } = useScroll();

// smoothing premium
const smoothScroll = useSpring(scrollYProgress, {
  stiffness: 80,
  damping: 20,
  mass: 0.5
});


   const [sceneLoaded, setSceneLoaded] = useState(false);
   console.log('Scene loaded state:', sceneLoaded);
    return (
      <> 
      <MyLoader />  
      <WelcomeModal />
      <ScrollTimeline scrollProgress={smoothScroll} sections={sections} side="left"  />
      
        <div className={styles.homeContainer}>

 <MusicButton />

            
            <div id="intro" className={styles.homeHeader}>
              <div className={styles.homeHeaderCanvas}>
<Gallery setSceneLoaded={setSceneLoaded} scrollProgress={scrollYProgress} projectInfos={projectInfos} />
</div>
          {sceneLoaded && (         <><div className={styles.infoContainer}>

      
          <motion.h1
           initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className={`${styles.homeTitle} ${spaceGrotesk.className}`}><span className={styles.light}>Creative</span>{" "}
  <span className={styles.bold}>Studio</span></motion.h1>
                <motion.p
            initial={{ opacity: 0, y: 10, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 1, delay: 0.2 }}
            className={styles.homeSubTitle}>{`[ UX UI Design, Front-end Development, 3D Modeling ]`}</motion.p>

        </div><div className={styles.btnContainer}>
            <FramerMagnetic>
              <Link style={{ textAlign: 'center' , display: sceneLoaded ? 'block' : 'none' }} href={'/projects'}>
                <motion.div

                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1.5, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  className={styles.btnToSite}>
                  <p className={styles.btnText}>{"SEE PROJECTS"}</p>
                  <p className={styles.btnIcon}>&#9830;</p>

                </motion.div>
              </Link>
            </FramerMagnetic>
          </div>  </> )}
            </div>
          {sectionsData.map((section, index) => (
  <SectionWrapper
    key={section.id}
    data={section}
    reverse={index % 2 !== 0}
    scrollProgress={smoothScroll}
  />
))}
          
        </div>
        </>
    )
}

export default Home;