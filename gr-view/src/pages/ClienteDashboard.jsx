import React, { useState, useEffect } from "react";
import axios from 'axios';
import '../assets/css/ClienteDashboard.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

const ClienteDashboard = () => {
    const [reclamos, setReclamos] = useState([]);
    const [mostrarFormularioPerfil, setMostrarFormularioPerfil] = useState(false);
    const [perfilCliente, setPerfilCliente] = useState({
        nombre: '',
        apellido: '',
        correoElectronico: '',
        imagen: ''
    });
    const [mostrarFormularioReclamo, setMostrarFormularioReclamo] = useState(false);
    const [nuevoReclamo, setNuevoReclamo] = useState({ asunto: '', descripcion: '' });
    const [filtroActivo, setFiltroActivo] = useState('todos');
    const [estadisticas, setEstadisticas] = useState({
        creados: 0,
        en_proceso: 0,
        cancelados: 0,
        finalizados: 0
    });
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setCargando(true);
                const token = sessionStorage.getItem('token');
                
                if (!token) {
                    window.location.href = '/login';
                    return;
                }

                const config = {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                };

                // Obtener datos del perfil
                const perfilResponse = await axios.get(
                    'http://localhost:3001/api/v1/auth/perfil',
                    config
                );

                console.log('Respuesta del perfil:', perfilResponse.data);

                if (perfilResponse.data && perfilResponse.data.perfil) {
                    setPerfilCliente(perfilResponse.data.perfil);
                }

                // Obtener reclamos
                const reclamosResponse = await axios.get(
                    'http://localhost:3001/api/v1/reclamos/misReclamos',
                    config
                );

                if (reclamosResponse.data && reclamosResponse.data.datos) {
                    const reclamosData = reclamosResponse.data.datos;
                    setReclamos(reclamosData);
                    
                    // Actualizar estadísticas considerando mayúsculas
                    const stats = {
                        creados: reclamosData.filter(r => r.estado === 'Creado').length,
                        en_proceso: reclamosData.filter(r => r.estado === 'En proceso').length,
                        cancelados: reclamosData.filter(r => r.estado === 'Cancelado').length,
                        finalizados: reclamosData.filter(r => r.estado === 'Finalizado').length
                    };
                    setEstadisticas(stats);
                    console.log('Estadísticas actualizadas:', stats);
                }
            } catch (error) {
                console.error('Error al cargar datos:', error);
                if (error.response?.status === 401) {
                    sessionStorage.removeItem('token');
                    window.location.href = '/login';
                }
            } finally {
                setCargando(false);
            }
        };

        fetchData();
    }, []);

    const handleImagenChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.type.startsWith('image/')) {
                setPerfilCliente({
                    ...perfilCliente,
                    imagen: file
                });
            } else {
                alert('Por favor, seleccione un archivo de imagen válido');
                e.target.value = '';
            }
        }
    };

    const handleActualizarPerfil = async (e) => {
        e.preventDefault();
        if (!perfilCliente.nombre || !perfilCliente.apellido || !perfilCliente.correoElectronico) {
            alert('Los campos nombre, apellido y correo electrónico son obligatorios');
            return;
        }

        try {
            const token = sessionStorage.getItem('token');
            if (!token) {
                window.location.href = '/login';
                return;
            }

            const formData = new FormData();
            
            // Agregar datos básicos al FormData
            formData.append('nombre', perfilCliente.nombre.trim());
            formData.append('apellido', perfilCliente.apellido.trim());
            formData.append('correoElectronico', perfilCliente.correoElectronico.trim());

            // Solo agregar la imagen si es un archivo nuevo
            if (perfilCliente.imagen instanceof File) {
                formData.append('imagen', perfilCliente.imagen);
            }

            // Log de los datos que se van a enviar
            const datosEnviados = {
                nombre: perfilCliente.nombre.trim(),
                apellido: perfilCliente.apellido.trim(),
                correoElectronico: perfilCliente.correoElectronico.trim(),
                tieneImagen: perfilCliente.imagen instanceof File
            };

            if (perfilCliente.imagen instanceof File) {
                console.log('Detalles de la imagen:', {
                    nombre: perfilCliente.imagen.name,
                    tipo: perfilCliente.imagen.type,
                    tamaño: perfilCliente.imagen.size + ' bytes'
                });
            }

            console.log('Datos a enviar:', datosEnviados);

            // Verificar contenido del FormData
            for (let pair of formData.entries()) {
                console.log('FormData contiene:', pair[0], pair[1] instanceof File ? 
                    `[File: ${pair[1].name}, ${pair[1].type}, ${pair[1].size} bytes]` : 
                    pair[1]);
            }

            const response = await axios.patch(
                'http://localhost:3001/api/v1/auth/actualizarPerfil',
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            console.log('Respuesta del servidor:', response.data);

            if (response.data && response.data.exito) {
                setMostrarFormularioPerfil(false);
                alert('Perfil actualizado exitosamente');

                // Recargar los datos del perfil
                const perfilResponse = await axios.get(
                    'http://localhost:3001/api/v1/auth/perfil',
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );

                if (perfilResponse.data && perfilResponse.data.perfil) {
                    setPerfilCliente(perfilResponse.data.perfil);
                }
            }
        } catch (error) {
            console.error('Error completo:', error);
            console.error('Detalles del error:', {
                mensaje: error.message,
                respuesta: error.response?.data,
                estado: error.response?.status,
                headers: error.config?.headers
            });

            const mensajeError = error.response?.data?.mensaje || 
                               error.response?.data?.message || 
                               'Error al actualizar el perfil. Por favor, intente nuevamente.';
            
            alert(`Error: ${mensajeError}`);
            
            if (error.response?.status === 401) {
                sessionStorage.removeItem('token');
                window.location.href = '/login';
            }
        }
    };

    const handleCrearReclamo = async (e) => {
        e.preventDefault();
        try {
            const token = sessionStorage.getItem('token');
            const response = await axios.post(
                'http://localhost:3001/api/v1/reclamos/crear',
                {
                    asunto: nuevoReclamo.asunto,
                    descripcion: nuevoReclamo.descripcion,
                    idReclamoTipo: 1
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.exito) {
                const reclamosResponse = await axios.get(
                    'http://localhost:3001/api/v1/reclamos/misReclamos',
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setReclamos(reclamosResponse.data.datos);
                setMostrarFormularioReclamo(false);
                setNuevoReclamo({ asunto: '', descripcion: '' });
                alert('Reclamo creado exitosamente');
            }
        } catch (error) {
            console.error('Error al crear reclamo:', error);
            alert(error.response?.data?.mensaje || 'Error al crear el reclamo');
        }
    };

    const handleCancelarReclamo = async (idReclamo) => {
        if (!window.confirm('¿Está seguro que desea cancelar este reclamo?')) {
            return;
        }

        try {
            const token = sessionStorage.getItem('token');
            const response = await axios.patch(
                `http://localhost:3001/api/v1/reclamos/cancelar/${idReclamo}`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.exito) {
                // Actualizar el estado local del reclamo
                setReclamos(reclamos.map(reclamo => 
                    reclamo.id === idReclamo 
                        ? { ...reclamo, estado: 'Cancelado' }
                        : reclamo
                ));
                
                // Actualizar estadísticas
                setEstadisticas(prev => ({
                    ...prev,
                    creados: prev.creados - 1,
                    cancelados: prev.cancelados + 1
                }));

                alert('Reclamo cancelado exitosamente');
            }
        } catch (error) {
            console.error('Error detallado:', {
                mensaje: error.message,
                respuesta: error.response?.data,
                estado: error.response?.status,
                config: error.config
            });
            alert(error.response?.data?.mensaje || 'Error al cancelar el reclamo. Por favor, intente nuevamente.');
        }
    };

    const getEstadoTexto = (estado) => {
        return estado; // Ya viene con el formato correcto desde el backend
    };

    

    const reclamosFiltrados = reclamos
        .sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion))
        .filter(reclamo => {
            if (filtroActivo === 'todos') return true;
            if (filtroActivo === 'en_proceso') return reclamo.estado === 'En proceso';
            return reclamo.estado.toLowerCase() === filtroActivo;
        });

    if (cargando) {
        return (
            <div className="dashboard-container">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Cargando...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <div className="sidebar">
                <div className="profile-section">
                    <img 
                        src={perfilCliente.imagen ? `http://localhost:3001/${perfilCliente.imagen}` : '/default-avatar.png'} 
                        alt="Foto de perfil" 
                        className="profile-image"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/default-avatar.png';
                        }}
                    />
                    <h2>{perfilCliente.nombre}</h2>
                    <p>{perfilCliente.correoElectronico}</p>
                </div>
                <nav>
                    <ul>
                        <li className="active">Dashboard</li>
                        <li onClick={() => setMostrarFormularioPerfil(true)}>Mi Perfil</li>
                    </ul>
                </nav>
            </div>

            <div className="main-content">
                <div className="dashboard-header">
                    <h1>Dashboard</h1>
                    <p>{new Date().toLocaleDateString('es-ES', { 
                        day: 'numeric', 
                        month: 'long', 
                        year: 'numeric'
                    })}</p>
                </div>

                <div className="stats-container">
                    <div className="stat-card">
                        <div className="stat-icon creados">
                            <i className="fas fa-file-alt"></i>
                        </div>
                        <div className="stat-info">
                            <p>Total de Reclamos:</p>
                            <h3>Creados</h3>
                            <span>{estadisticas.creados}</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon en_proceso">
                            <i className="fas fa-circle-up"></i>
                        </div>
                        <div className="stat-info">
                            <p>Total de Reclamos:</p>
                            <h3>En Proceso</h3>
                            <span>{estadisticas.en_proceso}</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon cancelados">
                            <i className="fas fa-times-circle"></i>
                        </div>
                        <div className="stat-info">
                            <p>Total de Reclamos:</p>
                            <h3>Cancelados</h3>
                            <span>{estadisticas.cancelados}</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon finalizados">
                            <i className="fas fa-check-circle"></i>
                        </div>
                        <div className="stat-info">
                            <p>Total de Reclamos:</p>
                            <h3>Finalizados</h3>
                            <span>{estadisticas.finalizados}</span>
                        </div>
                    </div>
                </div>

                <div className="reclamos-section">
                    <div className="section-header">
                        <h2>Mis Reclamos</h2>
                        <button 
                            className="create-button"
                            onClick={() => setMostrarFormularioReclamo(true)}
                        >
                            Crear Reclamo
                        </button>
                    </div>

                    <div className="tabs">
                        <button 
                            className={filtroActivo === 'todos' ? 'active' : ''}
                            onClick={() => setFiltroActivo('todos')}
                        >
                            Todos <span>{reclamos.length}</span>
                        </button>
                        <button 
                            className={filtroActivo === 'creado' ? 'active' : ''}
                            onClick={() => setFiltroActivo('creado')}
                        >
                            Creados <span>{estadisticas.creados}</span>
                        </button>
                        <button 
                            className={filtroActivo === 'en_proceso' ? 'active' : ''}
                            onClick={() => setFiltroActivo('en_proceso')}
                        >
                            En proceso <span>{estadisticas.en_proceso}</span>
                        </button>
                        <button 
                            className={filtroActivo === 'cancelado' ? 'active' : ''}
                            onClick={() => setFiltroActivo('cancelado')}
                        >
                            Cancelados <span>{estadisticas.cancelados}</span>
                        </button>
                        <button 
                            className={filtroActivo === 'finalizado' ? 'active' : ''}
                            onClick={() => setFiltroActivo('finalizado')}
                        >
                            Finalizados <span>{estadisticas.finalizados}</span>
                        </button>
                    </div>

                    <div className="reclamos-list">
                        {reclamosFiltrados.map(reclamo => (
                            <div key={reclamo.idReclamo} className="reclamo-card">
                                <div className="reclamo-header">
                                    <h3>{reclamo.asunto}</h3>
                                    <div 
                                        className="estado-badge" 
                                        data-estado={reclamo.estado}
                                    >
                                        {getEstadoTexto(reclamo.estado)}
                                    </div>
                                </div>
                                <p className="reclamo-descripcion">{reclamo.descripcion}</p>
                                <div className="reclamo-footer">
                                    <span className="fecha">
                                        {new Date(reclamo.fechaCreacion).toLocaleDateString()}
                                    </span>
                                    {reclamo.estado.toLowerCase() === 'creado' && (
                                        <button 
                                            onClick={() => handleCancelarReclamo(reclamo.id)}
                                            className="cancelar-btn"
                                        >
                                            Cancelar
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        {reclamosFiltrados.length === 0 && (
                            <div className="no-reclamos">
                                <p>No hay reclamos para mostrar</p>
                            </div>
                        )}
                    </div>
                </div>

                {mostrarFormularioPerfil && (
                    <div className="modal">
                        <div className="modal-content">
                            <h2>Actualizar Perfil</h2>
                            <form onSubmit={handleActualizarPerfil}>
                                <input
                                    type="text"
                                    placeholder="Nombre"
                                    value={perfilCliente.nombre}
                                    onChange={e => setPerfilCliente({...perfilCliente, nombre: e.target.value})}
                                />
                                <input
                                    type="text"
                                    placeholder="Apellido"
                                    value={perfilCliente.apellido}
                                    onChange={e => setPerfilCliente({...perfilCliente, apellido: e.target.value})}
                                />
                                <input
                                    type="email"
                                    placeholder="correo@gmail.com"
                                    value={perfilCliente.correoElectronico}
                                    onChange={e => setPerfilCliente({...perfilCliente, correoElectronico: e.target.value})}
                                />
                                <input
                                    type="file"
                                    onChange={handleImagenChange}
                                    accept="image/*"
                                />
                                <div className="modal-buttons">
                                    <button type="submit">Guardar</button>
                                    <button type="button" onClick={() => setMostrarFormularioPerfil(false)}>
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {mostrarFormularioReclamo && (
                    <div className="modal">
                        <div className="modal-content">
                            <h2>Crear Nuevo Reclamo</h2>
                            <form onSubmit={handleCrearReclamo}>
                                <input
                                    type="text"
                                    placeholder="Asunto"
                                    value={nuevoReclamo.asunto}
                                    onChange={e => setNuevoReclamo({...nuevoReclamo, asunto: e.target.value})}
                                    required
                                />
                                <textarea
                                    placeholder="Descripción"
                                    value={nuevoReclamo.descripcion}
                                    onChange={e => setNuevoReclamo({...nuevoReclamo, descripcion: e.target.value})}
                                    required
                                ></textarea>
                                <div className="modal-buttons">
                                    <button type="submit">Crear</button>
                                    <button type="button" onClick={() => setMostrarFormularioReclamo(false)}>
                                        Cancelar
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClienteDashboard;
