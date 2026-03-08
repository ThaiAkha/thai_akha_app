import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import AkhaPixelPattern from '../ui/AkhaPixelPattern';

interface ProtectedRouteProps {
    children?: React.ReactNode;
    allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-white dark:bg-gray-900">
                <AkhaPixelPattern variant="logo" size={10} speed={30} />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/signin" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return children ? <>{children}</> : <Outlet />;
}
