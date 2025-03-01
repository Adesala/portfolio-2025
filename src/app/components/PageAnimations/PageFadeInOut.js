'use client'
import  {useState, useEffect} from 'react'
import styles from '../../assets/home.module.scss'
import { motion } from 'framer-motion'
import Image from 'next/image'

const fadeInOut = {
	initial: {
		opacity: 0,
		pointerEvents: 'none',
	},
	animate: {
		opacity: 1,
		pointerEvents: 'all',
	},
	exit: {
		opacity: 0,
		pointerEvents: 'none',
	},
}

const transition = {
	duration: 0.2,
	staggerChildren: 0.1,
}

const PageFadeInOut = ( props ) => { 



    const [slideOut,setSlideOut] = useState('')
    const [imgOpacity, setImgOpacity] = useState('100%')
    const [stopScroll, setStopScroll] = useState('disableScroll')
	const [isVisible, setIsVisible] = useState(true);



useEffect(()=> {
    setTimeout(()=>{
        setImgOpacity('0%')
    },500)
})


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
			enter={{opacity: 1}}
			animate={{opacity:0}}
			exit={{opacity: 1}}
			transition={{duration:1}}
	
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
