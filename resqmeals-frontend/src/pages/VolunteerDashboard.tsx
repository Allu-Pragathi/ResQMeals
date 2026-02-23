import { useState, useEffect } from 'react'
import { volunteerRequests } from '../data/mockData'
import { MapPin, Clock, Trophy, Truck, CheckCircle, AlertCircle } from 'lucide-react'

const VolunteerDashboard = () => {
    const [user, setUser] = useState<{ name: string } | null>(null)
    const [isAvailable, setIsAvailable] = useState(true)
    const [activeTab, setActiveTab] = useState<'open' | 'my-tasks'>('open')

    useEffect(() => {
        const saved = localStorage.getItem('resqmeals_current_user')
        if (saved) setUser(JSON.parse(saved))
    }, [])

    return (
        <div className="space-y-8">
            {/* Header */}
            <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-primary">
                        Volunteer Portal {user && `• Welcome, ${user.name}`}
                    </p>
                    <h1 className="text-3xl font-bold text-slate-900 mt-1">My Missions</h1>
                    <p className="text-slate-500 mt-2">
                        Find nearby rescue missions and help deliver hope.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${isAvailable ? 'bg-green-50 border-green-200 text-green-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                        <div className={`w-2.5 h-2.5 rounded-full ${isAvailable ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`} />
                        <span className="text-sm font-bold">{isAvailable ? 'You are Online' : 'You are Offline'}</span>
                    </div>
                    <button
                        onClick={() => setIsAvailable(!isAvailable)}
                        className="text-sm font-semibold underline text-slate-600 hover:text-slate-900"
                    >
                        {isAvailable ? 'Go Offline' : 'Go Online'}
                    </button>
                </div>
            </header>

            {/* Stats */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                        <Trophy className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Total Impact Points</p>
                        <h3 className="text-2xl font-bold text-slate-900">1,250</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                        <Truck className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Missions Completed</p>
                        <h3 className="text-2xl font-bold text-slate-900">24</h3>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Hours Volunteered</p>
                        <h3 className="text-2xl font-bold text-slate-900">18.5</h3>
                    </div>
                </div>
            </section>

            {/* Tabs */}
            <div className="border-b border-slate-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('open')}
                        className={`pb-4 px-1 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'open' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        Nearby Requests
                    </button>
                    <button
                        onClick={() => setActiveTab('my-tasks')}
                        className={`pb-4 px-1 text-sm font-semibold border-b-2 transition-colors ${activeTab === 'my-tasks' ? 'border-primary text-primary' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        My Assignments
                    </button>
                </nav>
            </div>

            {/* Task List */}
            <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {activeTab === 'open' ? (
                    volunteerRequests.map((task) => (
                        <div key={task.id} className="group relative bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all hover:border-orange-200">
                            {task.urgent && (
                                <span className="absolute top-4 right-4 inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-600 ring-1 ring-inset ring-rose-600/10">
                                    <AlertCircle className="w-3 h-3" /> Urgent
                                </span>
                            )}

                            <div className="mb-4">
                                <span className="inline-block px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wide mb-2">
                                    {task.type}
                                </span>
                                <h3 className="text-lg font-bold text-slate-900">{task.items}</h3>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 min-w-[16px]">
                                        <div className="h-2 w-2 rounded-full bg-green-500 ring-4 ring-green-100" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium uppercase">Pick Up</p>
                                        <p className="text-sm font-semibold text-slate-700">{task.from}</p>
                                    </div>
                                </div>
                                {task.to !== 'N/A' && (
                                    <div className="flex items-start gap-3">
                                        <div className="mt-1 min-w-[16px]">
                                            <div className="h-2 w-2 rounded-full bg-orange-500 ring-4 ring-orange-100" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 font-medium uppercase">Drop Off</p>
                                            <p className="text-sm font-semibold text-slate-700">{task.to}</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                <div className="flex items-center gap-1 text-sm font-medium text-slate-600">
                                    <MapPin className="w-4 h-4 text-slate-400" />
                                    {task.distance}
                                </div>
                                <div className="flex items-center gap-1 text-sm font-bold text-orange-600">
                                    <Trophy className="w-4 h-4" />
                                    +{task.points} pts
                                </div>
                            </div>

                            <button className="w-full mt-4 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-primary transition-colors">
                                Accept Mission
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-12 text-center rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200">
                        <CheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <h3 className="text-lg font-medium text-slate-900">No active assignments</h3>
                        <p className="text-slate-500">Accept a mission from the 'Nearby Requests' tab to get started.</p>
                    </div>
                )}
            </section>
        </div>
    )
}

export default VolunteerDashboard
