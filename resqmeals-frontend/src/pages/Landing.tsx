import { useNavigate } from 'react-router-dom'
import { LiveMapSection } from '../components/ui/live-map'
import { Utensils, Heart, Bell, CheckCircle, MapPin, Truck } from 'lucide-react'
import { TestimonialGrid } from '../components/ui/testimonial-grid'
import { ImpactCalculator } from '../components/ui/impact-calculator'
import { VolunteerSection } from '../components/ui/volunteer-section'

// Food donation themed testimonials
const animatedTestimonials = [
  {
    quote:
      "Working on the backend architecture and seamless logistics flow for ResQMeals has been incredibly fulfilling. Our system ensures that surplus food reaches its destination quickly and efficiently.",
    name: "Hari Hara Naidu",
    designation: "Co-Creator, ResQMeals",
    srcs: [
      "/Hari%20Hara%20Naidu.jpg",
      "https://images.unsplash.com/photo-1556910103-1c02745a30bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
  },
  {
    quote:
      "Building ResQMeals has been a journey of purpose. We wanted to use technology to bridge the gap between abundance and hunger, making food rescue seamless.",
    name: "Sanjay Thomas",
    designation: "Co-Creator, ResQMeals",
    srcs: [
      "/Sanjay Thomas.jpeg",
      "https://images.unsplash.com/photo-1522075469751-3a3694c2d654?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
  },
  {
    quote:
      "Our goal is to create a sustainable ecosystem where no food goes to waste. Seeing our code translate into real meals for real people is incredibly rewarding.",
    name: "Allu Pragathi",
    designation: "Co-Creator, ResQMeals",
    srcs: [
      "/Allu%20Pragathi.jpg",
      "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
    ],
  },
]

const Landing = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50 font-sans">

      {/* New Hero Section */}
      <section className="relative -mt-20 flex min-h-screen items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1593113598332-cd288d649433?ixlib=rb-4.0.3&auto=format&fit=crop&w=2400&q=80"
            alt="Community sharing food"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 mt-20">
          <div className="max-w-2xl text-white">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-md">
              <span className="mr-2 h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-sm font-medium">Connecting surplus food with those who need it</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl leading-tight mb-6">
              End Food Waste. <br />
              <span className="text-orange-500">Feed Communities.</span>
            </h1>

            {/* Subheadline */}
            <p className="mb-10 text-xl text-white/90 leading-relaxed max-w-lg">
              ResQMeals connects restaurants, hotels, and caterers with surplus food to NGOs serving hungry families. One platform. Zero waste. Maximum impact.
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <button
                onClick={() => navigate('/auth')}
                className="group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-orange-500 px-8 py-4 font-bold text-white transition-all duration-300 hover:bg-orange-600 hover:scale-105 hover:shadow-lg hover:shadow-orange-500/25 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                <span>I&apos;m a Restaurant</span>
                <div className="absolute inset-0 -z-10 bg-gradient-to-tr from-orange-600 to-orange-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                <svg className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>

              <button
                onClick={() => navigate('/auth')}
                className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-8 py-4 font-bold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                I&apos;m an NGO
                <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>

            {/* Live Map Link */}
            <div className="flex items-center gap-2 text-white/80 hover:text-orange-400 transition-colors cursor-pointer group mb-16" onClick={() => document.getElementById('map')?.scrollIntoView({ behavior: 'smooth' })}>
              <div className="p-1.5 rounded-full border border-white/20 bg-white/5 group-hover:border-orange-500/50 group-hover:bg-orange-500/10 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="font-medium underline decoration-white/30 underline-offset-4 group-hover:decoration-orange-400">View live donations map</span>
            </div>

            {/* Stats */}
            <div className="flex gap-12 border-t border-white/10 pt-8">
              <div>
                <p className="text-3xl font-bold text-white">500+</p>
                <p className="text-sm text-white/60 font-medium uppercase tracking-wide">Restaurants</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">200+</p>
                <p className="text-sm text-white/60 font-medium uppercase tracking-wide">NGOs</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-white">50K+</p>
                <p className="text-sm text-white/60 font-medium uppercase tracking-wide">Meals Shared</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Map Feature */}
      <section id="map" className="relative pt-16 mt-0 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Our Service Locations
            </h2>
            <p className="text-lg text-slate-600">
              We are currently delivering our food rescue and distribution services across these major cities in India.
            </p>
          </div>
          <LiveMapSection />
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-slate-50/50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-sm font-medium text-orange-800 mb-4">
              Simple & Effective
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl mb-4">
              How ResQMeals Works
            </h2>
            <p className="text-lg text-slate-600">
              We&apos;ve made connecting surplus food with those who need it as simple as possible.
              Three steps is all it takes to make a real difference.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 lg:gap-16">
            {/* Restaurants Column */}
            <div className="space-y-8">
              <div className="flex items-center gap-4 mb-8 justify-center md:justify-start">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-600 text-white shadow-lg shadow-orange-200">
                  <Utensils className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">For Restaurants & Caterers</h3>
                  <p className="text-slate-500">Turn waste into impact</p>
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-4">
                {/* Step 1 */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex gap-4 transition-transform hover:-translate-y-1 hover:shadow-md">
                  <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-700">
                    <span className="font-bold font-mono">01</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">List Your Surplus</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">End of the day with extra food? Open the app and list what you have - meals, ingredients, or baked goods with pickup times.</p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex gap-4 transition-transform hover:-translate-y-1 hover:shadow-md">
                  <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-700">
                    <Bell className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">NGOs Get Notified</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">Nearby NGOs instantly receive alerts about your donation. They can view details and claim what they need.</p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex gap-4 transition-transform hover:-translate-y-1 hover:shadow-md">
                  <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-700">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Handover & Track</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">Verified volunteers pick up the food. You get digital confirmation and impact stats for your contribution.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* NGOs Column */}
            <div className="space-y-8">
              <div className="flex items-center gap-4 mb-8 justify-center md:justify-start">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500 text-white shadow-lg shadow-orange-200">
                  <Heart className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">For NGOs & Charities</h3>
                  <p className="text-slate-500">Serve more, waste less</p>
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-4">
                {/* Step 1 */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex gap-4 transition-transform hover:-translate-y-1 hover:shadow-md">
                  <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-700">
                    <span className="font-bold font-mono">01</span>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Create Your Profile</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">Register your NGO with service areas, daily capacity, and the communities you serve. Get verified quickly.</p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex gap-4 transition-transform hover:-translate-y-1 hover:shadow-md">
                  <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-700">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Find Nearby Food</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">Browse the live map to see available donations near you. Filter by food type, and quantity.</p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex gap-4 transition-transform hover:-translate-y-1 hover:shadow-md">
                  <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-700">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Claim & Distribute</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">Claim donations with one click. Coordinate pickup and distribute fresh meals to those in need.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Calculator Section */}
      <section id="impact-calculator" className="py-20 bg-slate-50/50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <ImpactCalculator />
        </div>
      </section>

      {/* Volunteer Section */}
      <VolunteerSection />

      {/* Impact Section */}
      <section className="py-24 bg-orange-600 text-white">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center rounded-full border border-orange-400 bg-orange-700/50 px-3 py-1 text-sm font-medium text-orange-100 mb-4">
              Real Impact, Real Numbers
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-5xl mb-4">
              Every Meal Matters
            </h2>
            <p className="text-lg text-orange-100/90">
              Behind every number is a family that didn&apos;t go hungry, a restaurant that reduced waste, and a community that came together.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {/* Stat Card 1 */}
            <div className="bg-orange-700/40 rounded-2xl p-8 border border-orange-500/30 backdrop-blur-sm hover:bg-orange-700/60 transition-colors text-center">
              <div className="mx-auto mb-4 h-12 w-12 flex items-center justify-center rounded-xl bg-orange-500/30 text-orange-100">
                <Utensils className="h-6 w-6" />
              </div>
              <h3 className="text-4xl font-bold text-white mb-2">50,000+</h3>
              <p className="font-semibold text-orange-100 mb-2">Meals Rescued</p>
              <p className="text-sm text-orange-200/80">Fresh meals saved from landfills</p>
            </div>

            {/* Stat Card 2 */}
            <div className="bg-orange-700/40 rounded-2xl p-8 border border-orange-500/30 backdrop-blur-sm hover:bg-orange-700/60 transition-colors text-center">
              <div className="mx-auto mb-4 h-12 w-12 flex items-center justify-center rounded-xl bg-orange-500/30 text-orange-100">
                <Heart className="h-6 w-6" />
              </div>
              <h3 className="text-4xl font-bold text-white mb-2">15,000+</h3>
              <p className="font-semibold text-orange-100 mb-2">Families Served</p>
              <p className="text-sm text-orange-200/80">Hungry families fed every month</p>
            </div>

            {/* Stat Card 3 */}
            <div className="bg-orange-700/40 rounded-2xl p-8 border border-orange-500/30 backdrop-blur-sm hover:bg-orange-700/60 transition-colors text-center">
              <div className="mx-auto mb-4 h-12 w-12 flex items-center justify-center rounded-xl bg-orange-500/30 text-orange-100">
                <MapPin className="h-6 w-6" />
              </div>
              <h3 className="text-4xl font-bold text-white mb-2">25+</h3>
              <p className="font-semibold text-orange-100 mb-2">Cities Covered</p>
              <p className="text-sm text-orange-200/80">And expanding rapidly</p>
            </div>

            {/* Stat Card 4 */}
            <div className="bg-orange-700/40 rounded-2xl p-8 border border-orange-500/30 backdrop-blur-sm hover:bg-orange-700/60 transition-colors text-center">
              <div className="mx-auto mb-4 h-12 w-12 flex items-center justify-center rounded-xl bg-orange-500/30 text-orange-100">
                <Truck className="h-6 w-6" />
              </div>
              <h3 className="text-4xl font-bold text-white mb-2">45 Tons</h3>
              <p className="font-semibold text-orange-100 mb-2">CO₂ Prevented</p>
              <p className="text-sm text-orange-200/80">Reduced carbon footprint</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Testimonial 1 */}
            <div className="bg-orange-800/20 rounded-2xl p-8 border border-orange-500/20 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-4 text-orange-200 uppercase text-xs font-bold tracking-wider">
                <Heart className="h-4 w-4" />
                Restaurant Partner
              </div>
              <p className="text-xl text-white font-medium italic mb-6">
                &quot;ResQMeals helped us redirect our buffet leftovers to families who truly needed it. The process is seamless.&quot;
              </p>
              <div>
                <p className="font-bold text-white">Raj Sharma</p>
                <p className="text-sm text-orange-200">Owner, Spice Garden Restaurant</p>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-orange-800/20 rounded-2xl p-8 border border-orange-500/20 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-4 text-orange-200 uppercase text-xs font-bold tracking-wider">
                <Heart className="h-4 w-4" />
                NGO Partner
              </div>
              <p className="text-xl text-white font-medium italic mb-6">
                &quot;We now serve 40% more meals with the same budget. The quality of food from restaurant partners is excellent.&quot;
              </p>
              <div>
                <p className="font-bold text-white">Priya Menon</p>
                <p className="text-sm text-orange-200">Director, Hope Foundation NGO</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Voices from the community Section */}
      <section id="community" className="space-y-6 pt-16 pb-16 bg-slate-50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold text-slate-900 text-center mb-10">Voices from the community</h2>
          <TestimonialGrid items={animatedTestimonials} />
        </div>
      </section>

    </div>
  )
}

export default Landing
