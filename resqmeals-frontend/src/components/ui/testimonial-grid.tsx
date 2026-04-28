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
        rating?: number;
        verified?: boolean;
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
        rating?: number;
        verified?: boolean;
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

                <div className="relative z-20 flex flex-col gap-6 items-center text-center h-full">
                    {/* Top Side: Picture */}
                    <div className="flex-shrink-0 cursor-pointer mx-auto" onClick={handleImageClick}>
                        {images.length > 0 ? (
                            <div className="relative group">
                                <img
                                    src={images[currentImageIndex]}
                                    alt={item.name}
                                    className="h-28 w-28 md:h-32 md:w-32 rounded-2xl object-cover border-4 border-orange-100 shadow-lg transition-transform duration-300 group-hover:scale-105"
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
                            <div className="h-28 w-28 md:h-32 md:w-32 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-500 font-bold text-4xl border-4 border-orange-50 shadow-inner">
                                {item.name.charAt(0)}
                            </div>
                        )}
                    </div>

                    {/* Bottom Side: Work/Quote */}
                    <div className="flex flex-col flex-1 justify-center items-center text-center">
                        <div className="mb-4 flex flex-col items-center">
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <span className="text-2xl font-bold text-slate-900 block">
                                    {item.name}
                                </span>
                                {item.verified && (
                                    <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </div>
                            <span className="text-base font-semibold text-orange-600 block uppercase tracking-wide">
                                {item.designation}
                            </span>
                            {item.rating && (
                                <div className="flex items-center justify-center gap-1 mt-2">
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} className={`w-4 h-4 ${i < item.rating! ? 'text-yellow-400' : 'text-slate-300'}`} fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    ))}
                                </div>
                            )}
                        </div>

                        <p className="text-slate-600 text-base md:text-lg leading-relaxed italic relative">
                            {item.quote}
                        </p>
                    </div>
                </div>
            </blockquote>
        </div>
    );
};
