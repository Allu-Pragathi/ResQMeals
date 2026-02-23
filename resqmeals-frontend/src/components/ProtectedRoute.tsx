import { Navigate } from 'react-router-dom'

type ProtectedRouteProps = {
    children: React.ReactNode
    allowedRoles: string[]
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
    const userStr = localStorage.getItem('resqmeals_current_user')

    if (!userStr) {
        return <Navigate to="/auth" replace />
    }

    const user = JSON.parse(userStr)

    // Normalize roles for comparison (e.g. 'DONOR' vs 'Donor' vs 'donor')
    const normalizedUserRole = user.role.toLowerCase()
    const match = allowedRoles.some((r) => r.toLowerCase() === normalizedUserRole)

    if (!match) {
        // Redirect to their allowed dashboard
        // This prevents a Donor from seeing NGO pages
        return <Navigate to={`/${normalizedUserRole}`} replace />
    }

    return <>{children}</>
}

export default ProtectedRoute
