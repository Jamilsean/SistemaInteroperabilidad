"use client";
import * as React from "react";
import { Link } from "react-router-dom";
import { ResourceTile } from "../landingv2/ResourceTile";
import type { Recurso, RecursosResponse } from "@/types/recursos";
import {  getRecursosPublic } from "@/services/recursosService";
import { Button } from "@/components/ui/button";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';

type Props = {
  titulo: string;
  repositorioId: number;      // 1 dataset, 2 documento, 3 mapa
  verMasTo: string;           // a dónde navegar con “Ver más”
  perPage?: number;
  paginate?: number;

};

export default function Row({ titulo, repositorioId, verMasTo, perPage = 12 ,paginate}: Props) {
  const [items, setItems] = React.useState<Recurso[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res: RecursosResponse = await getRecursosPublic(1, perPage, [repositorioId], "", "title", "views", "desc");
        setItems(res.data);
      } finally {
        setLoading(false);
      }
    })();
  }, [repositorioId, perPage]);

  return (
    <section className=" h-screen  bg-gradient-to-t  ">

      <div className="container grid content-center mx-auto px-4 lg:px-8 h-full ">
        <div className="flex items-end justify-between mb-3  ">
          <h2 className="text-2xl  uppercase font-semibold p-2  border-l-8 border-[#00B188] ">{titulo}</h2>
          <Button variant="link" asChild>
            <Link to={verMasTo}>Ver más</Link>
          </Button>
        </div>


        <div className="overflow-x-auto h-full rounded-lg  p-2 ">
          <div className="flex gap-6 snap-x">
            <Swiper
              slidesPerView={paginate || 5}
              spaceBetween={30}
              pagination={{
                clickable: true,
              }}
              autoplay={{
                delay: 2500,
                disableOnInteraction: false,
              }}
              modules={[Autoplay, Pagination, Navigation]}

              className="mySwiper"
            >


              {loading && <div className="py-10 text-muted-foreground animate-pulse">Cargando…</div>}
              {!loading && items.map((r,idx) => (

                <div key={r.id} className="w-72  shrink-0 snap-start rounded-lg  border-b-10 border-[#00B188]   ">
                  <SwiperSlide  key={`slide-${r.id ?? "noid"}-${idx}`}><ResourceTile r={r} /></SwiperSlide>
                </div>
              ))}
            </Swiper>
            {!loading && items.length === 0 && <div className="py-10 text-muted-foreground">Sin elementos</div>}
          </div>
        </div>
      </div>
    </section>
  );
}
