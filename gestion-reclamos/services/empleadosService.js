const bd = require('../config/bd');
const { enviarNotificacion } = require('./notificacionesService');

//Servicio para actualizar el estado del reclamo
exports.atenderReclamo = async (idReclamo, idEmpleado, nuevoEstado) => {
    const connection = await bd.getConnection();
    try {
        await connection.beginTransaction();

        // Verificar que el empleado pertenece a la oficina correcta para este reclamo
        const [permiso] = await connection.query(
            `SELECT 1
            FROM usuariosOficinas uo
            JOIN oficinas o ON uo.idOficina = o.idOficina
            JOIN reclamos r ON r.idReclamoTipo = o.idReclamoTipo
            WHERE uo.idUsuario = ? AND r.idReclamo = ?`,
            [idEmpleado, idReclamo]
        );

        if (permiso.length === 0) {
            await connection.rollback();
            return { 
                exito: false,
                mensaje: 'No tienes permisos para atender este reclamo'
            };
        }

        // Obtenemos el id del estado del reclamo
        const [estado] = await connection.query(
            'SELECT idReclamoEstado FROM reclamosEstado WHERE descripcion = ?',
            [nuevoEstado]
        );

        if (estado.length === 0) {
            await connection.rollback();
            return { exito: false, mensaje: 'Estado inválido' };
        }
    
        // Actualizar el estado del reclamo
        const [resultado] = await connection.query(
            `UPDATE reclamos 
            SET idReclamoEstado = ?
            WHERE idReclamo = ?`,
            [estado[0].idReclamoEstado, idReclamo]
        );

        if (resultado.affectedRows === 0) {
            await connection.rollback();
            return { exito: false, mensaje: 'No se pudo actualizar el reclamo' };
        }

        // Obtener información del cliente
        const [cliente] = await connection.query(
            `SELECT u.nombre, u.correoElectronico
            FROM reclamos r
            JOIN usuarios u ON r.idUsuarioCreador = u.idUsuario
            WHERE r.idReclamo = ?`,
            [idReclamo]
        );

        await connection.commit();

        // Enviar notificación
        const datos = {
            nombre: cliente[0].nombre,
            idReclamo: idReclamo,
            estadoReclamo: nuevoEstado,
            enProceso: nuevoEstado === 'En proceso',
            fechaActualizacion: new Date().toLocaleString()
        };

        await enviarNotificacion(cliente[0].correoElectronico, datos, 'Cambio de estado');

        return { exito: true, mensaje: 'Reclamo atendido exitosamente y notificación enviada' };
    } catch (error) {
        await connection.rollback();
        console.error('Error al atender el reclamo', error);
        return { exito: false, mensaje: error.message || 'Error interno del servidor' };
    } finally {
        connection.release();
    }
};

