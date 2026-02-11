
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

interface Feature {
    step: string
    title?: string
    content: string
    image: string
}

interface FeatureStepsProps {
    features: Feature[]
    className?: string
    title?: string
    autoPlayInterval?: number
    imageHeight?: string
}

export function FeatureSteps({
    features,
    className,
    title = "How to get Started",
    autoPlayInterval = 3000,
    imageHeight = "h-[400px]",
}: FeatureStepsProps) {
    const [currentFeature, setCurrentFeature] = useState(0)
    const [progress, setProgress] = useState(0)

    useEffect(() => {
        const timer = setInterval(() => {
            if (progress < 100) {
                setProgress((prev) => prev + 100 / (autoPlayInterval / 100))
            } else {
                setCurrentFeature((prev) => (prev + 1) % features.length)
                setProgress(0)
            }
        }, 100)

        return () => clearInterval(timer)
    }, [progress, features.length, autoPlayInterval])

    return (
        <div className={cn("p-8 md:p-12", className)}>
            <div className="max-w-7xl mx-auto w-full">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-10 text-center text-slate-900 dark:text-slate-100">
                    {title}
                </h2>

                <div className="flex flex-col md:grid md:grid-cols-2 gap-6 md:gap-10">
                    <div className="order-2 md:order-1 space-y-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                className="flex items-center gap-6 md:gap-8 cursor-pointer group"
                                initial={{ opacity: 0.3 }}
                                animate={{ opacity: index === currentFeature ? 1 : 0.3 }}
                                transition={{ duration: 0.5 }}
                                onClick={() => {
                                    setCurrentFeature(index);
                                    setProgress(0);
                                }}
                            >
                                <motion.div
                                    className={cn(
                                        "w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                                        index === currentFeature
                                            ? "bg-primary border-primary text-white scale-110 shadow-lg"
                                            : "bg-white border-slate-300 text-slate-500 group-hover:border-primary/50",
                                    )}
                                >
                                    {index <= currentFeature ? (
                                        <Check className="w-6 h-6" />
                                    ) : (
                                        <span className="text-lg font-semibold">{index + 1}</span>
                                    )}
                                </motion.div>

                                <div className="flex-1">
                                    <h3 className="text-xl md:text-2xl font-semibold text-slate-800 dark:text-slate-200">
                                        {feature.title || feature.step}
                                    </h3>
                                    <p className="text-sm md:text-lg text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                                        {feature.content}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <div
                        className={cn(
                            "order-1 md:order-2 relative h-[250px] md:h-[400px] lg:h-[500px] overflow-hidden rounded-2xl shadow-2xl glass-panel",
                            imageHeight
                        )}
                    >
                        <AnimatePresence mode="wait">
                            {features.map(
                                (feature, index) =>
                                    index === currentFeature && (
                                        <motion.div
                                            key={index}
                                            className="absolute inset-0 rounded-2xl overflow-hidden"
                                            initial={{ y: 50, opacity: 0, scale: 0.95 }}
                                            animate={{ y: 0, opacity: 1, scale: 1 }}
                                            exit={{ y: -50, opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.5, ease: "easeInOut" }}
                                        >
                                            <img
                                                src={feature.image}
                                                alt={feature.step}
                                                className="w-full h-full object-cover transition-transform transform hover:scale-105 duration-700"
                                                loading="lazy"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                            <div className="absolute bottom-6 left-6 right-6 text-white md:hidden">
                                                <p className="font-bold text-lg">{feature.title}</p>
                                            </div>
                                        </motion.div>
                                    ),
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    )
}
