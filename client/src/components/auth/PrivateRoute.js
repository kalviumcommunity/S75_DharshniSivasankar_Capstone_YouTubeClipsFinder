import { Navigate } from "react-router-dom"
import { useAuthContext } from "../../context/AuthContext"

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuthContext()

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  return children
}

export default PrivateRoute
