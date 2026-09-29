import { Navigate, Outlet } from "react-router-dom"




export function ProutecredRoutes() {


    const accessToken = localStorage.getItem("accessToken")
    if (!accessToken) {
        return <Navigate to="/auth" replace />
    }
    return <Outlet />

}








