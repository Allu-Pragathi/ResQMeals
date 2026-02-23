import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/#map', label: 'Live Map' },
  { to: '/#volunteer', label: 'Volunteer' },
  { to: '/#how-it-works', label: 'How it Works' },
  { to: '/#impact-calculator', label: 'Calculate Impact' },
  { to: '/#community', label: 'Community' },
]

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const handleScroll = (id: string) => {
    setIsOpen(false);
    const element = document.getElementById(id.replace('/#', ''));
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 shadow-sm backdrop-blur-md transition-all duration-300">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <img
            src="/logo.png"
            alt="ResQMeals Logo"
            className="h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
          />
          <div className="flex flex-col leading-none">
            <span className="font-bold text-xl text-slate-900 tracking-tight group-hover:text-orange-600 transition-colors">ResQMeals</span>
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Saving Food, Serving Hope</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            link.to.startsWith('/#') ? (
              <a
                key={link.to}
                href={link.to}
                onClick={(e) => {
                  if (location.pathname === '/') {
                    e.preventDefault();
                    handleScroll(link.to);
                  }
                }}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-full transition-all duration-200"
              >
                {link.label}
              </a>
            ) : (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 ${isActive ? 'text-orange-600 bg-orange-50' : 'text-slate-600 hover:text-orange-600 hover:bg-orange-50'}`
                }
              >
                {link.label}
              </NavLink>
            )
          ))}
          <div className="ml-4 pl-4 border-l border-slate-200">
            <Link
              to="/auth"
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-orange-600 to-amber-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/30 transition-all duration-300 hover:scale-105 hover:shadow-orange-500/50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              Get Started
            </Link>
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-slate-600 hover:text-orange-600 transition-colors">
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-100 shadow-xl py-4 px-4 flex flex-col gap-2">
          {navLinks.map((link) => (
            link.to.startsWith('/#') ? (
              <a
                key={link.to}
                href={link.to}
                onClick={(e) => {
                  if (location.pathname === '/') {
                    e.preventDefault();
                    handleScroll(link.to);
                  } else {
                    setIsOpen(false);
                  }
                }}
                className="block px-4 py-3 text-base font-medium text-slate-600 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-colors"
              >
                {link.label}
              </a>
            ) : (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-3 text-base font-medium rounded-xl transition-colors ${isActive ? 'text-orange-600 bg-orange-50' : 'text-slate-600 hover:text-orange-600 hover:bg-orange-50'}`
                }
              >
                {link.label}
              </NavLink>
            )
          ))}
          <div className="mt-2 pt-4 border-t border-slate-100">
            <Link
              to="/auth"
              onClick={() => setIsOpen(false)}
              className="flex w-full items-center justify-center rounded-xl bg-orange-600 px-4 py-3 text-base font-bold text-white shadow-md transition hover:bg-orange-700"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
