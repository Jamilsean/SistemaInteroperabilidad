"use client";
import * as React from "react";
 import RowMeili from "./rowMeilisearch";
type Props = {
  titulo: string;
  repositorioId: number;
  verMasTo: string;
  bgImage?: string;  
  strength?: number; 
  paginate?: number; 
  className?: string;
};

export default function ParallaxRowSectionMeili({
  titulo,
  repositorioId,
  verMasTo,
  paginate,
  // bgImage = "/images/IMAGEN.jpg",
  // strength = 120,  // ajusta para más/menos parallax
  className = "", // valor predeterminado vacío
}: Props) {
  const ref = React.useRef<HTMLDivElement>(null);

  // const { scrollYProgress } = useScroll({
  //   target: ref,
  //   offset: ["start end", "end start"], // anima mientras la sección entra/sale
  // });

  // De 0 a 1 → muevo el fondo un poquito
  // const y = useTransform(scrollYProgress, [0, 1], [strength, -strength]);
  // const ySmooth = useSpring(y, { stiffness: 120, damping: 20, mass: 0.3 });

  return (
    <section
      ref={ref}
      className={`relative ${className}`}
    >
      
      <div  />

      {/* Contenido */}
      <RowMeili titulo={titulo} repositorioId={repositorioId} verMasTo={verMasTo} paginate={paginate} />
    </section>
  );
}
