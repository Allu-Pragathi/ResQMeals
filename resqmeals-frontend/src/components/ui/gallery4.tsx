"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "./button";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "./carousel";

export interface Gallery4Item {
  id: string;
  title: string;
  description: string;
  href: string;
  image: string;
}

export interface Gallery4Props {
  title?: string;
  description?: string;
  items?: Gallery4Item[];
}

const data = [
  {
    id: "impact-stories-01",
    title: "Feeding the Community",
    description: "How local restaurants are partnering with shelters to reduce food waste and feed the hungry.",
    href: "/donor/map",
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=1080",
  },
  {
    id: "impact-stories-02",
    title: "Sustainability Era",
    description: "Discover how every meal rescued directly impacts our carbon footprint and local ecosystem.",
    href: "/donor",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1080",
  },
  {
    id: "impact-stories-03",
    title: "Global Rescue Missions",
    description: "Connecting surplus to scarcity through real-time logistics and volunteer power.",
    href: "/donor/map",
    image: "https://images.unsplash.com/photo-1536735561749-fc87494598cb?auto=format&fit=crop&q=80&w=1080",
  },
];

const Gallery4 = ({
  title = "Impact Stories",
  description = "Explore the real-world stories of how your contributions are changing lives and protecting our planet. These featured highlights showcase the power of community action.",
  items = data,
}: Gallery4Props) => {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!carouselApi) {
      return;
    }
    const updateSelection = () => {
      setCanScrollPrev(carouselApi.canScrollPrev());
      setCanScrollNext(carouselApi.canScrollNext());
      setCurrentSlide(carouselApi.selectedScrollSnap());
    };
    updateSelection();
    carouselApi.on("select", updateSelection);
    return () => {
      carouselApi.off("select", updateSelection);
    };
  }, [carouselApi]);

  return (
    <section className="py-20">
      <div className="w-full">
        <div className="mb-10 flex items-end justify-between">
          <div className="flex flex-col gap-4">
            <h2 className="text-3xl font-black text-slate-900 md:text-4xl lg:text-5xl tracking-tight">
              {title}
            </h2>
            <p className="max-w-xl text-lg font-medium text-slate-500">{description}</p>
          </div>
          <div className="hidden shrink-0 gap-3 md:flex">
            <Button
              size="icon"
              variant="outline"
              onClick={() => {
                carouselApi?.scrollPrev();
              }}
              disabled={!canScrollPrev}
              className="rounded-2xl h-12 w-12 border-slate-200 disabled:opacity-30 disabled:pointer-events-auto"
            >
              <ArrowLeft className="size-5" />
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={() => {
                carouselApi?.scrollNext();
              }}
              disabled={!canScrollNext}
              className="rounded-2xl h-12 w-12 border-slate-200 disabled:opacity-30 disabled:pointer-events-auto"
            >
              <ArrowRight className="size-5" />
            </Button>
          </div>
        </div>
      </div>
      <div className="w-full">
        <Carousel
          setApi={setCarouselApi}
          opts={{
            breakpoints: {
              "(max-width: 768px)": {
                dragFree: true,
              },
            },
          }}
        >
          <CarouselContent className="ml-0">
            {items.map((item) => (
              <CarouselItem
                key={item.id}
                className="max-w-[320px] pl-[20px] lg:max-w-[400px]"
              >
                <div className="group rounded-[2.5rem] overflow-hidden bg-white border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 transform hover:-translate-y-2">
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="absolute h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/20 to-transparent opacity-80" />
                    <div className="absolute inset-x-0 bottom-0 flex flex-col items-start p-8 text-white">
                      <div className="mb-3 text-2xl font-black tracking-tight leading-tight">
                        {item.title}
                      </div>
                      <div className="mb-8 line-clamp-3 text-sm font-medium text-slate-200 opacity-90 leading-relaxed">
                        {item.description}
                      </div>
                      <a 
                        href={item.href}
                        className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-primary bg-white px-6 py-3 rounded-xl hover:bg-orange-50 transition-colors"
                      >
                        Learn more{" "}
                        <ArrowRight className="size-4 transition-transform group-hover:translate-x-2" />
                      </a>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        <div className="mt-10 flex justify-center gap-3">
          {items.map((_, index) => (
            <button
              key={index}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                currentSlide === index ? "w-10 bg-primary" : "w-2.5 bg-slate-200 hover:bg-slate-300"
              }`}
              onClick={() => carouselApi?.scrollTo(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export { Gallery4 };
