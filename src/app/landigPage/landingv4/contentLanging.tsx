"use client";

import { Footer } from "@/components/landing/footer";
import HeroParallax from "../landingv3/HeroParallax";
import Row from "../landingv3/row";
import {motion, useScroll, useSpring, useTransform} from "motion/react"
import heroImg from "@/assets/images/huascaran.jpg";
import React from "react";
const REPO_DATASET = 1;
const REPO_DOCUMENTO = 2;
const REPO_MAPA = 3;
  
export function Contentenido() {
  const ref = React.useRef<HTMLDivElement>(null);
const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"], // 0 cuando el top del hero toca el top viewport; 1 cuando el bottom toca el top
  });
 const yImg = useTransform(scrollYProgress, [0, 1], ["0%", "-25%"]);
  // Leve zoom para que no se noten bordes al mover
  const scaleImg = useTransform(scrollYProgress, [0, 1], [1.05, 1.15]);
  const yImgSmooth = useSpring(yImg, { stiffness: 120, damping: 20, mass: 0.3 });
  const scaleSmooth = useSpring(scaleImg, { stiffness: 120, damping: 20, mass: 0.3 });
  return (  
  <div>
    <main className="snap">
      <HeroParallax className="snap-start h-screen" />
     <div className="snap-start">
      <motion.div
        aria-hidden
        className="absolute inset-0  bg-cover  bg-center "
        style={{
          backgroundImage: `url(${heroImg})`,
          y: yImgSmooth,
          scale: scaleSmooth,
        }}
      />
       <Row titulo="Documentos populares" repositorioId={REPO_DOCUMENTO} verMasTo="/documentos" />
     </div>
     <div className="snap-start h-screen">
       <Row titulo="Mapas populares" repositorioId={REPO_MAPA} verMasTo="/documentos" />

     </div>
     <div className="snap-start h-screen">
       <Row titulo="Datasets populares" repositorioId={REPO_DATASET} verMasTo="/documentos" />

     </div>
          <StyleSheet/>

      <div className="snap-start h-32">
          <Footer />

      </div>

      

      <div className="snap-none md:snap-x h-32 bg-primary text-primary-foreground">
      </div>
    </main>
  </div>
  )
}
function StyleSheet() {
    return (
        <style>{`
        html {
            scroll-snap-type: y mandatory;
        }

        .img-container {
            height: 100vh;
            scroll-snap-align: start;
            display: flex;
            justify-content: center;
            align-items: center;
            position: relative;
        }

        .img-container > div {
            width: 300px;
            height: 400px;
            margin: 20px;
            background: #f5f5f5;
            overflow: hidden;
        }

        .img-container img {
            width: 300px;
            height: 400px;
        }

        @media (max-width: 500px) {
            .img-container > div {
                width: 150px;
                height: 200px;
            }

            .img-container img {
                width: 150px;
                height: 200px;
            }
        }

        .img-container h2 {
            color: #8df0cc;
            margin: 0;
            font-family: "Azeret Mono", monospace;
            font-size: 50px;
            font-weight: 700;
            letter-spacing: -3px;
            line-height: 1.2;
            position: absolute;
            display: inline-block;
            top: calc(50% - 25px);
            left: calc(50% + 120px);
        }

        .progress {
            position: fixed;
            left: 0;
            right: 0;
            height: 5px;
            background: #8df0cc;
            bottom: 50px;
            transform: scaleX(0);
        }
    `}</style>
    )
}
