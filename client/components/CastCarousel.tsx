"use client";

import { useRef } from "react";
import { useDragScroll } from "@/hooks/useDragScroll";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CastCarouselProps {
  cast: any[];
}

export default function CastCarousel({ cast }: CastCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null);
  useDragScroll(carouselRef);

  const scroll = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const { scrollLeft, clientWidth, scrollWidth } = carouselRef.current;
      const maxScroll = scrollWidth - clientWidth;

      let scrollTo =
        direction === "left"
          ? scrollLeft - clientWidth * 0.75
          : scrollLeft + clientWidth * 0.75;

      // Loop infinito
      if (direction === "right" && scrollLeft >= maxScroll - 10) scrollTo = 0;
      else if (direction === "left" && scrollLeft <= 10) scrollTo = maxScroll;

      carouselRef.current.scrollTo({
        left: scrollTo,
        behavior: "smooth",
      });
    }
  };

  return (
    <TooltipProvider>
      <div className="relative group">
        <div
          ref={carouselRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
        >
          {cast.map((person, index) => (
            <motion.div
              key={person.id}
              className="flex-shrink-0 w-[140px]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href={`/pessoa/${person.id}`}
                    className="block rounded-xl overflow-hidden cursor-pointer group/actor border border-white/10 hover:border-white/25 transition-all duration-300 hover:shadow-lg"
                  >
                    {person.profile_path ? (
                      <div className="relative h-[210px] w-[140px]">
                        <Image
                          src={`https://image.tmdb.org/t/p/h632${person.profile_path}`}
                          alt={person.name}
                          width={140}
                          height={210}
                          quality={90}
                          draggable={false}
                          className="object-cover w-full h-full group-hover/actor:scale-[1.03] transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/actor:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3">
                          <span className="h-7 px-3 rounded-full bg-black/65 border border-white/20 backdrop-blur-md text-[11px] font-semibold text-white inline-flex items-center gap-1 leading-none">
                            Ver filmografia
                            <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-[210px] bg-white/[0.04] flex flex-col items-center justify-center hover:bg-white/[0.08] transition-colors">
                        <User className="w-7 h-7 text-neutral-600 mb-2" />
                        <span className="text-neutral-500 text-xs text-center px-2">
                          Ver filmografia
                        </span>
                      </div>
                    )}
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ver filmografia de {person.name}</p>
                </TooltipContent>
              </Tooltip>

              <div className="mt-2.5">
                <Link
                  href={`/pessoa/${person.id}`}
                  className="block font-semibold text-[13.5px] text-neutral-100 hover:text-white transition-colors leading-snug truncate"
                >
                  {person.name}
                </Link>
                <p className="text-xs text-neutral-400 truncate mt-0.5">{person.character}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Navigation buttons — centralizados exatamente em 105px (metade da foto de 210px) */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-2 top-[105px] -translate-y-1/2 h-10 w-10 bg-black/75 hover:bg-black/90 backdrop-blur-md border border-white/15 hover:border-white/30 text-white rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all hidden lg:flex"
          onClick={() => scroll("left")}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-[105px] -translate-y-1/2 h-10 w-10 bg-black/75 hover:bg-black/90 backdrop-blur-md border border-white/15 hover:border-white/30 text-white rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all hidden lg:flex"
          onClick={() => scroll("right")}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </TooltipProvider>
  );
}
