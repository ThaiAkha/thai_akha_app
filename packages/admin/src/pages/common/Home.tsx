import { Navigate } from "react-router";
import { useAuth } from "../../context/AuthContext";

const HOME_BY_ROLE: Record<string, string> = {
    admin: "/admin-home",
    manager: "/manager-home",
    driver: "/driver-home",
    agency: "/agency-home",
    kitchen: "/kitchen-home",
    logistics: "/logistic-home",
};

export default function Home() {
    const { user } = useAuth();
    const target = HOME_BY_ROLE[user?.role ?? ""] ?? "/agency-dashboard";
    return <Navigate to={target} replace />;
}
