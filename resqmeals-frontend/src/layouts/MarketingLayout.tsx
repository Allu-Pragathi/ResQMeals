import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const MarketingLayout = () => {
    return (
        <div className="min-h-screen bg-gradient-to-b from-soft to-white text-slate">
            <Navbar />
            <main className="flex-1 pb-20 pt-6">
                <Outlet />
            </main>
            <Footer />
        </div>
    )
}

export default MarketingLayout
