import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';
import logo from '../assets/images/logo1.png'; // Asegúrate de tener este logo
import '../assets/css/App.css';

const NavBar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isNavCollapsed, setIsNavCollapsed] = useState(true);

    const handleNavCollapse = () => setIsNavCollapsed(!isNavCollapsed);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const renderUserLinks = () => {
        if (!user) return null;

        switch (user.role) {
            case 1: return <Link className="nav-link" to="/cliente">Mi Dashboard</Link>;
            case 2: return <Link className="nav-link" to="/empleado">Dashboard Empleado</Link>;
            case 3: return <Link className="nav-link" to="/admin">Dashboard Admin</Link>;
            default: return null;
        }
    };

    const scrollToSection = (sectionId) => {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
            <div className="container">
                <Link className="navbar-brand" to="/">
                    <img src={logo} alt="Concesionaria PROG III" height="77" />
                </Link>
                <button 
                    className="navbar-toggler" 
                    type="button" 
                    onClick={handleNavCollapse}
                    aria-expanded={!isNavCollapsed}
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className={`${isNavCollapsed ? 'collapse' : ''} navbar-collapse`} id="navbarNav">
                    <ul className="navbar-nav me-auto">
                        <li className="nav-item">
                            <Link 
                                className={`nav-link ${window.location.pathname === '/' ? 'active' : ''}`} 
                                onClick={() => {
                                    scrollToSection('portada');
                                    setIsNavCollapsed(true);
                                }} 
                                to="/"
                            >
                                Inicio
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link 
                                className={`nav-link ${window.location.pathname === '/informacion' ? 'active' : ''}`} 
                                onClick={() => {
                                    scrollToSection('informacion');
                                    setIsNavCollapsed(true);
                                }} 
                                to="/informacion"
                            >
                                Información
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link 
                                className={`nav-link ${window.location.pathname === '/contacto' ? 'active' : ''}`} 
                                onClick={() => {
                                    scrollToSection('contacto');
                                    setIsNavCollapsed(true);
                                }} 
                                to="/contacto"
                            >
                                Contacto
                            </Link>
                        </li>
                        {renderUserLinks()}
                    </ul>
                    <ul className="navbar-nav">
                        {user ? (
                            <>
                                <li className="nav-item">
                                    <span className="nav-link">Bienvenido, {user.nombre} {user.apellido}</span>
                                </li>
                                <li className="nav-item">
                                    <button 
                                        className="btn btn-outline-primary" 
                                        style={{cursor: 'pointer'}} 
                                        onClick={() => {
                                            handleLogout();
                                            setIsNavCollapsed(true);
                                        }}
                                    >
                                        Cerrar Sesión
                                    </button>
                                </li>
                            </>
                        ) : (
                            <li className="nav-item">
                                <Link 
                                    className={`btn btn-primary ${window.location.pathname === '/login' ? 'active' : ''}`} 
                                    to="/login"
                                    onClick={() => setIsNavCollapsed(true)}
                                >
                                    Iniciar Sesión
                                </Link>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default NavBar;
