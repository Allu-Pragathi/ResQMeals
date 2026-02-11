import { ArrowRight, ChevronRight, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import CTAButton from '../CTAButton';

export const Hero = () => {
    return (
        <div className="relative isolate overflow-hidden bg-white dark:bg-slate-900">
            <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
                <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 lg:pt-8">
                    <div className="mt-24 sm:mt-32 lg:mt-16">
                        <a href="#" className="inline-flex space-x-6">
                            <span className="rounded-full bg-orange-600/10 px-3 py-1 text-sm font-semibold leading-6 text-orange-600 ring-1 ring-inset ring-orange-600/10">
                                What's new
                            </span>
                            <span className="inline-flex items-center space-x-2 text-sm font-medium leading-6 text-gray-600 dark:text-gray-300">
                                <span>Just shipped v1.0</span>
                                <ChevronRight className="h-5 w-5 text-gray-400" aria-hidden="true" />
                            </span>
                        </a>
                    </div>
                    <h1 className="mt-10 text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-6xl">
                        Rescuing Food, <br />
                        <span className="text-orange-600">Feeding Hope.</span>
                    </h1>
                    <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
                        ResQMeals connects donors, NGOs, and volunteers to move safe surplus food
                        quickly, transparently, and responsibly. Join thousands making a difference.
                    </p>
                    <div className="mt-10 flex items-center gap-x-6">
                        <CTAButton to="/auth">
                            Start Donating
                        </CTAButton>
                        <Link to="/about" className="text-sm font-semibold leading-6 text-slate-900 dark:text-white flex items-center gap-2 group">
                            Learn more <span aria-hidden="true" className="group-hover:translate-x-1 transition-transform">→</span>
                        </Link>
                    </div>
                </div>
                <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mt-0 lg:mr-0 lg:max-w-none lg:flex-none xl:ml-32">
                    <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
                        <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
                            <img
                                src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                                alt="Community food distribution"
                                width={2432}
                                height={1442}
                                className="w-[76rem] rounded-md shadow-2xl ring-1 ring-gray-900/10"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
