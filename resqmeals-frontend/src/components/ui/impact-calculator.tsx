import { useState } from "react";
import { Utensils, Leaf, Users, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const ImpactCalculator = () => {
    const [foodAmount, setFoodAmount] = useState(10); // kg
    const navigate = useNavigate();

    // Constants (approximate)
    const mealsPerKg = 2.5;
    const co2PerKg = 1.9; // kg CO2 equivalent

    // Calculations
    const meals = Math.floor(foodAmount * mealsPerKg);
    const co2 = (foodAmount * co2PerKg).toFixed(1);
    const people = Math.floor(foodAmount * mealsPerKg);

    return (
        <div className="w-full">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12">
                <div className="inline-flex items-center rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-sm font-medium text-orange-800 mb-4">
                    Interactive Tool
                </div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-4">
                    See the Power of Your Surplus
                </h2>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                    Every kilogram of food you save has a tangible impact on our planet and community. Use the slider below to estimate your contribution.
                </p>
            </div>

            <div className="w-full bg-white relative">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-amber-500"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 grid lg:grid-cols-2 gap-12 items-center">
                    {/* Input Section */}
                    <div>
                        <label className="block text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">I have approximately</label>
                        <div className="flex items-baseline gap-2 mb-8">
                            <span className="text-6xl font-extrabold text-slate-900 tracking-tight">{foodAmount}</span>
                            <span className="text-2xl font-medium text-slate-400">kg of food</span>
                        </div>

                        <div className="relative h-16 flex items-center mb-4">
                            <input
                                type="range"
                                min="1"
                                max="100"
                                value={foodAmount}
                                onChange={(e) => setFoodAmount(Number(e.target.value))}
                                className="w-full h-3 bg-slate-100 rounded-full appearance-none cursor-pointer accent-orange-500 focus:outline-none focus:ring-4 focus:ring-orange-100"
                                style={{
                                    background: `linear-gradient(to right, #f97316 0%, #f97316 ${(foodAmount / 100) * 100}%, #f1f5f9 ${(foodAmount / 100) * 100}%, #f1f5f9 100%)`
                                }}
                            />
                        </div>
                        <p className="text-sm text-slate-400 italic">Drag the slider to adjust the amount</p>
                    </div>

                    {/* Results Section */}
                    <div className="grid gap-4">
                        <div className="bg-orange-50/50 rounded-2xl p-6 flex items-center gap-6 border border-orange-100 transition-transform hover:scale-[1.02]">
                            <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-sm text-orange-600 shrink-0">
                                <Utensils className="h-8 w-8" />
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-slate-900">{meals}</div>
                                <div className="text-sm font-medium text-slate-600">Meals Served</div>
                            </div>
                        </div>

                        <div className="bg-emerald-50/50 rounded-2xl p-6 flex items-center gap-6 border border-emerald-100 transition-transform hover:scale-[1.02]">
                            <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-sm text-emerald-600 shrink-0">
                                <Leaf className="h-8 w-8" />
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-slate-900">{co2} kg</div>
                                <div className="text-sm font-medium text-slate-600">CO₂ Emissions Prevented</div>
                            </div>
                        </div>

                        <div className="bg-blue-50/50 rounded-2xl p-6 flex items-center gap-6 border border-blue-100 transition-transform hover:scale-[1.02]">
                            <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-600 shrink-0">
                                <Users className="h-8 w-8" />
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-slate-900">{people}</div>
                                <div className="text-sm font-medium text-slate-600">People Fed</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 flex justify-between items-center flex-wrap gap-4">
                    <p className="text-xs text-slate-500 font-medium">
                        *Estimates based on FAO global food waste standards.
                    </p>
                    <button
                        onClick={() => navigate('/auth')}
                        className="text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 transition-colors"
                    >
                        Start Donating Now <ArrowRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};
