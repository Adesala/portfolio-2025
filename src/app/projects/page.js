import Image from "next/image";
import Gallery from "../components/WebGlScene";
import PageFadeInOut from "../components/PageAnimations/PageFadeInOut";

const  HomePage = ( ) => {
  return (
    <PageFadeInOut>
   <Gallery />
   </PageFadeInOut>
   
  )
}


export default HomePage 