const bd = require('../config/bd');
const bcrypt = require('bcrypt');
const PDFDocument = require('pdfkit');
const { Parser } = require('json2csv');

//Tipos de reclamo
exports.crearTipoReclamo = async (descripcion) => {
    const [resultado] = await bd.query('INSERT INTO reclamosTipo(descripcion, activo) VALUES (?, 1)', [descripcion]);
    return { id: resultado.insertId, descripcion, activo: 1 };
};

exports.obtenerTiposReclamo = async () => {
    const [tipos] = await bd.query('SELECT idReclamoTipo, descripcion, activo FROM reclamosTipo');
    return tipos;
};

exports.actualizarTipoReclamo = async (id, descripcion) => {
    const [resultado] = await bd.query('UPDATE reclamosTipo SET descripcion = ? WHERE idReclamoTipo = ?', [descripcion, id]);
        if (resultado.affectedRows > 0) {
            return{ id, descripcion };
        }
        return null;
};

exports.eliminarTipoReclamo = async (id) => {
    const [resultado] = await bd.query('DELETE FROM reclamosTipo WHERE idReclamoTipo = ?', [id]);
        return resultado.affectedRows > 0;
};

//Gestión de empleados
exports.crearEmpleado = async ({ nombre, apellido, correoElectronico, contrasenia, idOficina }) => {
    const connection = await bd.getConnection();
    try {
        await connection.beginTransaction();

        const hashedPassword = await bcrypt.hash(contrasenia, 10);
        const [resultado] = await connection.query('INSERT INTO usuarios (nombre, apellido, correoElectronico, contrasenia, idUsuarioTipo) VALUES (?, ?, ?, ?, 2)',
            [nombre, apellido, correoElectronico, hashedPassword]
        );
        await connection.query('INSERT INTO usuariosoficinas (idUsuario, idOficina) VALUES (?, ?)', 
            [resultado.insertId, idOficina]);
        
        await connection.commit();
        return { id: resultado.insertId, nombre, apellido, correoElectronico, idOficina };
    } catch (error) {
        await connection.rollback();
        console.error('Error al crear empleado:', error);
        throw error;
    } finally {
        connection.release();
    }
};

exports.obtenerEmpleados = async (req, res) => {
    const [empleados] = await bd.query(`SELECT u.idUsuario, u.nombre, u.apellido, u.correoElectronico, uo.idOficina
        FROM usuarios u
        JOIN usuariosoficinas uo ON u.idUsuario = uo.idUsuario
        WHERE u.idUsuarioTipo = 2`
    );
    return empleados;
};

exports.actualizarEmpleado = async (id, { nombre, apellido, correoElectronico, idOficina }) => {
    const connection = await bd.getConnection();
    try {
        await connection.beginTransaction();

        // Construir la consulta dinámicamente
        let query = 'UPDATE usuarios SET ';
        const updateFields = [];
        const values = [];

        if (nombre !== undefined) {
            updateFields.push('nombre = ?');
            values.push(nombre);
        }
        if (apellido !== undefined) {
            updateFields.push('apellido = ?');
            values.push(apellido);
        }
        if (correoElectronico !== undefined) {
            updateFields.push('correoElectronico = ?');
            values.push(correoElectronico);
        }

        query += updateFields.join(', ') + ' WHERE idUsuario = ?';
        values.push(id);

        await connection.query(query, values);

        if (idOficina !== undefined) {
            await connection.query('UPDATE usuariosoficinas SET idOficina = ? WHERE idUsuario = ?', [idOficina, id]);
        }

        await connection.commit();

        // Obtener el empleado actualizado
        const [empleadoActualizado] = await connection.query(
            'SELECT u.idUsuario, u.nombre, u.apellido, u.correoElectronico, uo.idOficina FROM usuarios u JOIN usuariosoficinas uo ON u.idUsuario = uo.idUsuario WHERE u.idUsuario = ?',
            [id]
        );

        return empleadoActualizado[0];
    } catch (error) {
        await connection.rollback();
        console.error('Error al actualizar empleado:', error);
        throw error;
    } finally {
        connection.release();
    }
};

exports.eliminarEmpleado = async (id) => {
    const connection = await bd.getConnection();
    try {
        await connection.beginTransaction();

        // Primero, verificar si el empleado existe
        const [empleado] = await connection.query('SELECT * FROM usuarios WHERE idUsuario = ? AND idUsuarioTipo = 2', [id]);
        
        if (empleado.length === 0) {
            await connection.rollback();
            return { exito: false, mensaje: 'Empleado no encontrado' };
        }

        // Eliminar la relación en usuariosoficinas
        await connection.query('DELETE FROM usuariosoficinas WHERE idUsuario = ?', [id]);

        // Eliminar el usuario
        const [resultado] = await connection.query('DELETE FROM usuarios WHERE idUsuario = ?', [id]);

        await connection.commit();
        return { exito: true, mensaje: 'Empleado eliminado exitosamente' };
    } catch (error) {
        await connection.rollback();
        console.error('Error al eliminar empleado:', error);
        throw error;
    } finally {
        connection.release();
    }
};

//Gestión de oficinas
exports.crearOficina = async (nombre, idReclamoTipo) => {
    const [resultado] = await bd.query(
        'INSERT INTO oficinas (nombre, idReclamoTipo) VALUES (?, ?)',
        [nombre, idReclamoTipo]
    );
    return { id: resultado.insertId, nombre, idReclamoTipo };
};

exports.obtenerOficinas = async () => {
    const [oficinas] = await bd.query('SELECT * FROM oficinas');
    return oficinas;
};

