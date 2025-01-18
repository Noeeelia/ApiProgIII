import React, { useState, useEffect } from "react";
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import '../assets/css/EmpleadoDashboard.css';

const EmpleadoDashboard = () => {
    const { user } = useAuth();
    const [reclamos, setReclamos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = sessionStorage.getItem('token');
                if (!token) {
                    setError('Token no encontrado');
                    setLoading(false);
                    return;
                }

                const config = {
                    headers: { Authorization: `Bearer ${token}` }
                };

                const reclamosResponse = await axios.get(
                    'http://localhost:3001/api/v1/empleados/reclamos/listar',
                    config
                );
                setReclamos(reclamosResponse.data);
                setLoading(false);
            } catch (error) {
                setError('Error al cargar los reclamos');
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    const handleAtenderReclamo = async (idReclamo) => {
        try {
            const token = sessionStorage.getItem('token');
            await axios.patch(
                `http://localhost:3001/api/v1/empleados/reclamos/atender/${idReclamo}`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setReclamos(reclamos.map(reclamo => 
                reclamo.idReclamo === idReclamo ? { ...reclamo, estado: "En proceso" } : reclamo
            ));
        } catch (error) {
            alert('Error al atender el reclamo');
        }
    };

    const handleFinalizarReclamo = async (idReclamo) => {
        try {
            const token = sessionStorage.getItem('token');
            await axios.patch(
                `http://localhost:3001/api/v1/empleados/reclamos/finalizar/${idReclamo}`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            setReclamos(reclamos.map(reclamo => 
                reclamo.idReclamo === idReclamo ? { ...reclamo, estado: "Finalizado" } : reclamo
            ));
        } catch (error) {
            alert('Error al finalizar el reclamo');
        }
    };

    if (loading) return <div>Cargando...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div className="empleado-dashboard">
            <h1>Dashboard del Empleado</h1>
            <div className="reclamos-container">
                <h3>Reclamos Asignados</h3>
                {reclamos.length > 0 ? (
                    <table className="reclamos-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Asunto</th>
                                <th>Descripción</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reclamos.map(reclamo => (
                                <tr key={reclamo.idReclamo}>
                                    <td>{reclamo.idReclamo}</td>
                                    <td>{reclamo.asunto}</td>
                                    <td>{reclamo.descripcion}</td>
                                    <td>{reclamo.estado}</td>
                                    <td>
                                        {reclamo.estado === "Creado" && (
                                            <button 
                                                className="btn btn-primary" 
                                                onClick={() => handleAtenderReclamo(reclamo.idReclamo)}
                                            >
                                                Atender
                                            </button>
                                        )}
                                        {reclamo.estado === "En proceso" && (
                                            <button 
                                                className="btn btn-success" 
                                                onClick={() => handleFinalizarReclamo(reclamo.idReclamo)}
                                            >
                                                Finalizar
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div>No hay reclamos asignados en este momento</div>
                )}
            </div>
        </div>
    );
};

export default EmpleadoDashboard;
