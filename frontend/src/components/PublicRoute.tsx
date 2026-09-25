import { Navigate, Outlet } from "react-router-dom";

const PublicRoute = () => {
  const isLoggedIn =
    localStorage.getItem("avplat_demo_logged_in") === "true";

  return isLoggedIn ? <Navigate to="/" replace /> : <Outlet />;
};

export default PublicRoute;