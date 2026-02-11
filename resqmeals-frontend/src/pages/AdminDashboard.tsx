import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from 'recharts'
import KPICard from '../components/KPICard'
import ChartCard from '../components/ChartCard'
import DataTable from '../components/DataTable'
import Sidebar from '../components/Sidebar'
import StatusBadge from '../components/StatusBadge'
import {
  donationsPerDay,
  foodTypeDistribution,
  kpiCards,
  ngoContribution,
  recentDonations,
} from '../data/mockData'

const COLORS = ['#F97316', '#F5A524', '#0EA5E9', '#8B5CF6', '#38BDF8']

const AdminDashboard = () => {
  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <Sidebar />

      <div className="flex-1 space-y-6">
        <header id="overview" className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Admin</p>
          <h1 className="text-3xl font-semibold text-slate">Impact & Operations</h1>
          <p className="text-sm text-slate/70">
            Monitor KPIs, pickup success, and NGO contribution. Future: ML scoring, anomaly alerts,
            and deeper analytics.
          </p>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {kpiCards.map((kpi) => (
            <KPICard key={kpi.label} label={kpi.label} value={kpi.value} trend={kpi.trend} />
          ))}
        </section>

        <section id="analytics" className="grid gap-4 lg:grid-cols-3">
          {/* Future: replace static data with analytics API + anomaly detection */}
          <ChartCard title="Donations per day" subtitle="Sample line chart">
            <div className="h-64">
              <ResponsiveContainer>
                <LineChart data={donationsPerDay}>
                  <XAxis dataKey="day" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="donations" stroke="#F97316" strokeWidth={3} />
                  <Line type="monotone" dataKey="peopleFed" stroke="#0EA5E9" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="NGO contribution" subtitle="Bar chart">
            <div className="h-64">
              <ResponsiveContainer>
                <BarChart data={ngoContribution}>
                  <XAxis dataKey="ngo" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Bar dataKey="donations" radius={[10, 10, 0, 0]} fill="#F97316" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Food type distribution" subtitle="Pie chart">
            <div className="h-64">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={foodTypeDistribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                  >
                    {foodTypeDistribution.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </section>

        <section id="donations" className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate">Recent donations</h2>
              <p className="text-xs text-slate/60">
                UI only. Connect to API + ML anomaly checks later.
              </p>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              Pickup success: 94.6%
            </span>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate/10 bg-white shadow-card">
            <table className="min-w-full text-sm">
              <thead className="bg-soft text-left text-slate/70">
                <tr>
                  <th className="px-4 py-3 font-semibold">ID</th>
                  <th className="px-4 py-3 font-semibold">Donor</th>
                  <th className="px-4 py-3 font-semibold">NGO</th>
                  <th className="px-4 py-3 font-semibold">Items</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Updated</th>
                </tr>
              </thead>
              <tbody>
                {recentDonations.map((item) => (
                  <tr key={item.id} className="border-t border-slate/5">
                    <td className="px-4 py-3 text-slate/80">{item.id}</td>
                    <td className="px-4 py-3 text-slate/80">{item.donor}</td>
                    <td className="px-4 py-3 text-slate/80">{item.ngo}</td>
                    <td className="px-4 py-3 text-slate/80">{item.items}</td>
                    <td className="px-4 py-3 text-slate/80">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="px-4 py-3 text-slate/60">{item.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="ngos">
          <h2 className="text-lg font-semibold text-slate">NGO contribution table</h2>
          <p className="text-xs text-slate/60">
            Replace with live data; add filters and export later.
          </p>
          <div className="mt-3">
            <DataTable
              data={ngoContribution.map((n) => ({
                ngo: n.ngo,
                donations: n.donations,
                impact: `${Math.round(n.donations * 2.3)} people fed (est.)`,
              }))}
              columns={[
                { header: 'NGO', accessor: 'ngo' },
                { header: 'Donations', accessor: 'donations' },
                { header: 'Impact (est.)', accessor: 'impact' },
              ]}
            />
          </div>
        </section>
      </div>
    </div>
  )
}

export default AdminDashboard
