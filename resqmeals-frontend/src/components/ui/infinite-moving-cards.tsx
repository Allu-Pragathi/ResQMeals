"use client";

import { cn } from "../../lib/utils";
import React, { useEffect, useState } from "react";

export const InfiniteMovingCards = ({
    items,
    direction = "left",
    speed = "fast",
    pauseOnHover = true,
    className,
}: {
    items: {
        quote: string;
        name: string;
        designation: string;
        srcs?: string[];
    }[];
    direction?: "left" | "right";
    speed?: "fast" | "normal" | "slow";
    pauseOnHover?: boolean;
    className?: string;
}) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const scrollerRef = React.useRef<HTMLUListElement>(null);

    useEffect(() => {
        getDirection();
        getSpeed();
    }, []); // Run once on mount

    const getDirection = () => {
        if (containerRef.current) {
            if (direction === "left") {
                containerRef.current.style.setProperty(
                    "--animation-direction",
                    "forwards"
                );
            } else {
                containerRef.current.style.setProperty(
                    "--animation-direction",
                    "reverse"
                );
            }
        }
    };

    const getSpeed = () => {
        if (containerRef.current) {
            if (speed === "fast") {
                containerRef.current.style.setProperty("--animation-duration", "20s");
            } else if (speed === "normal") {
                containerRef.current.style.setProperty("--animation-duration", "40s");
            } else {
                containerRef.current.style.setProperty("--animation-duration", "80s");
            }
        }
    };

    return (
        <div
            ref={containerRef}
            className={cn(
                "scroller relative z-20  max-w-7xl overflow-hidden  [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]",
                className
            )}
        >
            <ul
                ref={scrollerRef}
                className={cn(
                    "flex min-w-full shrink-0 gap-4 py-4 w-max flex-nowrap",
                    "animate-scroll ", // Always animate
                    pauseOnHover && "hover:[animation-play-state:paused]"
                )}
            >
                {/* Render items twice to ensure seamless looping */}
                {[...items, ...items, ...items].map((item, idx) => (
                    <TestimonialCard item={item} key={idx} />
                ))}
            </ul>
        </div>
    );
};

const TestimonialCard = ({
    item,
}: {
    item: {
        quote: string;
        name: string;
        designation: string;
        srcs?: string[];
    };
}) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const images = item.srcs || [];
    const hasMultipleImages = images.length > 1;

    const handleImageClick = () => {
        if (hasMultipleImages) {
            setCurrentImageIndex((prev) => (prev + 1) % images.length);
        }
    };

    return (
        <li
            className="w-[450px] max-w-full relative rounded-2xl border border-b-0 flex-shrink-0 border-slate-200 px-8 py-6 md:w-[650px]"
            style={{
                background:
                    "linear-gradient(180deg, var(--slate-50), var(--slate-100)",
            }}
        >
            <blockquote>
                <div
                    aria-hidden="true"
                    className="user-select-none -z-1 pointer-events-none absolute -left-0.5 -top-0.5 h-[calc(100%_+_4px)] w-[calc(100%_+_4px)]"
                ></div>

                <div className="relative z-20 flex flex-row gap-8 items-center h-full">
                    {/* Left Side: Picture */}
                    <div className="flex-shrink-0 cursor-pointer" onClick={handleImageClick}>
                        {images.length > 0 ? (
                            <div className="relative group">
                                <img
                                    src={images[currentImageIndex]}
                                    alt={item.name}
                                    className="h-32 w-32 md:h-48 md:w-48 rounded-2xl object-cover border-4 border-orange-100 shadow-lg transition-transform duration-300 group-hover:scale-105"
                                />
                                <div className="absolute -bottom-3 -right-3 bg-orange-100 rounded-full p-2 shadow-sm border border-orange-200">
                                    {hasMultipleImages ? (
                                        <div className="flex gap-0.5">
                                            <span className="block h-2 w-2 bg-orange-500 rounded-full animate-pulse"></span>
                                            <span className="block h-2 w-2 bg-orange-300 rounded-full"></span>
                                        </div>
                                    ) : (
                                        <span className="block h-3 w-3 bg-orange-500 rounded-full animate-pulse"></span>
                                    )}
                                </div>
                                {hasMultipleImages && (
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-2xl backdrop-blur-[1px]">
                                        <span className="text-white text-xs font-bold px-2 py-1 bg-black/50 rounded-full">Click to see more</span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="h-32 w-32 md:h-48 md:w-48 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-500 font-bold text-4xl border-4 border-orange-50 shadow-inner">
                                {item.name.charAt(0)}
                            </div>
                        )}
                    </div>

                    {/* Right Side: Work/Quote */}
                    <div className="flex flex-col flex-1 justify-center">
                        <div className="mb-4">
                            <span className="text-2xl font-bold text-slate-900 block mb-1">
                                {item.name}
                            </span>
                            <span className="text-base font-semibold text-orange-600 block uppercase tracking-wide">
                                {item.designation}
                            </span>
                        </div>

                        <p className="text-slate-600 text-base md:text-lg leading-relaxed italic relative">
                            <span className="absolute -top-4 -left-2 text-4xl text-orange-200 font-serif leading-none">&ldquo;</span>
                            {item.quote}
                            <span className="absolute -bottom-4 text-4xl text-orange-200 font-serif leading-none">&rdquo;</span>
                        </p>
                    </div>
                </div>
            </blockquote>
        </li>
    );
};
