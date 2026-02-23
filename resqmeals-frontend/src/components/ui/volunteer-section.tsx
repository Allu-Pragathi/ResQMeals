import { useNavigate } from "react-router-dom";
import { Bike, Users, ArrowRight, Gift, Heart } from "lucide-react";

export const VolunteerSection = () => {
    const navigate = useNavigate();

    return (
        <div className="w-full bg-orange-50 py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-orange-200/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-200/40 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

            <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center relative z-10">
                {/* Content */}
                <div className="space-y-8">
                    <div className="inline-flex items-center gap-2 rounded-full bg-orange-100 border border-orange-200 px-4 py-1.5 text-sm font-bold text-orange-700">
                        <Bike className="h-4 w-4" />
                        Become a Hunger Hero
                    </div>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                        Not a restaurant? <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600">
                            You can still save lives.
                        </span>
                    </h2>
                    <p className="text-xl text-slate-600 max-w-xl leading-relaxed">
                        Join our fleet of volunteer delivery partners. Whether you have a bike, a car, or just spare time, you can transport food from donors to those in need.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <button
                            onClick={() => navigate('/auth?role=volunteer')}
                            className="inline-flex items-center justify-center rounded-full bg-orange-600 px-8 py-4 text-lg font-bold text-white shadow-xl shadow-orange-500/30 transition-all hover:bg-orange-700 hover:scale-105 active:scale-95"
                        >
                            Sign Up as Volunteer <ArrowRight className="ml-2 h-5 w-5" />
                        </button>
                        <button
                            onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                            className="inline-flex items-center justify-center rounded-full bg-white border-2 border-slate-200 px-8 py-4 text-lg font-bold text-slate-700 transition-all hover:border-orange-500 hover:text-orange-600"
                        >
                            How it Works
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-8 pt-8 border-t border-orange-200/60">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600">
                                <Gift className="h-6 w-6" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-slate-900">500+</div>
                                <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Active Volunteers</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
                                <Users className="h-6 w-6" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-slate-900">Daily</div>
                                <div className="text-xs text-slate-500 uppercase font-bold tracking-wider">Community Events</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Visual */}
                <div className="relative md:h-[600px] rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white group">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 z-10"></div>
                    <img
                        src="https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=80&w=2070&auto=format&fit=crop"
                        alt="Volunteers helping in community"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
                        <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 transform transition-all duration-300 hover:-translate-y-1">
                            <div className="flex gap-1 text-orange-500 mb-2">
                                <Heart className="h-4 w-4 fill-current" />
                                <Heart className="h-4 w-4 fill-current" />
                                <Heart className="h-4 w-4 fill-current" />
                                <Heart className="h-4 w-4 fill-current" />
                                <Heart className="h-4 w-4 fill-current" />
                            </div>
                            <p className="text-slate-800 font-medium italic text-lg mb-4">
                                "Connecting food to people is the most satisfying thing I've ever done. ResQMeals makes it so easy."
                            </p>
                            <div className="flex items-center gap-4">
                                <img
                                    src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=200&auto=format&fit=crop"
                                    className="h-12 w-12 rounded-full border-2 border-orange-100 object-cover"
                                    alt="Vikram Singh"
                                />
                                <div>
                                    <div className="text-base font-bold text-slate-900">Vikram Singh</div>
                                    <div className="text-sm text-orange-600 font-medium">Food Rescue Champion</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
