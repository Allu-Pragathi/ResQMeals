
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const articlesData = [
  {
    category: "IMPACT",
    description:
      "How ResQ Meals connects local restaurants with shelters to reduce food waste and feed the hungry.",
    image:
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1000&auto=format&fit=crop",
    publishDate: "Feb 10, 2026",
    readMoreLink: "#",
    title: "Feeding the Community: A New Era",
  },
  {
    category: "SUSTAINABILITY",
    description:
      "Reducing carbon footprint one meal at a time. See the environmental impact of your donations.",
    image:
      "https://images.unsplash.com/photo-1542601906990-b4d3fb7d5b43?q=80&w=1000&auto=format&fit=crop",
    publishDate: "Jan 25, 2026",
    readMoreLink: "#",
    title: "Sustainability in Food Service",
  },
  {
    category: "ANALYTICS",
    description:
      "Track your contributions and see real-time data on meals saved and people served.",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop",
    publishDate: "Jan 15, 2026",
    readMoreLink: "#",
    title: "Data-Driven Social Change",
  },
];

export default function Blogs() {
  return (
    <section className="bg-black px-4 py-12 sm:py-16 md:py-20 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 text-center sm:mb-12">
          <p className="mb-3 font-medium text-gray-400 text-xs uppercase tracking-wider sm:mb-4">
            LATEST UPDATES
          </p>
          <h2 className="font-normal text-2xl text-white tracking-tight sm:text-3xl md:text-5xl">
            ResQ Stories & Insights
          </h2>
        </div>
        <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
          {articlesData.map((article, index) => (
            <div
              className="cursor-pointer border border-gray-800 bg-gray-950/30 hover:bg-gray-900/50 transition-colors"
              key={index}
            >
              <div className="p-0">
                <div className="relative mb-4 sm:mb-6">
                  <img
                    alt={article.title}
                    className="aspect-square h-64 w-full object-cover sm:h-72 md:h-80"
                    src={article.image || "/placeholder.svg"}
                  />
                  <p
                    className="absolute top-0 left-0 bg-gray-950/90 px-3 py-1 font-medium text-[10px] text-white uppercase backdrop-blur-sm sm:text-xs"
                  >
                    #{article.category}
                  </p>
                </div>
                <div className="px-5 pb-8">
                  <h3 className="mb-2 font-normal text-xl text-white tracking-tight sm:mb-3 sm:text-2xl">
                    {article.title}
                  </h3>
                  <p className="mb-6 text-gray-400 text-sm leading-relaxed">
                    {article.description}
                  </p>
                  {/* Read More Link and Date */}
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-gray-800 pt-6">
                    <Link
                      className="group flex items-center gap-3 text-sm font-medium text-white hover:text-gray-300 transition-colors"
                      to={article.readMoreLink}
                    >
                      <div className="flex h-10 w-10 items-center justify-center border border-gray-700 transition-colors group-hover:bg-white group-hover:border-white group-hover:text-black">
                        <ArrowRight className="h-4 w-4" />
                      </div>
                      Read more
                    </Link>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-gray-500">{article.publishDate}</span>
                      <div className="h-px w-12 bg-gray-800"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
