import { Link, NavLink } from 'react-router-dom'
import { UtensilsCrossed } from 'lucide-react'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/#map', label: 'Live Map' },
  { to: '/#how-it-works', label: 'How it Works' },
  { to: '/#impact', label: 'Impact' },
  { to: '/#community', label: 'Community' },
]

const Navbar = () => {
  return (
    <header className="sticky top-0 z-30 bg-white/90 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="ResQMeals Logo"
            className="h-12 w-auto object-contain"
            onError={(e) => {
              // Fallback if image not found
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <div className="hidden flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white shadow-sm">
            <UtensilsCrossed className="h-6 w-6" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-xl text-primary tracking-tight">ResQMeals</span>
            <span className="text-[10px] font-medium text-slate/60 uppercase tracking-wider">Saving Food, Serving Hope</span>
          </div>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate/80 md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `transition-colors hover:text-primary ${isActive ? 'text-primary' : ''}`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <Link
            to="/auth"
            className="rounded-full bg-primary px-4 py-2 text-white shadow-md transition hover:bg-primaryDark"
          >
            Get Started
          </Link>
        </nav>
        <div className="flex items-center gap-3 md:hidden">
          <Link
            to="/#map"
            className="text-sm font-medium text-primary"
          >
            Map
          </Link>
          <Link
            to="/auth"
            className="rounded-full bg-primary px-4 py-2 text-sm text-white shadow-md transition hover:bg-primaryDark"
          >
            Login
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Navbar
