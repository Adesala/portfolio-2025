'use client'
import { useEffect } from 'react'
import PageFadeInOut from '../../components/PageAnimations/PageFadeInOut'
import ProjectLayout from '../../components/PageAnimations/ProjectLayout'
import Lenis from 'lenis' 
export default function ThirdProject(params) {
    useEffect(()=>  {
        const lenis = new Lenis()
        
        function raf(time) {
          lenis.raf(time)
          requestAnimationFrame(raf)
        }
        
        requestAnimationFrame(raf)
    },[]) 
  return (
    <PageFadeInOut>
   
<ProjectLayout  currentProject={params}></ProjectLayout>

      </PageFadeInOut>

  )
}
