"use client";

import { cn } from "../../lib/utils";
import { useState } from "react";

export const TestimonialGrid = ({
    items,
    className,
}: {
    items: {
        quote: string;
        name: string;
        designation: string;
        srcs?: string[];
    }[];
    className?: string;
}) => {
    return (
        <div className={cn("w-full", className)}>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 w-full mx-auto">
                {items.map((item, idx) => (
                    <TestimonialCard item={item} key={idx} />
                ))}
            </div>
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
        <div
            className="w-full relative rounded-2xl border border-b-0 border-slate-200 px-6 py-8 md:px-8"
            style={{
                background:
                    "linear-gradient(180deg, var(--slate-50), var(--slate-100))",
            }}
        >
            <blockquote>
                <div
                    aria-hidden="true"
                    className="user-select-none -z-1 pointer-events-none absolute -left-0.5 -top-0.5 h-[calc(100%_+_4px)] w-[calc(100%_+_4px)]"
                ></div>

                <div className="relative z-20 flex flex-col lg:flex-row gap-6 items-start lg:items-center h-full">
                    {/* Left Side: Picture */}
                    <div className="flex-shrink-0 cursor-pointer mx-auto lg:mx-0" onClick={handleImageClick}>
                        {images.length > 0 ? (
                            <div className="relative group">
                                <img
                                    src={images[currentImageIndex]}
                                    alt={item.name}
                                    className="h-40 w-40 md:h-48 md:w-48 rounded-2xl object-cover border-4 border-orange-100 shadow-lg transition-transform duration-300 group-hover:scale-105"
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
                            <div className="h-40 w-40 md:h-48 md:w-48 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-500 font-bold text-4xl border-4 border-orange-50 shadow-inner">
                                {item.name.charAt(0)}
                            </div>
                        )}
                    </div>

                    {/* Right Side: Work/Quote */}
                    <div className="flex flex-col flex-1 justify-center text-center lg:text-left">
                        <div className="mb-4">
                            <span className="text-2xl font-bold text-slate-900 block mb-1">
                                {item.name}
                            </span>
                            <span className="text-base font-semibold text-orange-600 block uppercase tracking-wide">
                                {item.designation}
                            </span>
                        </div>

                        <p className="text-slate-600 text-base md:text-lg leading-relaxed italic relative">
                            <span className="hidden lg:inline absolute -top-4 -left-2 text-4xl text-orange-200 font-serif leading-none">&ldquo;</span>
                            {item.quote}
                            <span className="hidden lg:inline absolute -bottom-4 text-4xl text-orange-200 font-serif leading-none">&rdquo;</span>
                        </p>
                    </div>
                </div>
            </blockquote>
        </div>
    );
};
