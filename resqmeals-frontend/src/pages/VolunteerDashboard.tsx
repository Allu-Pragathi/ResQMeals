import { useState, useEffect } from 'react'
import api from '../lib/api'
import { MapPin, Clock, Trophy, Truck, CheckCircle } from 'lucide-react'

const VolunteerDashboard = () => {
    const [user, setUser] = useState<{ name: string } | null>(null)
    const [isAvailable, setIsAvailable] = useState(true)
    const [activeTab, setActiveTab] = useState<'open' | 'my-tasks'>('open')

    const [donations, setDonations] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchMissions = async () => {
        try {
            setIsLoading(true)
            const res = await api.get('/donations')
            setDonations(res.data.donations)
        } catch (err) {
            console.error('Failed to fetch missions', err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        const saved = localStorage.getItem('resqmeals_current_user')
        if (saved) setUser(JSON.parse(saved))
        fetchMissions()
    }, [])

    const handleAcceptMission = async (id: string) => {
        try {
            // In this flow, "Accepted" means an NGO took it. 
            // Volunteers can then mark it as "Picked".
            await api.patch(`/donations/${id}/status`, { status: 'Picked' })
            fetchMissions()
            alert('Mission accepted! Go to the pickup location.')
        } catch (err: any) {
            console.error('Failed to accept mission', err)
            alert(err.response?.data?.error || 'Failed to accept mission')
        }
    }

    const handleDeliver = async (id: string) => {
        try {
            await api.patch(`/donations/${id}/status`, { status: 'Delivered' })
            fetchMissions()
            alert('Mission completed! Great job.')
        } catch (err: any) {
            console.error('Failed to deliver', err)
            alert(err.response?.data?.error || 'Failed to complete mission')
        }
    }

    const openMissions = donations.filter(d => d.status === 'Accepted')
    const myMissions = donations.filter(d => d.status === 'Picked')

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
                {isLoading ? (
                    <div className="col-span-full py-12 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                    </div>
                ) : activeTab === 'open' ? (
                    openMissions.length === 0 ? (
                        <div className="col-span-full py-12 text-center rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200">
                             <p className="text-slate-500">No missions available for pickup right now.</p>
                        </div>
                    ) : openMissions.map((task) => (
                        <div key={task.id} className="group relative bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all hover:border-orange-200">
                            <span className="absolute top-4 right-4 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-600 ring-1 ring-inset ring-emerald-600/10">
                                Ready for Pickup
                            </span>

                            <div className="mb-4">
                                <span className="inline-block px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wide mb-2">
                                    Delivery Mission
                                </span>
                                <h3 className="text-lg font-bold text-slate-900">{task.foodType}</h3>
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-start gap-3">
                                    <div className="mt-1 min-w-[16px]">
                                        <div className="h-2 w-2 rounded-full bg-green-500 ring-4 ring-green-100" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium uppercase">Pick Up From</p>
                                        <p className="text-sm font-semibold text-slate-700">{task.donor?.name || 'Donor'} - {task.location}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                <div className="flex items-center gap-1 text-sm font-medium text-slate-600">
                                    <MapPin className="w-4 h-4 text-slate-400" />
                                    Nearby
                                </div>
                                <div className="flex items-center gap-1 text-sm font-bold text-orange-600">
                                    <Trophy className="w-4 h-4" />
                                    +50 pts
                                </div>
                            </div>

                            <button 
                                onClick={() => handleAcceptMission(task.id)}
                                className="w-full mt-4 py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-primary transition-colors"
                            >
                                Accept Mission
                            </button>
                        </div>
                    ))
                ) : (
                    myMissions.length === 0 ? (
                        <div className="col-span-full py-12 text-center rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200">
                            <CheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <h3 className="text-lg font-medium text-slate-900">No active assignments</h3>
                            <p className="text-slate-500">Accept a mission from the 'Nearby Requests' tab to get started.</p>
                        </div>
                    ) : myMissions.map((task) => (
                        <div key={task.id} className="group relative bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-all border-emerald-200">
                            <div className="mb-4">
                                <span className="inline-block px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wide mb-2">
                                    In Transit
                                </span>
                                <h3 className="text-lg font-bold text-slate-900">{task.foodType}</h3>
                            </div>

                            <div className="space-y-3 mb-6">
                                <p className="text-sm text-slate-600">You have picked up this item. Please deliver it to the NGO location.</p>
                            </div>

                            <button 
                                onClick={() => handleDeliver(task.id)}
                                className="w-full mt-4 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-sm hover:bg-emerald-700 transition-colors"
                            >
                                Mark as Delivered
                            </button>
                        </div>
                    ))
                )}
            </section>
        </div>
    )
}

export default VolunteerDashboard
