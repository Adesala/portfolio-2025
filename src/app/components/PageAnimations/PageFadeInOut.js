/* 'use client'

import { useRef, useEffect } from 'react'
import { motion, useMotionValue, animate } from 'framer-motion'
import { Canvas, useFrame } from '@react-three/fiber'
import styles from '../../assets/home.module.scss'

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`

const fragmentShader = `
  precision mediump float;

  uniform float uProgress;
  uniform float uTime;
  varying vec2 vUv;

  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }

  void main() {
    float noise = random(vUv * 8.0 + uTime * 0.1);

    float mask = 1.0 - smoothstep(
      uProgress - 0.2,
      uProgress + 0.2,
      noise
    );

    gl_FragColor = vec4(vec3(0.0), mask);
  }
`

const SmokePlane = ({ progress }) => {
  const material = useRef()
  console.log('progress value:', progress.get())

  useFrame(({ clock }) => {
    material.current.uniforms.uTime.value = clock.elapsedTime
    material.current.uniforms.uProgress.value = progress.get()
  })

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={material}
        transparent
        depthWrite={false}
        uniforms={{
          uProgress: { value: 0 },
          uTime: { value: 0 }
        }}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </mesh>
  )
}

const PageFadeInOut = ({ children }) => {
  const progress = useMotionValue(0)

  useEffect(() => {
    animate(progress, 1, {
      duration: 0.8,
      ease: 'easeInOut'
    })
  }, [])

  return (
    <>
      {children}

      <div className={styles.slideIn}>
        <Canvas
          orthographic
          camera={{ position: [0, 0, 1], zoom: 1 }}
          style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none'
          }}
        >
          <SmokePlane progress={progress} />
        </Canvas>
      </div>
    </>
  )
}

export default PageFadeInOut
 */
'use client'
import  {useState, useEffect} from 'react'
import styles from '../../assets/home.module.scss'
import { motion } from 'framer-motion'
import Image from 'next/image'



const transition = {
	duration: 0.2,
	staggerChildren: 0.1,
}

const PageFadeInOut = ( props ) => { 

	const [scale, setScale] = useState(1)


	return (


		<>
	<motion.div
		initial='initial'
		animate='animate'
		exit='exit'
		variants={ '' }
		transition={ transition }
		{ ...props }
	/> 
	<motion.div
			
			className={styles.slideIn}
	/* 		initial={{clipPath: 'inset(0% 0% 0% 0%)'}}
			animate={{clipPath: 'inset(0% 0% 100% 0%)'}}
			exit={{clipPath: 'inset(0% 0% 0% 0%)'}} */
			initial={{ opacity: 1, scale: 1 }}
			animate={{ opacity: 0, scale: scale }}
			exit={{ opacity: 1, scale: 1 }}
			transition={{
			  opacity: { duration: 0.8, ease: "easeInOut" },  // Opacité disparaît d'abord
			  scale: { duration: 0.1, ease: "easeInOut" }    // Le scale se produit après l'opacité
			}}
			onAnimationComplete={() => setScale(0)} 
	
	
		>
			</motion.div>
		{/* 	 <motion.div
		
			className={styles.slideOut}
			initial={{scaleY: 1}}
			animate={{scaleY:0}}
			exit={{scaleY:0}}
			transition={{duration:0.5,delay:1}}
		
		>
			<img className={styles.logo} alt='logo' style={{opacity:imgOpacity}} width={'200'} height={'200'} src={'/images/LOGO.png'} /></motion.div> 
	 */}
	
	</>
	
	)
	

	}

export default PageFadeInOut