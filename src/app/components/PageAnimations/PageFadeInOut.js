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
