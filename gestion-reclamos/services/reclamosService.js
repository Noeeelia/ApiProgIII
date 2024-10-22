const bd = require('../config/bd');

exports.crearReclamo = async (reclamo) => {
    const connection = await bd.getConnection();
    try {
        await connection.beginTransaction();
        const { asunto, descripcion, idReclamoTipo, idReclamoEstado, idUsuarioCreador } = reclamo;
        // console.log('Insertando reclamo...', reclamo);
        const [resultado] = await connection.query(
            'INSERT INTO reclamos (asunto, descripcion, idReclamoTipo, idReclamoEstado, idUsuarioCreador, fechaCreado) VALUES (?, ?, ?, ?, ?, NOW())', 
            [asunto, descripcion, idReclamoTipo, idReclamoEstado, idUsuarioCreador]
        );
        await connection.commit();
        console.log('Reclamo insertado con éxito:', resultado.insertId);
        return resultado.insertId;
    } catch (error) {
        await connection.rollback();
        console.error('Error al crear el reclamo:', error);
        throw new Error('Error al crear el reclamo');
    } finally {
        connection.release();
    }
};

exports.listarReclamosUsuario = async (idUsuario) => {
    try {
        const [reclamos] = await bd.query(
            'SELECT r.*, e.descripcion AS estado FROM reclamos r JOIN reclamosestado e ON r.idReclamoEstado= e.idReclamoEstado WHERE r.idUsuarioCreador = ?', 
            [idUsuario]
        );
        return reclamos;
    } catch (error) {
        console.error('Error al listar los reclamos:', error);
        throw new Error('Error al listar los reclamos');
    }
};  

exports.consultarEstadoReclamo = async (idReclamo, idUsuario) => {
    try {
        const [estado] = await bd.query(
            'SELECT r.*, e.descripcion AS estado FROM reclamos r JOIN reclamosestado e ON r.idReclamoEstado= e.idReclamoEstado WHERE r.idReclamo = ? AND r.idUsuarioCreador = ?', 
            [idReclamo, idUsuario]
        );
        return estado[0];
    } catch (error) {
        console.error('Error al consultar el estado del reclamo:', error);
        throw new Error('Error al consultar el estado del reclamo');
    }
};

exports.cancelarReclamo = async (idReclamo, idUsuario) => {
    const connection = await bd.getConnection();
    try {
        await connection.beginTransaction();
        const [reclamo] = await connection.query(
            'SELECT idReclamoEstado FROM reclamos WHERE idReclamo = ? AND idUsuarioCreador = ?', 
            [idReclamo, idUsuario]
        );
        if (reclamo.length === 0) {
            throw new Error('El reclamo no encontrado o no pertenece al usuario');
        }
        if (reclamo[0].idReclamoEstado !== 1) {
            throw new Error('Solo se pueden cancelar reclamos en estado "Creado"');
        }

        //Actualiza el estado del reclamo a cancelado
        await connection.query(
            'UPDATE reclamos SET idReclamoEstado = 5, fechaCancelado = NOW() WHERE idReclamo = ?', 
            [idReclamo]
        );

        await connection.commit();
        return {
            exito: true,
            mensaje: 'Reclamo cancelado exitosamente'
        };
    } catch (error) {
        await connection.rollback();
        console.error('Error al cancelar el reclamo:', error);
        throw error;
    } finally {
        connection.release();
    }
};

exports.obtenerDatosClientePorId = async (idUsuario) => {
    try {
        const [cliente] = await bd.query(
            'SELECT nombre, correoElectronico FROM usuarios WHERE idUsuario = ?', 
            [idUsuario]
        );
        return cliente[0];
    } catch (error) {
        console.error('Error al obtener los datos del cliente:', error);
        throw new Error('Error al obtener los datos del cliente');
    }
};

exports.obtenerReclamoPorId = async (idReclamo) => {
    try {
        const [reclamo] = await bd.query(
            `SELECT r.*, e.descripcion AS estado 
            FROM reclamos r 
            JOIN reclamosestado e ON r.idReclamoEstado = e.idReclamoEstado 
            WHERE r.idReclamo = ?`, 
            [idReclamo]
        );
        console.log('Reclamo obtenido:', reclamo[0]);
        return reclamo[0];
    } catch (error) {
        console.error('Error al obtener el reclamo:', error);
        throw new Error('Error al obtener el reclamo');
    }
};





