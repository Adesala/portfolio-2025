'use client'
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Loader, Environment} from "@react-three/drei";
import { Bloom, EffectComposer, Noise , Vignette } from '@react-three/postprocessing'
import React, {Suspense, useState, useRef, use, useEffect, useLayoutEffect} from 'react';
import styles from '../../assets/projectLayout.module.scss';
import IcosahedronScene from '../Icoshadedron';
import * as THREE from "three";
import {motion, useScroll, useTransform, useMotionValueEvent} from 'framer-motion';
import FramerMagnetic from '../FramerMagnetic';
import Link from 'next/link';
import projectInfos from "@/app/constant/projectsInfos";
import ReactPlayer from "react-player/youtube";
import { oswald, inter, wallpoet } from "../../assets/fonts";
import { useRouter } from 'next/navigation';



const Gallery = () => {
    
      
  return (
    <div
      className={styles.projectGalleryContainer}
    >
<div className={styles.projectGalleryFooter}></div>
      
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
        <IcosahedronScene ref={IcosahedronScene} />
         </Suspense>
         <Environment preset="studio" />
         <EffectComposer>
    
        <Bloom luminanceThreshold={0} luminanceSmoothing={0.9} height={300} />
        <Noise opacity={0.02} />
        <Vignette eskil={false} offset={0.1} darkness={0.9} />
         </EffectComposer>
      </Canvas>
      <Loader />
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
  console.log('Value:', latest)
  setScrollValue(latest)
})

console.log(project.imagesUrls)

const words = project?.text.split(" ")

const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // ou un autre composant de fallback
  }

  
  

  return (
    <div  className={styles.projectContainer}>
        <div className={styles.infoContainer}>
        <motion.p
         initial={{ opacity: 0, y:10, filter: 'blur(10px)'}}
         animate={{ opacity: 1, y:0, filter: 'blur(0px)'}}
         transition={{ duration: 1, delay: 0.2}}
        className={`${styles.homeSubTitle}`}>{`[ ${project.job} ]`}</motion.p>
        <motion.h1
        initial={{ opacity: 0, y:10, filter: 'blur(10px)'}}
        animate={{ opacity: 1, y:0, filter: 'blur(0px)'}}
        transition={{ duration: 2, delay: 0.8, type: 'linear', stiffness: 120}}
        className={`${styles.homeTitle} ${oswald.className}`}>{project?.title}</motion.h1>

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
<Gallery />
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
      clipPath: 'inset(100% 100% 100% 0%)', // L'état initial (complètement caché avec inset)
    }}
    transition={{
      duration: 1.5,
      delay:0.5, 
      type:'spring', // Durée de l'animation
       // Courbe de transition
    }}
    key={i} className={styles.item}>
       <img src={img} alt={project} />
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
)

};

const Word = ({children, progress, range}) => {
  const textOpacity = useTransform(progress, range, [0.1, 1])
  return <span className={styles.word}>
    <motion.span style={{opacity: textOpacity.current}}>{children}</motion.span>
  </span>
}


export default ProjectLayout