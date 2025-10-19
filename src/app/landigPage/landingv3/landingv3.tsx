"use client";
import TopNav from "./TopNav";
 import HeroParallax from "./HeroParallax";
import ParallaxRowSection from "./ParallaxRowSection";
import { Footer } from "@/components/landing/footer";
 // import Parallax from "../landingv4/landingv4";
import heroImg from "@/assets/images/fondo.jpg";

const REPO_DATASET = 1;
const REPO_DOCUMENTO = 2;
const REPO_MAPA = 3;

export default function LandingPageV3() {
  return (
    
<main
      className="h-screen bg-background snap-y snap-mandatory overflow-y-scroll"
      style={{           backgroundImage: `url(${heroImg})`, backgroundSize: 'cover', backgroundAttachment: 'fixed' }}
    >      <TopNav />
    <HeroParallax className="snap-start h-screen" />
      <ParallaxRowSection
        titulo="Documentos populares"
        repositorioId={REPO_DOCUMENTO}
        verMasTo="/documentos"
        bgImage="/images/paper-texture.jpg"
        strength={140}
        className="snap-start h-screen px-10 bg-transparent"
      />
      <ParallaxRowSection
        titulo="Mapas destacados"
        repositorioId={REPO_MAPA}
        paginate={3}
        verMasTo="/mapas"
        bgImage="/images/map-tiles.jpg"
        strength={100}
        className="snap-start h-screen px-10 bg-transparent"
      />

      <ParallaxRowSection
        titulo="Datasets recientes"
        repositorioId={REPO_DATASET}
        verMasTo="/datasets"
        bgImage="/images/grid-noise.jpg"
        strength={80}
        className="snap-start h-screen px-10"
      />
     
      <div className="snap-start h-32 bg-primary text-primary-foreground">
        <Footer />
      </div>
    </main>
  );
}
