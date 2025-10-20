"use client";
import * as React from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

import heroImg from "@/assets/images/huascaran.jpg";
 import HeroSearchMeili from "./HeroSearchMeili";
type HeroParallaxProps = {
  className?: string; // Permitir clases adicionales
};

export default function HeroParallaxMeili({ className = "" }: HeroParallaxProps) {
  const ref = React.useRef<HTMLDivElement>(null);

  // Progreso del scroll relativo al hero
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"], // 0 cuando el top del hero toca el top viewport; 1 cuando el bottom toca el top
  });

  // Parallax: la capa de imagen se desplaza hacia arriba a medida que scrolleas
  const yImg = useTransform(scrollYProgress, [0, 1], ["0%", "-25%"]);
  // Leve zoom para que no se noten bordes al mover
  const scaleImg = useTransform(scrollYProgress, [0, 1], [1.05, 1.15]);

  // Suavizado
  const yImgSmooth = useSpring(yImg, { stiffness: 120, damping: 20, mass: 0.3 });
  const scaleSmooth = useSpring(scaleImg, { stiffness: 120, damping: 20, mass: 0.3 });

  return (
    <section
      ref={ref}
      className={`relative border  h-screen w-full   overflow-hidden ${className}`}
    > 
     <motion.div
        aria-hidden
        className="absolute inset-0  bg-cover  bg-center "
        style={{
          backgroundImage: `url(${heroImg})`,
          y: yImgSmooth,
          scale: scaleSmooth,
        }}
      />
      {/* Contenido */}
      <div className="relative h-full  flex items-center  flex-col ">
         <h1 className="text-3xl text-center uppercase pt-30 pb-15    lg:text-4xl font-bold mb-10 " style={{ color: "rgb(0,62,118)" }}>
            Encuentra Documentos, Mapas y Datasets del repositorio
            </h1>
        <div className="container mx-auto px-4 lg:px-8 w-full">
          <HeroSearchMeili />
        </div>
      </div>
    </section>
  );
}
