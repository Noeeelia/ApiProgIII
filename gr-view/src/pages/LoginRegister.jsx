import React, { useState, useContext } from "react";
import { useNavigate } from 'react-router-dom';
import AuthContext from '../contexts/AuthContext';
import '../assets/css/LoginRegister.css';
import iconoLlave from '../assets/images/llave.webp';

const LoginRegister = () => {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [isLoginActive, setIsLoginActive] = useState(true);
    const [isAdminAccess, setIsAdminAccess] = useState(false);
    const [adminKey, setAdminKey] = useState('');
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        correoElectronico: '',
        contrasenia: '',
        imagen: null,
        idUsuarioTipo: "1" // Como string para coincidir con el value del select
    });
    const [adminKeyVerified, setAdminKeyVerified] = useState(false);

    const handleAdminKeySubmit = async (e) => {
        e.preventDefault();
        if (adminKey === 'Admin123') { // Reemplaza con tu clave real
            setAdminKeyVerified(true);
        } else {
            alert('Clave de administrador incorrecta');
        }
    };

    const handleChange = (e) => {
        if (e.target.name === 'imagen') {
            const file = e.target.files[0];
            const maxSize = 1 * 1024 * 1024; // 1MB

            if (file && file.size > maxSize) {
                alert('La imagen no debe superar 1MB');
                e.target.value = ''; // Limpia el input
                return;
            }

            setFormData({
                ...formData,
                [e.target.name]: file
            });
        } else {
            setFormData({
                ...formData,
                [e.target.name]: e.target.value
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isLoginActive) {
                const loginData = {
                    correoElectronico: formData.correoElectronico,
                    contrasenia: formData.contrasenia,
                    idUsuarioTipo: parseInt(formData.idUsuarioTipo) // Aseguramos que sea número
                };

                const response = await fetch('http://localhost:3001/api/v1/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify(loginData)
                });

                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.mensaje || 'Error en el inicio de sesión');
                }

                // Extraer los datos del token JWT
                const tokenParts = data.token.split('.');
                const tokenPayload = JSON.parse(atob(tokenParts[1]));

                // Verificar que el tipo de usuario coincida
                const userTypeFromToken = parseInt(tokenPayload.idUsuarioTipo);
                const selectedUserType = parseInt(formData.idUsuarioTipo);

                // Dentro del handleSubmit, después de decodificar el token
                console.log('Token payload:', tokenPayload);
                console.log('User type from token:', userTypeFromToken);
                console.log('Selected user type:', selectedUserType);

                if (userTypeFromToken !== selectedUserType) {
                    throw new Error('Por favor, seleccione el tipo de usuario correcto para sus credenciales');
                }

                // Crear el objeto de usuario
                const userData = {
                    idUsuario: tokenPayload.idUsuario, // Verifica que este campo exista en el token
                    idUsuarioTipo: userTypeFromToken,
                    correoElectronico: formData.correoElectronico,
                    nombre: tokenPayload.nombre,
                    apellido: tokenPayload.apellido
                };

                console.log('Login exitoso - userData:', userData);
                // Manejar el inicio de sesión
                login(userData, data.token);
                
                // Redirección según tipo de usuario
                const dashboardRoutes = {
                    1: '/cliente',
                    2: '/empleado',
                    3: '/admin'
                };

                const route = dashboardRoutes[userData.idUsuarioTipo];
                if (!route) {
                    throw new Error('Tipo de usuario no válido');
                }

                alert('¡Inicio de sesión exitoso!');
                navigate(route);
            } else {
                // Crear FormData para manejar la imagen
                const formDataToSend = new FormData();
                formDataToSend.append('nombre', formData.nombre);
                formDataToSend.append('apellido', formData.apellido);
                formDataToSend.append('correoElectronico', formData.correoElectronico);
                formDataToSend.append('contrasenia', formData.contrasenia);
                // formDataToSend.append('idUsuarioTipo', formData.idUsuarioTipo);
                
                if (formData.imagen) {
                    formDataToSend.append('imagen', formData.imagen);
                }

                const response = await fetch('http://localhost:3001/api/v1/auth/register', {
                    method: 'POST',
                    body: formDataToSend // No establecer Content-Type, fetch lo hará automáticamente
                });

                const data = await response.json();
                
                if (!response.ok) {
                    console.error('Error en el registro:', data);
                    throw new Error(data.mensaje || 'Error en el registro');
                }

                alert(data.mensaje);
                setIsLoginActive(true);
            }
        } catch (error) {
            console.error('Error:', error);
            alert(error.message);
        }
    };

    return (
        <div className="main-container">
            <div className="content">
                <div className="login-register-container">
                    <div className="card">
                        <div className="card-body">
                            <ul className="nav nav-tabs">
                                <li className="nav-item">
                                    <button 
                                        className={`nav-link ${isLoginActive ? 'active' : ''}`} 
                                        onClick={() => {
                                            setIsLoginActive(true);
                                            setIsAdminAccess(false);
                                            setAdminKeyVerified(false);
                                        }}
                                    >
                                        Iniciar Sesión
                                    </button>
                                </li>
                                <li className="nav-item">
                                    <button 
                                        className={`nav-link ${!isLoginActive ? 'active' : ''}`} 
                                        onClick={() => setIsLoginActive(false)}
                                    >
                                        Registrarse
                                    </button>
                                </li>
                            </ul>

                            {/* Formulario de Login */}
                            {isLoginActive && (
                                <form onSubmit={handleSubmit}>
                                    <h2 className="mb-3">Iniciar Sesión</h2>
                                    <div className="mb-3">
                                        <input 
                                            type="email" 
                                            className="form-control" 
                                            name="correoElectronico" 
                                            placeholder="Correo Electrónico" 
                                            onChange={handleChange} 
                                            required 
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <input 
                                            type="password" 
                                            className="form-control" 
                                            name="contrasenia" 
                                            placeholder="Contraseña" 
                                            onChange={handleChange} 
                                            required 
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Tipo de Usuario:</label>
                                        <select 
                                            className="form-select"
                                            name="idUsuarioTipo"
                                            value={formData.idUsuarioTipo}
                                            onChange={handleChange}
                                        >
                                            <option value="1">Cliente</option>
                                            <option value="2">Empleado</option>
                                            <option value="3">Administrador</option>
                                        </select>
                                    </div>
                                    <button type="submit" className="btn btn-primary w-100 btn-center">
                                        Entrar
                                    </button>
                                </form>
                            )}

                            {/* Formulario de Registro */}
                            {!isLoginActive && !isAdminAccess && (
                                <form onSubmit={handleSubmit} className="register-form">
                                    <h2 className="mb-3">Registrarse</h2>
                                    <div className="mb-3">
                                        <input type="text" className="form-control" name="nombre" placeholder="Nombre" onChange={handleChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <input type="text" className="form-control" name="apellido" placeholder="Apellido" onChange={handleChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <input type="email" className="form-control" name="correoElectronico" placeholder="Correo Electrónico" onChange={handleChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <input type="password" className="form-control" name="contrasenia" placeholder="Contraseña" onChange={handleChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <input 
                                            type="file" 
                                            className="form-control" 
                                            name="imagen" 
                                            onChange={handleChange} 
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-primary w-100 mb-2 btn-center">
                                        Registrarse
                                    </button>
                                    <button 
                                        type="button" 
                                        className="btn btn-light w-100 btn-center"
                                        onClick={() => setIsAdminAccess(true)}
                                    >
                                        <img 
                                            src={iconoLlave} 
                                            alt="Acceso Administrador" 
                                            className="me-2" 
                                            style={{width: '20px', height: '20px'}} 
                                        /> 
                                        Acceso Restringido
                                    </button>
                                </form>
                            )}

                            {/* Formulario de Verificación Admin */}
                            {!isLoginActive && isAdminAccess && !adminKeyVerified && (
                                <form onSubmit={handleAdminKeySubmit} className="admin-key-form">
                                    <h2 className="mb-3">Acceso Administrador</h2>
                                    <div className="mb-3">
                                        <input 
                                            type="password" 
                                            className="form-control"
                                            placeholder="Clave de Administrador" 
                                            value={adminKey}
                                            onChange={(e) => setAdminKey(e.target.value)}
                                            required 
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-primary w-100 btn-center">
                                        Confirmar Acceso
                                    </button>
                                </form>
                            )}

                            {/* Formulario de Registro Admin */}
                            {!isLoginActive && isAdminAccess && adminKeyVerified && (
                                <form onSubmit={handleSubmit} className="register-form">
                                    <h2 className="mb-3">Registro de Administrador</h2>
                                    <div className="mb-3">
                                        <input type="text" className="form-control" name="nombre" placeholder="Nombre" onChange={handleChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <input type="text" className="form-control" name="apellido" placeholder="Apellido" onChange={handleChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <input type="email" className="form-control" name="correoElectronico" placeholder="Correo Electrónico" onChange={handleChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <input type="password" className="form-control" name="contrasenia" placeholder="Contraseña" onChange={handleChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <input 
                                            type="file" 
                                            className="form-control" 
                                            name="imagen" 
                                            onChange={handleChange} 
                                        />
                                    </div>
                                    <button type="submit" className="btn btn-primary w-100 btn-center">
                                        Registrarse como Administrador
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginRegister;
