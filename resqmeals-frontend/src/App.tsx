import { Route, Routes } from 'react-router-dom'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import DonorDashboard from './pages/DonorDashboard'
import NGODashboard from './pages/NGODashboard'
import AdminDashboard from './pages/AdminDashboard'
import ResQFeatures from './components/ResQFeatures'
import MarketingLayout from './layouts/MarketingLayout'
import DashboardLayout from './layouts/DashboardLayout'

function App() {
  return (
    <Routes>
      {/* Marketing / Public Routes */}
      <Route element={<MarketingLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/features" element={<ResQFeatures />} />
      </Route>

      {/* App / Dashboard Routes */}
      <Route element={<DashboardLayout />}>
        <Route path="/donor/*" element={<DonorDashboard />} />
        <Route path="/ngo/*" element={<NGODashboard />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
      </Route>
    </Routes>
  )
}

export default App
