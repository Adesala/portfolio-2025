"use client"
import { useEffect } from "react";
import Image from "next/image";
import Home from "./components/Home";
import PageFadeInOut from "./components/PageAnimations/PageFadeInOut";
import Lenis from 'lenis'
import { useAsteroidImpactSound } from "./components/useAsteroideSound";



const  HomePage = ( ) => {
 useEffect(()=>  {
 const lenis = new Lenis()
        
        function raf(time) {
          lenis.raf(time)
          requestAnimationFrame(raf)
        }
        
        requestAnimationFrame(raf)
    },[]) 

     useAsteroidImpactSound("/sounds/earthquake.mp3")
  
  return (
    <PageFadeInOut>
   <Home />
   </PageFadeInOut>
  )
}


export default HomePage 