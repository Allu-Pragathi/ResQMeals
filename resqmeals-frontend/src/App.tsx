import { Route, Routes } from 'react-router-dom'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import DonorDashboard from './pages/DonorDashboard'
import NGODashboard from './pages/NGODashboard'
import VolunteerDashboard from './pages/VolunteerDashboard'
import EventsDashboard from './pages/EventsDashboard'
import AdminDashboard from './pages/AdminDashboard'
import ResQFeatures from './components/ResQFeatures'
import MarketingLayout from './layouts/MarketingLayout'
import DashboardLayout from './layouts/DashboardLayout'

import ProtectedRoute from './components/ProtectedRoute'

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
        <Route
          path="/donor/*"
          element={
            <ProtectedRoute allowedRoles={['Donor']}>
              <DonorDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ngo/*"
          element={
            <ProtectedRoute allowedRoles={['NGO']}>
              <NGODashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/volunteer/*"
          element={
            <ProtectedRoute allowedRoles={['Volunteer']}>
              <VolunteerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events/*"
          element={
            <ProtectedRoute allowedRoles={['Events']}>
              <EventsDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/admin/*" element={<AdminDashboard />} />
      </Route>
    </Routes>
  )
}

export default App
