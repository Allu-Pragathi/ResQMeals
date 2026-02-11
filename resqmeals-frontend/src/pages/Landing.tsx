import { useNavigate } from 'react-router-dom'
import CTAButton from '../components/CTAButton'
import StatCard from '../components/StatCard'
import { ShuffleHero } from '../components/ui/shuffle-grid'
import { AnimatedTestimonials } from '../components/ui/animated-testimonials'
import { FeatureSteps } from '../components/ui/feature-steps'
import Blogs from '../components/ui/blogs'
import { LiveMapSection } from '../components/ui/live-map'
import { impactMetrics } from '../data/mockData'

// Food donation themed testimonials
const animatedTestimonials = [
  {
    quote:
      "ResQMeals has transformed how we handle surplus food. What used to go to waste now feeds hundreds of families in our community every week.",
    name: "Priya Sharma",
    designation: "Restaurant Owner, Mumbai",
    src: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  },
  {
    quote:
      "As an NGO, finding reliable food donors was our biggest challenge. Now we receive quality meals consistently and can plan our distribution better.",
    name: "Rajesh Kumar",
    designation: "Director, Hope Foundation NGO",
    src: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  },
  {
    quote:
      "The platform makes volunteering so easy. I can see pickups near me, schedule my time, and know exactly how many meals I helped deliver.",
    name: "Allu Pragathi",
    designation: "Volunteer Coordinator",
    src: "/allu-pragathi.jpg",
  },
]

// Food donation themed images for the shuffle grid
const foodDonationImages = [
  { id: 1, src: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { id: 2, src: "https://images.unsplash.com/photo-1593113598332-cd288d649433?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { id: 3, src: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { id: 4, src: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { id: 5, src: "https://images.unsplash.com/photo-1578357078586-491adf1aa5ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { id: 6, src: "https://images.unsplash.com/photo-1547592180-85f173990554?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { id: 7, src: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { id: 8, src: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { id: 9, src: "https://images.unsplash.com/photo-1606787366850-de6330128bfc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { id: 10, src: "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { id: 11, src: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { id: 12, src: "https://images.unsplash.com/photo-1499028344343-cd173ffc68a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { id: 13, src: "https://images.unsplash.com/photo-1493770348161-369560ae357d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { id: 14, src: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { id: 15, src: "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
  { id: 16, src: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" },
]



const featureSteps = [
  {
    step: 'Step 1',
    title: 'List Surplus Food',
    content: 'Donors (restaurants, hotels) list available food details, quantity, and pick-up time in seconds.',
    image: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=2000&auto=format&fit=crop'
  },
  {
    step: 'Step 2',
    title: 'Instant Notification',
    content: 'Nearby NGOs and volunteers receive real-time alerts on our live map and can claim the donation instantly.',
    image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=2000&auto=format&fit=crop'
  },
  {
    step: 'Step 3',
    title: 'Track Impact',
    content: 'Food is collected and distributed. We track the meals saved and CO2 emissions prevented for every donation.',
    image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2000&auto=format&fit=crop'
  },
]

const Landing = () => {
  const navigate = useNavigate()

  return (
    <div className="space-y-16">
      {/* Hero Section with Shuffle Grid */}
      <ShuffleHero
        title="Rescuing Food, Feeding Hope"
        subtitle="Social impact • Zero food waste"
        description="ResQMeals connects donors, NGOs, and volunteers to move safe surplus food quickly, transparently, and responsibly. Join thousands making a difference."
        buttonText="Start Donating"
        onButtonClick={() => navigate('/auth')}
        images={foodDonationImages}
      />

      {/* Quick Actions */}
      <section className="flex flex-wrap justify-center gap-4">
        <CTAButton to="/auth">Donate Food</CTAButton>
        <CTAButton to="/ngo" variant="ghost">
          I&apos;m an NGO
        </CTAButton>
        <CTAButton to="/admin" variant="ghost">
          View Impact
        </CTAButton>
      </section>

      {/* Live Map Feature */}
      <section id="map" className="relative pt-16 -mt-8 pb-10">
        <div className="text-center mb-10 max-w-2xl mx-auto space-y-4">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Our Service Locations
          </h2>
          <p className="text-lg text-slate-600">
            We are currently delivering our food rescue and distribution services across these major cities in India.
          </p>
        </div>
        <LiveMapSection />
      </section>

      {/* Features Steps - How It Works */}
      <section id="how-it-works" className="space-y-6 pt-16">
        <FeatureSteps
          features={featureSteps}
          title="How ResQMeals Works"
          autoPlayInterval={4000}
          imageHeight="h-[400px]"
        />
      </section>

      {/* Impact Stats */}
      <section id="impact" className="relative pt-16">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-10 top-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl animate-blob" />
          <div className="absolute right-10 bottom-10 h-40 w-40 rounded-full bg-accent/10 blur-3xl animate-blob" />
        </div>
        <div className="grid gap-4 rounded-3xl bg-white/90 p-6 shadow-card backdrop-blur sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
          {impactMetrics.map((metric) => (
            <div
              key={metric.label}
              className="transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <StatCard
                label={metric.label}
                value={metric.value}
                change={metric.change}
              />
            </div>
          ))}
        </div>
      </section>

      <Blogs />

      {/* Animated Testimonials Section */}
      <section id="community" className="space-y-6 pt-16 pb-16">
        <h2 className="text-2xl font-semibold text-slate text-center">Voices from the community</h2>
        <AnimatedTestimonials testimonials={animatedTestimonials} autoplay />
      </section>
    </div>
  )
}

export default Landing
