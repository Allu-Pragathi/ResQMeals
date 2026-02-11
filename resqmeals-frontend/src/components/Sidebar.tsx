const navItems = [
  { label: 'Overview', href: '#overview' },
  { label: 'Donations', href: '#donations' },
  { label: 'NGOs', href: '#ngos' },
  { label: 'Analytics', href: '#analytics' },
]

const Sidebar = () => {
  return (
    <aside className="hidden w-56 flex-shrink-0 rounded-2xl bg-white p-4 shadow-card lg:block">
      <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate/60">
        Admin Navigation
      </p>
      <nav className="space-y-2">
        {navItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="block rounded-xl px-3 py-2 text-sm text-slate/80 transition hover:bg-primary/10 hover:text-primary"
          >
            {item.label}
          </a>
        ))}
      </nav>
    </aside>
  )
}

export default Sidebar
