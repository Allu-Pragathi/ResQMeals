type TestimonialCardProps = {
  quote: string
  name: string
  role: string
}

const TestimonialCard = ({ quote, name, role }: TestimonialCardProps) => {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-card">
      <p className="text-slate/80">“{quote}”</p>
      <div className="mt-3">
        <p className="font-semibold text-slate">{name}</p>
        <p className="text-xs text-slate/60">{role}</p>
      </div>
    </div>
  )
}

export default TestimonialCard
