import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, allowedTypes }) => {
    const { user } = useAuth();
    console.log('Ruta protegida - Usuario: ', user);
    console.log('Ruta protegida - allowedTypes: ', allowedTypes);

    if (!user) {
        console.log('Ruta protegida - Usuario no encontrado, redirigiendo a login');
        return <Navigate to="/login" replace />;
    }

    if (!allowedTypes.includes(user.idUsuarioTipo)) {
        console.log('Ruta protegida - Usuario no tiene permisos, redirigiendo a home');
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
