const bd = require('../config/bd');
const bcrypt = require('bcrypt');
const saltRounds = 10;

exports.actualizarPerfil = async (idUsuario, datosActualizados) => {
    try {
        const { nombre, apellido, correoElectronico, contrasenia, imagen } = datosActualizados;
        let query = 'UPDATE usuarios SET nombre = ?, apellido = ?, correoElectronico = ?, imagen = ?';
        const params = [nombre, apellido, correoElectronico, imagen];
    
        if (contrasenia) {
            query += ', contrasenia = ?';
            params.push(contrasenia);
        }
    
        query += ' WHERE idUsuario = ?';
        params.push(idUsuario);

        await bd.query(query, params);
        return { mensaje: 'Perfil actualizado exitosamente' };
    } catch (error) {
        console.error('Error al actualizar perfil: ', error);
        throw new Error('Error al actualizar el perfil del usuario');
    }
};

exports.obtenerPerfil = async(idUsuario) => {
    try {
        const [rows] = await bd.query('SELECT idUsuario, nombre, apellido, correoElectronico, imagen, idUsuarioTipo FROM usuarios WHERE idUsuario = ?', [idUsuario]);
        return rows[0] || null;
    } catch (error) {
        console.error('Error al obtener el perfil: ', error);
        throw new Error('Error al obtener el perfil del usuario');
    }
};

exports.obtenerUsuarioPorId = async(idUsuario) => {
    try {
        const [rows] =await bd.query('SELECT * FROM usuarios WHERE idUsuario = ?', [idUsuario]);
        return rows[0] || null;
    } catch (errro) {
        console.error('Error al obtener usuario por ID: ', error);
        throw new Error('Error al obtener el usuario');
    }
};

exports.cambiarContrasenia = async (idUsuario, contraseniaActual, nuevaContrasenia) => {
    try {
        // Obtener el usuario
        const [usuario] = await bd.query('SELECT contrasenia FROM usuarios WHERE idUsuario = ?', [idUsuario]);
        
        if (usuario.length === 0) {
            return { exito: false, mensaje: 'Usuario no encontrado' };
        }

        // Verificar la contraseña actual
        const contraseniaValida = await bcrypt.compare(contraseniaActual, usuario[0].contrasenia);
        
        if (!contraseniaValida) {
            return { exito: false, mensaje: 'La contraseña actual es incorrecta' };
        }

        // Encriptar la nueva contraseña
        const hashedPassword = await bcrypt.hash(nuevaContrasenia, saltRounds);

        // Actualizar la contraseña
        await bd.query('UPDATE usuarios SET contrasenia = ? WHERE idUsuario = ?', [hashedPassword, idUsuario]);

        return { exito: true, mensaje: 'Contraseña actualizada exitosamente' };
    } catch (error) {
        console.error('Error al cambiar la contraseña: ', error);
        throw new Error('Error al cambiar la contraseña del usuario');
    }
};

exports.registrarUsuario = async(datosUsuario) => {
    const { nombre, apellido, correoElectronico, contrasenia, idUsuarioTipo, imagen } = datosUsuario;
    try {
        const hashedPassword = await bcrypt.hash(contrasenia, saltRounds);
        const [result] = await bd.query('INSERT INTO usuarios (nombre, apellido, correoElectronico, contrasenia, idUsuarioTipo, imagen) VALUES (?, ?, ?, ?, ?, ?)'
            [nombre, apellido, correoElectronico, hashedPassword, idUsuarioTipo, imagen]
        ); 
        return result.insertId;
    } catch (error) {
        console.error('Error al registrar usuario: ', error);
        throw new Error('Error al registrar el usuario');
    }
};

exports.verificarCredenciales = async(correoElectronico, contrasenia) => {
    try {
        const [rows] = await bd.query('SELECT * FROM usuarios WHERE correoElectronico = ?', [correoElectronico]);
        if (rows.length === 0) {
            return null;
        }
        const usuario = rows[0];
        const match = await bcrypt.compare(contrasenia, usuario.contrasenia);
        return match ? usuario: null;
    } catch (error) {
        console.error('Error al verificar credenciales: ', error);
        throw new Error('Error al verificar las credenciales del usuario');
    }
};
