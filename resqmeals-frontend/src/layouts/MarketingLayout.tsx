import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const MarketingLayout = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-soft to-white text-slate">
            <Navbar />
            <main className="mx-auto max-w-7xl px-4 pb-20 pt-6 sm:px-6 lg:px-8">
                <Outlet />
            </main>
            <Footer />
        </div>
    )
}

export default MarketingLayout