//Servicio para finalizar el reclamo
exports.finalizarReclamo = async (idReclamo, idEmpleado) => {
    const connection = await bd.getConnection();
    try {
        await connection.beginTransaction();

        // Verificar que el empleado pertenece a la oficina correcta para este reclamo
        const [permiso] = await connection.query(
            `SELECT 1
            FROM usuariosOficinas uo
            JOIN oficinas o ON uo.idOficina = o.idOficina
            JOIN reclamos r ON r.idReclamoTipo = o.idReclamoTipo
            WHERE uo.idUsuario = ? AND r.idReclamo = ?`,
            [idEmpleado, idReclamo]
        );

        if (permiso.length === 0) {
            await connection.rollback();
            return { 
                exito: false,
                mensaje: 'No tienes permisos para finalizar este reclamo'
            };
        }

        // Obtener el ID del estado 'Finalizado'
        const [estadoFinalizado] = await connection.query(
            'SELECT idReclamoEstado FROM reclamosEstado WHERE descripcion = ?',
            ['Finalizado']
        );

        if (estadoFinalizado.length === 0) {
            await connection.rollback();
            return { exito: false, mensaje: 'Estado Finalizado no encontrado' };
        }

        // Actualizar el estado del reclamo a Finalizado
        const [resultado] = await connection.query(
            `UPDATE reclamos 
            SET idReclamoEstado = ?
            WHERE idReclamo = ?`,
            [estadoFinalizado[0].idReclamoEstado, idReclamo]
        );

        if (resultado.affectedRows === 0) {
            await connection.rollback();
            return { exito: false, mensaje: 'No se pudo finalizar el reclamo' };
        }

        // Obtener información del cliente
        const [cliente] = await connection.query(
            `SELECT u.nombre, u.correoElectronico
            FROM reclamos r
            JOIN usuarios u ON r.idUsuarioCreador = u.idUsuario
            WHERE r.idReclamo = ?`,
            [idReclamo]
        );

        await connection.commit();

        // Enviar notificación
        const datos = {
            nombre: cliente[0].nombre,
            idReclamo: idReclamo,
            estadoReclamo: 'Finalizado',
            finalizado: true,
            fechaFinalizado: new Date().toLocaleString()
        };

        await enviarNotificacion(cliente[0].correoElectronico, datos, 'Finalizado');

        return { exito: true, mensaje: 'Reclamo finalizado exitosamente y notificación enviada' };
    } catch (error) {
        await connection.rollback();
        console.error('Error al finalizar el reclamo', error);
        return { exito: false, mensaje: error.message || 'Error interno del servidor' };
    } finally {
        connection.release();
    }
};

//Servicio para listar los reclamos de la oficina del empleado
exports.listarReclamosOficina = async (idEmpleado) => {
    console.log('Listando reclamos para el empleado:', idEmpleado);
    const [reclamos] = await bd.query(
        `SELECT r.idReclamo, r.asunto, r.descripcion, r.fechaCreado, 
            e.descripcion AS estado, t.descripcion AS tipoReclamo,
            CONCAT(u.nombre, ' ', u.apellido) AS cliente
        FROM reclamos r
        JOIN reclamosEstado e ON r.idReclamoEstado = e.idReclamoEstado
        JOIN reclamosTipo t ON r.idReclamoTipo = t.idReclamoTipo
        JOIN usuarios u ON r.idUsuarioCreador = u.idUsuario
        JOIN oficinas o ON t.idReclamoTipo = o.idReclamoTipo
        JOIN usuariosOficinas uo ON o.idOficina = uo.idOficina
        WHERE uo.idUsuario = ?
        ORDER BY r.fechaCreado DESC`,            
        [idEmpleado]
    );
    console.log('Reclamos encontrados:', reclamos.length);
    return reclamos; 
};

// Añade esta función en empleadosService.js
exports.obtenerDatosClientePorReclamo = async (idReclamo) => {
    const [cliente] = await bd.query(
        `SELECT u.nombre, u.correoElectronico
        FROM reclamos r
        JOIN usuarios u ON r.idUsuarioCreador = u.idUsuario
        WHERE r.idReclamo = ?`,
        [idReclamo]
    );
    return cliente[0];
};

exports.obtenerOficinaEmpleado = async (idEmpleado) => {
    const [oficina] = await bd.query(
        `SELECT o.* FROM oficinas o
         JOIN usuariosoficinas uo ON o.idOficina = uo.idOficina
         WHERE uo.idUsuario = ?`,
        [idEmpleado]
    );
    return oficina[0];
};

exports.verificarAsignacionEmpleado = async (idEmpleado) => {
    const [asignacion] = await bd.query(
        `SELECT o.idOficina, o.nombre AS nombreOficina, t.descripcion AS tipoReclamo
         FROM usuariosOficinas uo
         JOIN oficinas o ON uo.idOficina = o.idOficina
         JOIN reclamosTipo t ON o.idReclamoTipo = t.idReclamoTipo
         WHERE uo.idUsuario = ?`,
        [idEmpleado]
    );
    console.log('Asignación del empleado:', asignacion[0]);
    return asignacion[0];
};
