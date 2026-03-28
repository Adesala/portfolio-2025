'use client'
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Loader, Environment, useProgress} from "@react-three/drei";
import { Bloom, EffectComposer, Noise , Vignette } from '@react-three/postprocessing'
import React, {Suspense, useState, useRef, use, useEffect, useLayoutEffect} from 'react';
import styles from '../../assets/projectLayout.module.scss';
import IcosahedronScene from '../Icoshadedron';
import * as THREE from "three";
import {motion, useScroll, useTransform, useMotionValueEvent, AnimatePresence} from 'framer-motion';
import FramerMagnetic from '../FramerMagnetic';
import Link from 'next/link';
import projectInfos from "@/app/constant/projectsInfos";
import ReactPlayer from "react-player/youtube";
import { oswald, inter, wallpoet, spaceGrotesk } from "../../assets/fonts";
import { useRouter } from 'next/navigation';
import Image from "next/image";
import MusicButton from "../MusicButton";
import FogPlane from "../BackgroundSmoke";

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
      {displayProgress.toFixed(0)} %
    </motion.div>
  )
}



const SceneLoadedCallback = ({ onLoaded }) => {
  const [called, setCalled] = useState(false);

  useEffect(() => {
    if (!called) {
      onLoaded();
      setCalled(true); // on ne rappelle pas onLoaded plusieurs fois
    }
  }, [called, onLoaded]);

  return null;
};

