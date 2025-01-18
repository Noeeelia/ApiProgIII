import React, { useState, useEffect } from "react";
import axios from 'axios';
import '../assets/css/AdminDashboard.css';
import { 
    FaEdit, 
    FaTrash, 
    FaBuilding, 
    FaPlus, 
    FaFileDownload,
    FaClipboardList,
    FaExclamationCircle,
    FaCheckCircle,
    FaClock,
    FaChartLine
} from 'react-icons/fa';

const AdminDashboard = () => {
    const [empleados, setEmpleados] = useState([]);
    const [oficinas, setOficinas] = useState([]);
    const [tiposReclamos, setTiposReclamos] = useState([]);
    const [estadisticas, setEstadisticas] = useState({
        totalReclamos: 0,
        reclamosPendientes: 0,
        reclamosResueltos: 0,
        reclamosEnProceso: 0,
        reclamosCancelados: 0
    });
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);
    const [activeSection, setActiveSection] = useState('estadisticas');
    const [showModal, setShowModal] = useState(false);
    const [modalContent, setModalContent] = useState(null);
    const [nuevoEmpleado, setNuevoEmpleado] = useState({
        nombre: '',
        apellido: '',
        correoElectronico: '',
        contrasenia: '',
        idOficina: ''
    });
    const [nuevaOficina, setNuevaOficina] = useState({
        nombre: '',
        idReclamoTipo: '',
    });

    const fetchData = async () => {
        try {
            const token = sessionStorage.getItem('token');
            if (!token) {
                setError('No hay token de autenticación');
                setCargando(false);
                return;
            }

            const config = { 
                headers: { 
                    Authorization: `Bearer ${token}`
                }
            };

            const estadisticasRes = await axios.get('http://localhost:3001/api/v1/administradores/estadisticas', config);
            
            setEstadisticas({
                totalReclamos: estadisticasRes.data.datos.totalReclamos || 0,
                reclamosPendientes: estadisticasRes.data.datos.reclamosCreados || 0,
                reclamosResueltos: estadisticasRes.data.datos.reclamosFinalizados || 0,
                reclamosEnProceso: estadisticasRes.data.datos.reclamosEnProceso || 0,
                reclamosCancelados: estadisticasRes.data.datos.reclamosCancelados || 0
            });

            const empleadosRes = await axios.get('http://localhost:3001/api/v1/administradores/empleados/listar', config);
            const oficinasRes = await axios.get('http://localhost:3001/api/v1/administradores/oficinas/listar', config);
            const tiposReclamosRes = await axios.get('http://localhost:3001/api/v1/administradores/tiposReclamos/listar', config);

            setEmpleados(empleadosRes.data.datos || []);
            setOficinas(oficinasRes.data.datos || []);
            setTiposReclamos(tiposReclamosRes.data.datos || []);

            setCargando(false);
        } catch (error) {
            console.error('Error al cargar los datos:', error);
            setError('Error al cargar los datos');
            setCargando(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Renderizado de estadísticas con iconos y colores
    const renderEstadisticas = () => (
        <div className="dashboard-stats">
            <h2 className="stats-title">
                <FaChartLine /> Estadísticas de Reclamos
            </h2>
            <div className="stats-grid">
                <div className="stat-card total">
                    <div className="stat-icon">
                        <FaClipboardList />
                    </div>
                    <div className="stat-info">
                        <h3>Total Reclamos</h3>
                        <div className="stat-value">{estadisticas.totalReclamos}</div>
                        <div className="stat-description">Reclamos registrados</div>
                    </div>
                </div>

                <div className="stat-card pending">
                    <div className="stat-icon">
                        <FaExclamationCircle />
                    </div>
                    <div className="stat-info">
                        <h3>Pendientes</h3>
                        <div className="stat-value">{estadisticas.reclamosPendientes}</div>
                        <div className="stat-description">Sin asignar</div>
                    </div>
                </div>

                <div className="stat-card in-progress">
                    <div className="stat-icon">
                        <FaClock />
                    </div>
                    <div className="stat-info">
                        <h3>En Proceso</h3>
                        <div className="stat-value">{estadisticas.reclamosEnProceso}</div>
                        <div className="stat-description">En atención</div>
                    </div>
                </div>

                <div className="stat-card resolved">
                    <div className="stat-icon">
                        <FaCheckCircle />
                    </div>
                    <div className="stat-info">
                        <h3>Finalizados</h3>
                        <div className="stat-value">{estadisticas.reclamosResueltos}</div>
                        <div className="stat-description">Completados</div>
                    </div>
                </div>
            </div>
        </div>
    );

    const handleEditarEmpleado = (empleado) => {
        setModalContent(
            <div>
                <h3>Editar Empleado</h3>
                <form onSubmit={handleActualizarEmpleado}>
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Nombre"
                            className="form-control"
                            name="nombre"
                            required
                            value={empleado.nombre}
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Apellido"
                            className="form-control"
                            name="apellido"
                            required
                            value={empleado.apellido}
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="email"
                            placeholder="Correo Electrónico"
                            className="form-control"
                            name="correoElectronico"
                            required
                            value={empleado.correoElectronico}
                        />
                    </div>
                    <div className="form-group">
                        <select 
                            className="form-control"
                            name="idOficina"
                            required
                        >
                            <option value="">Seleccione una oficina</option>
                            {oficinas.map(oficina => (
                                <option key={oficina.idOficina} value={oficina.idOficina}>
                                    {oficina.nombre}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary">
                        Actualizar Empleado
                    </button>
                </form>
            </div>
        );
        setShowModal(true);
    };

    const handleGestionarEmpleadosOficina = (oficina) => {
        setModalContent(
            <div>
                <h3>Gestionar Empleados - {oficina.nombre}</h3>
                <div className="empleados-list">
                    {empleados.map(empleado => (
                        <div key={empleado.idUsuario} className="empleado-item">
                            <span>{empleado.nombre} {empleado.apellido}</span>
                            {oficina.empleados?.includes(empleado.idUsuario) ? (
                                <button 
                                    className="btn btn-danger btn-sm"
                                    onClick={() => handleQuitarEmpleado(oficina.idOficina, empleado.idUsuario)}
                                >
                                    Quitar
                                </button>
                            ) : (
                                <button 
                                    className="btn btn-primary btn-sm"
                                    onClick={() => handleAsignarEmpleado(oficina.idOficina, empleado.idUsuario)}
                                >
                                    Asignar
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        );
        setShowModal(true);
    };

    const handleEliminarEmpleado = async (idEmpleado) => {
        if (!window.confirm('¿Está seguro que desea eliminar este empleado?')) {
            return;
        }

        try {
            const token = sessionStorage.getItem('token');
            await axios.delete(
                `http://localhost:3001/api/v1/administradores/empleados/${idEmpleado}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setEmpleados(empleados.filter(emp => emp.id_empleado !== idEmpleado));
            alert('Empleado eliminado exitosamente');
        } catch (error) {
            console.error('Error al eliminar empleado:', error);
            alert(error.response?.data?.mensaje || 'Error al eliminar empleado');
        }
    };

    const handleEliminarOficina = async (idOficina) => {
        if (!window.confirm('¿Está seguro que desea eliminar esta oficina?')) {
            return;
        }

        try {
            const token = sessionStorage.getItem('token');
            await axios.delete(
                `http://localhost:3001/api/v1/administradores/oficinas/${idOficina}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setOficinas(oficinas.filter(ofi => ofi.idOficina !== idOficina));
            alert('Oficina eliminada exitosamente');
        } catch (error) {
            console.error('Error al eliminar oficina:', error);
            alert(error.response?.data?.mensaje || 'Error al eliminar oficina');
        }
    };

    const handleCrearEmpleado = async (e) => {
        e.preventDefault();
        try {
            const token = sessionStorage.getItem('token');
            await axios.post(
                'http://localhost:3001/api/v1/administradores/empleados/crear',
                nuevoEmpleado,
                { headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}` 
                }}
            );
            fetchData();
            setNuevoEmpleado({
                nombre: '',
                apellido: '',
                correoElectronico: '',
                contrasenia: '',
                idOficina: ''
            });
            alert('Empleado creado exitosamente');
        } catch (error) {
            console.error('Error al crear empleado:', error);
            alert(error.response?.data?.mensaje || 'Error al crear empleado');
        }
    };

    const handleCrearOficina = async (e) => {
        e.preventDefault();
        try {
            const token = sessionStorage.getItem('token');
            await axios.post(
                'http://localhost:3001/api/v1/administradores/oficinas/crear',
                nuevaOficina,
                { headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}` 
                }}
            );
            fetchData();
            setNuevaOficina({ nombre: '', idReclamoTipo: '' });
            alert('Oficina creada exitosamente');
        } catch (error) {
            console.error('Error al crear oficina:', error);
            alert(error.response?.data?.mensaje || 'Error al crear oficina');
        }
    };

    const handleAsignarEmpleado = async (idOficina, idUsuario) => {
        try {
            const token = sessionStorage.getItem('token');
            await axios.post(
                `http://localhost:3001/api/v1/administradores/oficinas/${idOficina}/empleados`,
                { idUsuario },
                { headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}` 
                }}
            );
            fetchData();
            alert('Empleado asignado exitosamente');
        } catch (error) {
            console.error('Error al asignar empleado:', error);
            alert(error.response?.data?.mensaje || 'Error al asignar empleado');
        }
    };

    const handleQuitarEmpleado = async (idOficina, idUsuario) => {
        try {
            const token = sessionStorage.getItem('token');
            await axios.delete(
                `http://localhost:3001/api/v1/administradores/oficinas/${idOficina}/empleados/${idUsuario}`,
                { headers: { Authorization: `Bearer ${token}` }}
            );
            fetchData();
            alert('Empleado removido exitosamente');
        } catch (error) {
            console.error('Error al quitar empleado:', error);
            alert(error.response?.data?.mensaje || 'Error al quitar empleado');
        }
    };

    const handleActualizarEmpleado = async (empleado) => {
        try {
            const token = sessionStorage.getItem('token');
            await axios.put(
                `http://localhost:3001/api/v1/administradores/empleados/${empleado.idUsuario}`,
                empleado,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            fetchData();
            setShowModal(false);
            alert('Empleado actualizado exitosamente');
        } catch (error) {
            console.error('Error al actualizar empleado:', error);
            alert(error.response?.data?.mensaje || 'Error al actualizar empleado');
        }
    };

    const handleActualizarOficina = async (oficina) => {
        try {
            const token = sessionStorage.getItem('token');
            await axios.put(
                `http://localhost:3001/api/v1/administradores/oficinas/${oficina.idOficina}`,
                oficina,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            fetchData();
            setShowModal(false);
            alert('Oficina actualizada exitosamente');
        } catch (error) {
            console.error('Error al actualizar oficina:', error);
            alert(error.response?.data?.mensaje || 'Error al actualizar oficina');
        }
    };

    const handleEditarOficina = (oficina) => {
        setModalContent(
            <div>
                <h3>Editar Oficina</h3>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    handleActualizarOficina(oficina);
                }}>
                    <div className="form-group">
                        <label>Nombre</label>
                        <input
                            type="text"
                            className="form-control"
                            defaultValue={oficina.nombre}
                            onChange={(e) => oficina.nombre = e.target.value}
                        />
                    </div>
                    <div className="form-group">
                        <label>Tipo de Reclamo</label>
                        <select
                            className="form-control"
                            defaultValue={oficina.idReclamoTipo}
                            onChange={(e) => oficina.idReclamoTipo = e.target.value}
                        >
                            {tiposReclamos.map(tipo => (
                                <option key={tipo.idReclamoTipo} value={tipo.idReclamoTipo}>
                                    {tipo.descripcion}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary">
                        Guardar Cambios
                    </button>
                </form>
            </div>
        );
        setShowModal(true);
    };

    const renderModal = () => {
        if (!showModal) return null;

        return (
            <div className="modal-overlay">
                <div className="modal-content">
                    {modalContent}
                    <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                        Cerrar
                    </button>
                </div>
            </div>
        );
    };

    const handleNuevoEmpleado = () => {
        setModalContent(
            <div>
                <h3>Nuevo Empleado</h3>
                <form onSubmit={handleCrearEmpleado}>
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Nombre"
                            className="form-control"
                            name="nombre"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Apellido"
                            className="form-control"
                            name="apellido"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <input
                            type="email"
                            placeholder="Correo Electrónico"
                            className="form-control"
                            name="correoElectronico"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <select 
                            className="form-control"
                            name="idOficina"
                            required
                        >
                            <option value="">Seleccione una oficina</option>
                            {oficinas.map(oficina => (
                                <option key={oficina.idOficina} value={oficina.idOficina}>
                                    {oficina.nombre}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary">
                        Crear Empleado
                    </button>
                </form>
            </div>
        );
        setShowModal(true);
    };

    const handleNuevaOficina = () => {
        setModalContent(
            <div>
                <h3>Nueva Oficina</h3>
                <form onSubmit={handleCrearOficina}>
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Nombre de la Oficina"
                            className="form-control"
                            name="nombre"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <select 
                            className="form-control"
                            name="idReclamoTipo"
                            required
                        >
                            <option value="">Seleccione tipo de reclamo</option>
                            {tiposReclamos.map(tipo => (
                                <option key={tipo.idReclamoTipo} value={tipo.idReclamoTipo}>
                                    {tipo.descripcion}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary">
                        Crear Oficina
                    </button>
                </form>
            </div>
        );
        setShowModal(true);
    };

    const renderEmpleados = () => (
        <div className="section-container">
            <div className="section-header">
                <h2>Empleados</h2>
                <button className="btn btn-primary btn-center" onClick={handleNuevoEmpleado}>
                    <FaPlus /> Nuevo Empleado
                </button>
            </div>
            <table className="data-table">
                <thead>
                    <tr>
                        {/* <th>ID</th> */}
                        <th>Nombre</th>
                        <th>Apellido</th>
                        <th>Correo</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {empleados.map(empleado => (
                        <tr key={empleado.idUsuario}>
                            {/* <td>{empleado.idUsuario}</td> */}
                            <td>{empleado.nombre}</td>
                            <td>{empleado.apellido}</td>
                            <td>{empleado.correoElectronico}</td>
                            <td>
                                <div className="action-buttons">
                                    <button 
                                        className="btn btn-primary btn-sm"
                                        onClick={() => handleEditarEmpleado(empleado)} >
                                        <FaEdit className="icon" /> Editar
                                    </button>
                                    <button 
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleEliminarEmpleado(empleado.idUsuario)} >
                                        <FaTrash className="icon" /> Eliminar
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderOficinas = () => (
        <div className="section-container">
            <div className="section-header">
                <h2>Oficinas</h2>
                <button className="btn btn-primary btn-center" onClick={handleNuevaOficina}>
                    <FaPlus /> Nueva Oficina
                </button>
            </div>
            <table className="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Tipo de Reclamo</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {oficinas.map(oficina => (
                        <tr key={oficina.idOficina}>
                            <td>{oficina.idOficina}</td>
                            <td>{oficina.nombre}</td>
                            <td>
                                {tiposReclamos.find(t => t.idReclamoTipo === oficina.idReclamoTipo)?.descripcion}
                            </td>
                            <td>
                                <div className="action-buttons">
                                    <button 
                                        className="btn btn-primary btn-sm"
                                        onClick={() => handleEditarOficina(oficina)}
                                    >
                                        <FaEdit className="icon" /> Editar
                                    </button>
                                    <button 
                                        className="btn btn-info btn-sm"
                                        onClick={() => handleGestionarEmpleadosOficina(oficina)}
                                    >
                                        <FaBuilding className="icon" /> Gestionar
                                    </button>
                                    <button 
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleEliminarOficina(oficina.idOficina)}
                                    >
                                        <FaTrash className="icon" /> Eliminar
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderInformes = () => {
        const token = sessionStorage.getItem('token');
        
        if (!token) {
            return (
                <div className="alert alert-danger">
                    No hay token de autenticación
                    <button 
                        className="btn btn-link"
                        onClick={() => window.location.href = '/login'}
                    >
                        Iniciar sesión
                    </button>
                </div>
            );
        }

        return (
            <div className="informes-section">
                <div className="informe-card">
                    <FaFileDownload className="informe-icon" />
                    <h3>Informe PDF</h3>
                    <button 
                        className="btn btn-primary btn-center"
                        onClick={() => {
                            const url = `http://localhost:3001/api/v1/administradores/informes?token=${token}`;
                            window.location.href = url;
                        }}
                    >
                        Descargar PDF
                    </button>
                </div>
                <div className="informe-card">
                    <FaFileDownload className="informe-icon" />
                    <h3>Informe CSV</h3>
                    <button 
                        className="btn btn-primary btn-center"
                        onClick={() => {
                            const url = `http://localhost:3001/api/v1/administradores/informes?formato=csv&token=${token}`;
                            window.location.href = url;
                        }}
                    >
                        Descargar CSV
                    </button>
                </div>
            </div>
        );
    };

    const handleActualizarTipoReclamo = async (tipo) => {
        try {
            const token = sessionStorage.getItem('token');
            if (!tipo.idReclamoTipo) {
                throw new Error('ID de tipo de reclamo no válido');
            }
            
            await axios.patch(
                `http://localhost:3001/api/v1/administradores/tiposReclamos/actualizar/${tipo.idReclamoTipo}`,
                { descripcion: tipo.descripcion },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            fetchData();
            setShowModal(false);
            alert('Tipo de reclamo actualizado exitosamente');
        } catch (error) {
            console.error('Error al actualizar tipo de reclamo:', error);
            alert(error.response?.data?.mensaje || 'Error al actualizar tipo de reclamo');
        }
    };

    const handleEditarTipoReclamo = (tipo) => {
        setModalContent(
            <div>
                <h3>Editar Tipo de Reclamo</h3>
                <form onSubmit={(e) => {
                    e.preventDefault();
                    handleActualizarTipoReclamo(tipo);
                }}>
                    <div className="form-group">
                        <label>Descripción</label>
                        <input
                            type="text"
                            className="form-control"
                            defaultValue={tipo.descripcion}
                            onChange={(e) => tipo.descripcion = e.target.value}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary">
                        Guardar Cambios
                    </button>
                </form>
            </div>
        );
        setShowModal(true);
    };

    const handleNuevoTipoReclamo = () => {
        setModalContent(
            <div>
                <h3>Nuevo Tipo de Reclamo</h3>
                <form onSubmit={handleCrearTipoReclamo}>
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Descripción del tipo de reclamo"
                            className="form-control"
                            name="descripcion"
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary">
                        Crear Tipo de Reclamo
                    </button>
                </form>
            </div>
        );
        setShowModal(true);
    };

    const handleCrearTipoReclamo = async (e) => {
        e.preventDefault();
        try {
            const token = sessionStorage.getItem('token');
            await axios.post(
                'http://localhost:3001/api/v1/administradores/tiposReclamos/crear',
                { descripcion: e.target.descripcion.value },
                { 
                    headers: { 
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}` 
                    }
                }
            );
            fetchData();
            setShowModal(false);
            alert('Tipo de reclamo creado exitosamente');
        } catch (error) {
            console.error('Error al crear tipo de reclamo:', error);
            alert(error.response?.data?.mensaje || 'Error al crear tipo de reclamo');
        }
    };

    const handleEliminarTipoReclamo = async (idReclamoTipo) => {
        if (!window.confirm('¿Está seguro que desea eliminar este tipo de reclamo?')) {
            return;
        }

        try {
            const token = sessionStorage.getItem('token');
            await axios.delete(
                `http://localhost:3001/api/v1/administradores/tiposReclamos/eliminar/${idReclamoTipo}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            fetchData();
            alert('Tipo de reclamo eliminado exitosamente');
        } catch (error) {
            console.error('Error al eliminar tipo de reclamo:', error);
            alert(error.response?.data?.mensaje || 'Error al eliminar tipo de reclamo');
        }
    };

    const renderTiposReclamos = () => (
        <div className="section-container">
            <div className="section-header">
                <h2>Tipos de Reclamos</h2>
                <button className="btn btn-primary btn-center" onClick={handleNuevoTipoReclamo} >
                    <FaPlus /> Nuevo Tipo Reclamo
                </button>
            </div>
            <div className="table-responsive">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Descripción</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tiposReclamos.map(tipo => (
                            <tr key={tipo.idReclamoTipo}>
                                <td>{tipo.idReclamoTipo}</td>
                                <td>{tipo.descripcion}</td>
                                <td className="action-buttons">
                                    <button 
                                        className="btn btn-primary btn-sm"
                                        onClick={() => handleEditarTipoReclamo(tipo)}
                                        title="Editar"
                                    >
                                        <FaEdit />Editar
                                    </button>
                                    <button 
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleEliminarTipoReclamo(tipo.idReclamoTipo)}
                                        title="Eliminar"
                                    >
                                        <FaTrash />Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="admin-dashboard">
            <div className="admin-header">
                <h1>Panel de Administración</h1>
                
                <div className="admin-nav">
                    <button 
                        className={`nav-button ${activeSection === 'estadisticas' ? 'active' : ''}`}
                        onClick={() => setActiveSection('estadisticas')}
                    >
                        Estadísticas
                    </button>
                    <button 
                        className={`nav-button ${activeSection === 'informes' ? 'active' : ''}`}
                        onClick={() => setActiveSection('informes')}
                    >
                        Informes
                    </button>
                    <button 
                        className={`nav-button ${activeSection === 'tiposReclamos' ? 'active' : ''}`}
                        onClick={() => setActiveSection('tiposReclamos')}
                    >
                        Tipos de Reclamos
                    </button>
                    <button 
                        className={`nav-button ${activeSection === 'empleados' ? 'active' : ''}`}
                        onClick={() => setActiveSection('empleados')}
                    >
                        Empleados
                    </button>
                    <button 
                        className={`nav-button ${activeSection === 'oficinas' ? 'active' : ''}`}
                        onClick={() => setActiveSection('oficinas')}
                    >
                        Oficinas
                    </button>
                </div>
            </div>

            {error && (
                <div className="alert alert-danger">
                    {error}
                    {error.includes('Sesión expirada') && (
                        <button 
                            className="btn btn-link"
                            onClick={() => window.location.href = '/login'}
                        >
                            Iniciar sesión
                        </button>
                    )}
                </div>
            )}
            
            {cargando ? (
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Cargando...</p>
                </div>
            ) : (
                <div className="admin-content">
                    {activeSection === 'estadisticas' && renderEstadisticas()}
                    {activeSection === 'informes' && renderInformes()}
                    {activeSection === 'empleados' && renderEmpleados()}
                    {activeSection === 'oficinas' && renderOficinas()}
                    {activeSection === 'tiposReclamos' && renderTiposReclamos()}
                </div>
            )}
            {renderModal()}
        </div>
    );
};

export default AdminDashboard;
