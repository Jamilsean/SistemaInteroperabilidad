"use client";
import TopNav from "../landingv3/TopNav";
import { Contentenido } from "./contentLanging";

export default function LandingPageV4() {
  // const { scrollYProgress } = useScroll()
    // const scaleX = useSpring(scrollYProgress, {
    //     stiffness: 100,
    //     damping: 30,
    //     restDelta: 0.001,
    // })

    return (
        <div id="example">
           <TopNav></TopNav>
           <Contentenido></Contentenido>

        </div>

    )
}

   {/*return (
    <main className="">
      
      <TopNav />
    <HeroParallax className="snap-start h-screen" />
      <ParallaxRowSection
        titulo="Documentos populares"
        repositorioId={REPO_DOCUMENTO}
        verMasTo="/documentos"
        bgImage="/images/paper-texture.jpg"
        strength={140}
        className="snap-start h-screen"
      />
  <Parallax></Parallax>
      <ParallaxRowSection
        titulo="Mapas destacados"
        repositorioId={REPO_MAPA}
        verMasTo="/mapas"
        bgImage="/images/map-tiles.jpg"
        strength={100}
        className="snap-start h-screen"
      />

      <ParallaxRowSection
        titulo="Datasets recientes"
        repositorioId={REPO_DATASET}
        verMasTo="/datasets"
        bgImage="/images/grid-noise.jpg"
        strength={80}
        className="snap-start h-screen"
      />

      <div className="snap-start h-32 bg-primary text-primary-foreground">
        <Footer />
      </div> 
    </main>
  );
}
*/}