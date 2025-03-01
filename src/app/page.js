import Image from "next/image";
import Home from "./components/Home";
import PageFadeInOut from "./components/PageAnimations/PageFadeInOut";
const  HomePage = ( ) => {
  return (
    <PageFadeInOut>
   <Home />
   </PageFadeInOut>
  )
}


export default HomePage 