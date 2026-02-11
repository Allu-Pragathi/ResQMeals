import { useState } from 'react'
import CTAButton from '../components/CTAButton'
import RoleSelector from '../components/RoleSelector'

const Auth = () => {
  const [role, setRole] = useState('Donor')

  return (
    <div className="mx-auto max-w-3xl space-y-8 rounded-3xl bg-white p-8 shadow-card">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-slate">Login / Signup</h1>
        <p className="text-slate/70">
          Choose your role to see the tailored dashboard experience. UI only — hook into auth
          service later.
        </p>
      </div>

      <div className="space-y-4">
        <p className="text-sm font-semibold text-slate">Select role</p>
        <RoleSelector value={role} onChange={setRole} />
      </div>

      <form className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-slate">Email</label>
          <input
            className="w-full rounded-xl border border-slate/15 bg-soft px-4 py-3 text-sm focus:border-primary focus:outline-none"
            placeholder="you@example.org"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate">Password</label>
          <input
            type="password"
            className="w-full rounded-xl border border-slate/15 bg-soft px-4 py-3 text-sm focus:border-primary focus:outline-none"
            placeholder="••••••••"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate">Confirm Password</label>
          <input
            type="password"
            className="w-full rounded-xl border border-slate/15 bg-soft px-4 py-3 text-sm focus:border-primary focus:outline-none"
            placeholder="••••••••"
          />
        </div>
      </form>

      <div className="flex flex-wrap gap-3">
        <CTAButton to={`/${role.toLowerCase()}`}>Continue as {role}</CTAButton>
        <CTAButton to="/" variant="ghost">
          Back to landing
        </CTAButton>
      </div>

      <p className="text-xs text-slate/60">
        Future: integrate real auth, role-based routing, and AI chat guidance on login issues.
      </p>
    </div>
  )
}

export default Auth