const Gallery = ({onLoaded,project}) => {

   const [sceneLoaded, setSceneLoaded] = useState(false);

  useEffect(() => {
    if (sceneLoaded) onLoaded(); // Quand le canvas est prêt, on déclenche le loader ready
  }, [sceneLoaded]);
    
  return (
    <div
      className={styles.projectGalleryContainer}
    >
      <MusicButton />
<div className={styles.projectGalleryFooter}></div>
      
      {/* Canvas pour les images */}
      <Canvas
        style={{ width: '100%', height: '100%' }}
        camera={{ position: [0, 0, 25], near: 0.1, far: 1000 }}
        gl={{ toneMapping: THREE.NoToneMapping }}
      >
    <FogPlane />
       <directionalLight 
  position={[5, 5, 5]} 
  intensity={1.5} 
  color={project.colors ? project.colors[0] : 'white'}
  castShadow 
  shadow-mapSize={[1024, 1024]}
/>
       <directionalLight 
  position={[5, 0, -5]} 
  intensity={1.5} 
  color={project.colors ? project.colors[1] : 'white'}
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
          <SceneLoadedCallback onLoaded={() => setSceneLoaded(true)} />
         </Suspense>
         <Environment preset="studio"  environmentIntensity={0.1} />
         <EffectComposer>
    
       <Bloom luminanceThreshold={0.15} luminanceSmoothing={0.7} height={480} kernelSize={7}  mipmapBlur />
        <Noise opacity={0.02} />
           <Vignette eskil={false} offset={0.6} darkness={0.8} />
         </EffectComposer>
      </Canvas>
      <MyLoader />
    </div>
  );
}


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


 const ProjectLayout = ({props, currentProject}) => {

  
const router = useRouter()
const projectName = use(currentProject.params)
const project = projectInfos.find(p => p.projectUrl === `/projects/${projectName.projectName}/`);
const container = useRef(null);
const [, setScrollValue] = useState()
const textContainer = useRef(null)
const [key, setKey] = useState(0);
const [isMounted, setIsMounted] = useState(false);

const [loaderReady, setLoaderReady] = useState(false);

// Callback pour savoir quand tout est chargé
const handleSceneLoaded = () => setLoaderReady(true);

console.log('Current project:', project);

useEffect(() => {
  const timer = setTimeout(() => {
    if (container.current) {
   
      setIsMounted(true); // Active l'animation une fois l'élément monté
    }
  }, 100); // Le délai peut être ajusté, cela permet de retarder l'exécution de useScroll jusqu'à ce que le DOM soit complètement prêt.

  return () => clearTimeout(timer); // Nettoyage du timer à la destruction du composant
}, []);

const { scrollYProgress } = useScroll({

  target: isMounted ? container : null,

  offset: ["start 0.8", "start 0.25"],
  
})


useMotionValueEvent(scrollYProgress, 'change', (latest) => {
  setScrollValue(latest)
})



const words = project?.text.split(" ")

const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // ou un autre composant de fallback
  }

  
  const title = project?.title?.split(" ");

  return (
    <> 
    <MyLoader />
    <div  className={styles.projectContainer} style={{backgroundImage:`url(${project.textureName})`}}>
  
        <div className={styles.infoContainer}>
        
        <motion.h1
       

className={`${styles.homeTitle} ${spaceGrotesk.className}`}>  
<motion.span  initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
transition={{ duration: 1.2, delay: 2, ease: [0.22, 1, 0.36, 1] }} className={styles.light}>{title[0]}</motion.span>{" "}
<motion.span  initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
transition={{ duration: 1.2, delay: 2, ease: [0.22, 1, 0.36, 1] }} className={styles.bold}>{title[1]}</motion.span>
  </motion.h1>
         <motion.p
      initial={{ opacity: 0 }}
animate={{ opacity: 0.7 }}
transition={{ duration: 1, delay: 2.5 }}
        className={`${styles.homeSubTitle}`}>{`[ ${project.job} ]`}</motion.p>
        </div>
       
        <div className={styles.btnContainer}>
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
</div>

        
        <div className={styles.projectHeader}>
<Gallery project={project} onLoaded={handleSceneLoaded} />
        </div>
        <div ref={textContainer} className={styles.projectContent}>
          <p className={styles.projectCount}>{`[ Project 0${project.id + 1} / 0${projectInfos.length} ]`}</p>
          <p key={key} ref={container} className={`${styles.paragraph} ${inter.className}`}>
  {words.map( (word, i) => {

const start = i / words.length

const end = start + (1 / words.length)

return <Word key={i} progress={scrollYProgress} range={[start, end]}>{word}</Word>

})}
  </p>

<div className={styles.projectImages}>
  {project?.imagesUrls && (
  project?.imagesUrls.map((img, i) => (
    <motion.div
    whileInView={{
      clipPath: 'inset(0% 0% 0% 0%)', // L'animation de clip-path quand l'élément devient visible
    }}
    initial={{
      clipPath: 'inset(100% 0% 100% 0%)', // L'état initial (complètement caché avec inset)
    }}
    transition={{
      duration: 1.5,
      delay:0.1,
      ease:'easeInOut', // Courbe de transition 
    }}
    key={i} className={styles.item}>
       <Image src={img} alt={project} width={0} height={0}   sizes="100vw" 
  className="w-full h-auto"  priority />
    </motion.div>
  ))
  )}

  {isClient && project?.videoUrl && (
      <motion.div
      className={styles.videoContainer}
       key="wrapper"
       initial={{ opacity: 0 , x: 20}}
       animate={{ opacity: 1, x:0 }}
       transition={{duration:"1",delay:"1.4", stiffness:15}}>
       
          
          <ReactPlayer 
          className={styles.player}
        
          loop
          controls
          playing={true}
          muted
          volume={null}     
url={project?.videoUrl}
/>

          
 </motion.div> 
  )}



</div>
{project?.websiteLink && (
      <FramerMagnetic>
      <motion.div
       key="text"
       initial={{ opacity: 0 ,x:-20}}
       animate={{ opacity: 1, x:0 }}
       transition={{duration:"1.5",delay:"2", stiffness:15}}
      className={styles.btnToSite}>
        <a href={project.websiteLink} target="_blank">
      <p className={styles.btnText}>{`GO TO WEBSITE`}</p>
      <p className={styles.btnIcon}>&#10149;</p>
      </a>
      
      </motion.div>
      </FramerMagnetic>
   
)}

<motion.div className={styles.projectNavigationContainer}>
{project.id > 0 && (
<Link style={{width: project.id > projectInfos.length - 1 ? '50%' : '100%'}} href={projectInfos[project.id - 1].projectUrl}>    
       <motion.div
 key="text"
 initial={{ opacity: 0 ,x:-20}}
 animate={{ opacity: 1, x:0 }}
 transition={{duration:"1.5",delay:"2", stiffness:15}}
 disabled={project.id === 0}
className={styles.btnToProject}>
    <motion.div className={styles.btnOverlay}>
    </motion.div>  
<p>{`[ 0${project.id + 1 - 1} ]`}</p>
<motion.h1
 whileInView={{
  clipPath: 'inset(0% 0% 0% 0%)', // L'animation de clip-path quand l'élément devient visible
}}
initial={{
  clipPath: 'inset(0% 0% 100% 0%)', // L'état initial (complètement caché avec inset)
}}
transition={{
  duration: 1.5,
  delay:0.5, 
  type:'spring', // Durée de l'animation
   // Courbe de transition
}}
className={`${styles.btnText} ${oswald.className}`}>{projectInfos[project.id - 1].title}</motion.h1>
</motion.div>
</Link>
)}
{project.id < projectInfos.length - 1 && (
<Link style={{width: project.id < 0 ? '50%' : '100%'}} href={projectInfos[project.id + 1].projectUrl}>
<motion.div
 key="text"
 initial={{ opacity: 0 ,x:-20}}
 animate={{ opacity: 1, x:0 }}
 transition={{duration:"1.5",delay:"2", stiffness:15}}

          disabled={project.id  === projectInfos.length - 1}

className={styles.btnToProject}>
    <p>{`[ 0${project.id + 1 + 1} ]`}</p>
      <motion.h1
       whileInView={{
        clipPath: 'inset(0% 0% 0% 0%)', // L'animation de clip-path quand l'élément devient visible
      }}
      initial={{
        clipPath: 'inset(0% 0% 100% 0%)', // L'état initial (complètement caché avec inset)
      }}
      transition={{
        duration: 1.5,
        type:'spring', // Durée de l'animation
         // Courbe de transition
      }}
      className={`${styles.btnText} ${oswald.className}`}>{projectInfos[project.id  + 1].title}</motion.h1>
  <motion.div className={styles.btnOverlay}>
    </motion.div>     

</motion.div>
</Link>
)}
</motion.div>

<div className={styles.projectFooter}>
  <div className={styles.projectFooterEmail}>
    <a href="mailto:madeo.decoration@gmail.com?subject=Votre%20sujet&body=Votre%20message" target="_blank">
    <p className={`${wallpoet.className} ${styles.emailSender}`}>[ Stay in touch ! ]</p>
    </a>
  </div>
   </div>
        </div>
    </div>
    </>
)

};

const Word = ({children, progress, range}) => {
  const textOpacity = useTransform(progress, range, [0.1, 1])
  return <span className={styles.word}>
    <motion.span style={{opacity: textOpacity.current}}>{children}</motion.span>
  </span>
}


export default ProjectLayout