exports.actualizarOficina = async (id, { nombre, idReclamoTipo }) => {
    const connection = await bd.getConnection();
    try {
        await connection.beginTransaction();

        let query = 'UPDATE oficinas SET ';
        const updateFields = [];
        const values = [];

        if (nombre !== undefined) {
            updateFields.push('nombre = ?');
            values.push(nombre);
        }
        if (idReclamoTipo !== undefined) {
            updateFields.push('idReclamoTipo = ?');
            values.push(idReclamoTipo);
        }

        if (updateFields.length === 0) {
            await connection.rollback();
            return { exito: false, mensaje: 'No se proporcionaron campos para actualizar' };
        }

        query += updateFields.join(', ') + ' WHERE idOficina = ?';
        values.push(id);

        const [resultado] = await connection.query(query, values);

        if (resultado.affectedRows === 0) {
            await connection.rollback();
            return { exito: false, mensaje: 'Oficina no encontrada' };
        }

        await connection.commit();

        // Obtener la oficina actualizada
        const [oficinaActualizada] = await connection.query('SELECT * FROM oficinas WHERE idOficina = ?', [id]);
        return { exito: true, mensaje: 'Oficina actualizada exitosamente', datos: oficinaActualizada[0] };
    } catch (error) {
        await connection.rollback();
        console.error('Error al actualizar oficina:', error);
        throw error;
    } finally {
        connection.release();
    }
};

exports.eliminarOficina = async (id) => {
    const [resultado] = await bd.query('DELETE FROM oficinas WHERE idOficina = ?', [id]);
    return resultado.affectedRows > 0;
};


//Gestión de empleados de oficinas
exports.agregarEmpleadoAOficina = async (idOficina, idEmpleado) => {
    const connection = await bd.getConnection();
    try {
        await connection.beginTransaction();
        
        // Verificar que la oficina y el empleado existan
        const [oficina] = await connection.query('SELECT idReclamoTipo FROM oficinas WHERE idOficina = ?', [idOficina]);
        const [empleado] = await connection.query('SELECT idUsuario FROM usuarios WHERE idUsuario = ? AND idUsuarioTipo = 2', [idEmpleado]);
        
        if (oficina.length === 0 || empleado.length === 0) {
            throw new Error('Oficina o empleado no encontrado');
        }
        
        // Verificar que el empleado no esté ya asignado a otra oficina
        const [asignacionExistente] = await connection.query('SELECT idOficina FROM usuariosOficinas WHERE idUsuario = ?', [idEmpleado]);
        
        if (asignacionExistente.length > 0) {
            throw new Error('El empleado ya está asignado a una oficina');
        }
        
        // Agregar el empleado a la oficina
        await connection.query(
            'INSERT INTO usuariosOficinas (idUsuario, idOficina) VALUES (?, ?)',
            [idEmpleado, idOficina]
        );
        
        await connection.commit();
        return { exito: true };
    } catch (error) {
        await connection.rollback();
        console.error('Error al agregar empleado a la oficina:', error);
        throw error;
    } finally {
        connection.release();
    }
};

exports.quitarEmpleadoDeOficina = async (idOficina, idEmpleado) => {
    const connection = await bd.getConnection();
    try {
        await connection.beginTransaction();
        
        const [resultado] = await connection.query(
            'DELETE FROM usuariosOficinas WHERE idUsuario = ? AND idOficina = ?',
            [idEmpleado, idOficina]
        );
        
        if (resultado.affectedRows === 0) {
            await connection.rollback();
            return { exito: false, mensaje: 'El empleado no pertenece a esta oficina' };
        }
        
        await connection.commit();
        return { exito: true };
    } catch (error) {
        await connection.rollback();
        console.error('Error al quitar empleado de la oficina:', error);
        throw error;
    } finally {
        connection.release();
    }
};


//Estadísticas e informes
exports.obtenerEstadisticas = async () => {
    const [estadisticas] = await bd.query('CALL ObtenerEstadisticasReclamos()');
    return estadisticas[0][0]; // El resultado está en la primera fila del primer conjunto de resultados
};

exports.generarInforme = async (formato) => {
    const [resultado] = await bd.query(
        `SELECT r.idReclamo, r.asunto, r.descripcion, r.fechaCreado, r.fechaFinalizado, e.descripcion as estado, t.descripcion as tipo,
        CONCAT(u.nombre, ' ', u.apellido) as cliente
        FROM reclamos r
        JOIN reclamosEstado e ON r.idReclamoEstado = e.idReclamoEstado
        JOIN reclamosTipo t ON r.idReclamoTipo = t.idReclamoTipo
        JOIN usuarios u ON r.idUsuarioCreador = u.idUsuario
        ORDER BY r.fechaCreado DESC`
    );

    if (formato === 'pdf') {
        return new Promise((resolve) => {
            const doc = new PDFDocument();
            doc.fontSize(18).text('Informe de Reclamos', { align: 'center' });
            doc.moveDown();
            resultado.forEach(reclamo => {
                doc.fontSize(14).text(`Reclamo #${reclamo.idReclamo}`);
                doc.fontSize(12).text(`Asunto: ${reclamo.asunto}`);
                doc.fontSize(12).text(`Estado: ${reclamo.estado}`);
                doc.fontSize(12).text(`Tipo: ${reclamo.tipo}`);
                doc.fontSize(12).text(`Cliente: ${reclamo.cliente}`);
                doc.fontSize(12).text(`Fecha de creación: ${reclamo.fechaCreado}`);
                if (reclamo.fechaFinalizado) {
                    doc.fontSize(12).text(`Fecha de finalización: ${reclamo.fechaFinalizado}`);
                }
                doc.moveDown();
            });
            doc.end();
            resolve(doc);
        });
    } else {
        const json2csvParser = new Parser();
        return json2csvParser.parse(resultado);
    }
};





