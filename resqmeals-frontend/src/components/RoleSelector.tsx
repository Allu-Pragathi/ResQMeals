type RoleSelectorProps = {
  value: string
  onChange: (role: string) => void
}

const roles = ['Donor', 'NGO', 'Events', 'Volunteer']

const RoleSelector = ({ value, onChange }: RoleSelectorProps) => {
  return (
    <div className="grid grid-cols-4 gap-3">
      {roles.map((role) => {
        const active = value === role
        return (
          <button
            key={role}
            type="button"
            onClick={() => onChange(role)}
            className={`rounded-xl border px-4 py-3 text-sm font-semibold transition ${active
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-slate/10 bg-white text-slate hover:border-primary/50'
              }`}
          >
            {role}
          </button>
        )
      })}
    </div>
  )
}

export default RoleSelector
