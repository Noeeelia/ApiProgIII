const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bd = require('../config/bd');
const { validationResult} = require('express-validator');
const authService = require('../services/authService');
const nodemailer = require('nodemailer');

const saltRounds = 10;
const secretKey = process.env.JWT_SECRET;

const login = async (req, res) => {
    try {
        const { correoElectronico, contrasenia } = req.body;
        const usuario = await authService.verificarCredenciales(correoElectronico, contrasenia);

        if (usuario) {
            const token = jwt.sign({ 
            idUsuario: usuario.idUsuario,
            idUsuarioTipo: usuario.idUsuarioTipo,
            nombre: usuario.nombre },
            process.env.JWT_SECRET,
            { expiresIn: '1h'}
        );

        res.status(200).json({
            exito: true,
            mensaje: `Bienvenido/a ${usuario.nombre}`,
            token
        });

    } else {
        res.status(401).json({
            exito: false,
            mensaje: 'Credenciales inválidas' });
        }
    } catch (error) {
        console.error('Error al iniciar sesión', error);
        res.status(500).json({ 
            exito: false,
            message: 'Error interno del servidor' });
    }
};

const register = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { nombre, apellido, correoElectronico, contrasenia, idUsuarioTipo, imagen } = req.body;

    try {
        const [userExists] = await bd.query('SELECT correoElectronico FROM usuarios WHERE correoElectronico = ?', [correoElectronico]);
        if (userExists.length > 0) {
            return res.status(400).json({ message: 'El correo electronico ya está registrado' });
        }

        const hashedPassword = await bcrypt.hash(contrasenia, saltRounds);

        const [result] = await bd.query(
            'INSERT INTO usuarios (nombre, apellido, correoElectronico, contrasenia, idUsuarioTipo, imagen) VALUES (?, ?, ?, ?, ?, ?)',
            [nombre, apellido, correoElectronico, hashedPassword, idUsuarioTipo, imagen]
        );
        
        res.status(201).json({ message: 'Usuario registrado exitosamente', idUsuario: result.insertId });
    } catch (error) {
        console.error('Error al registrar usuario', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

const logout = (req, res) => {
    res.status(200).json({ message: 'Sesión cerrada exitosamente' });
};

const actualizarPerfil = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array()})
    }

    try {
        const idUsuario = req.user.idUsuario;
        const { nombre, apellido, correoElectronico, contrasenia, imagen} = req.body;

        const datosActualizados = { 
            nombre, 
            apellido, 
            correoElectronico,  
            imagen
        };
        
        if (contrasenia) {
            const hashedPassword = await bcrypt.hash(contrasenia, saltRounds);
            datosActualizados.contrasenia = hashedPassword;
        }

        const resultado = await authService.actualizarPerfil(idUsuario, datosActualizados);
        res.status(200).json({ 
            exito: true,
            message: 'Perfil actualizado exitosamente' 
        });
    } catch (error) {
        console.error('Error al actualizar el perfil', error);
        res.status(500).json({ 
            exito: false,
            message: 'Error interno del servidor' });
    }
};

const obtenerPerfil = async (req, res) => {
    try {
        const idUsuario = req.user.idUsuario;
        const perfil = await authService.obtenerPerfil(idUsuario);

        if (perfil) {
            res.json({ 
                exito: true,
                mensaje: `Bienvenido/a ${perfil.nombre}`,
                perfil: perfil
            });
        } else {
            res.status(404).json({ 
                exito: false,
                message: 'Perfil no encontrado' });
        }
    } catch (error) {
        console.error('Error al obtener el perfil', error);
        res.status(500).json({ 
            exito: false,
            message: 'Error interno del servidor' });
    }
};

const cambiarContrasenia = async (req, res) => {
    try {
        const idUsuario = req.user.idUsuario;
        const { contraseniaActual, nuevaContrasenia } = req.body;

        const resultado = await authService.cambiarContrasenia(idUsuario, contraseniaActual, nuevaContrasenia);
        
        if (resultado.exito) {
            res.status(200).json({ 
                exito: true,
                message: 'Contraseña actualizada exitosamente' 
            });
        } else {
            res.status(400).json({ 
                exito: false,
                message: resultado.mensaje 
            });
        }
    } catch (error) {
        console.error('Error al cambiar la contraseña', error);
        res.status(500).json({ 
            exito: false,
            message: 'Error interno del servidor' 
        });
    }
};


// Configura el transporter de nodemailer
const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.CORREO, // Desde las variables de entorno
        pass: process.env.CLAVE
    },
    tls: {
        rejectUnauthorized: false
    }   
});

const solicitarRestablecimientoContrasenia = async (req, res) => {
    const { correoElectronico } = req.body;
    try {
        // Verifica si el correo existe en la base de datos
        const [rows] = await bd.query('SELECT * FROM usuarios WHERE correoElectronico = ?', [correoElectronico]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Correo no encontrado' });
        }

        const usuario = rows[0];

        // Generar token de restablecimiento (puede ser JWT o un token simple)
        const resetToken = jwt.sign({ idUsuario: usuario.idUsuario }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Enviar correo de restablecimiento
        const mailOptions = {
            from: process.env.CORREO,
            to: correoElectronico,
            subject: 'Restablecimiento de contraseña',
            text: `Hola ${usuario.nombre}, haz solicitado restablecer tu contraseña. Usa este token para continuar: ${resetToken}`
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ mensaje: 'Correo de restablecimiento enviado' });
    } catch (error) {
        console.error('Error al solicitar restablecimiento de contraseña:', error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
};


const restablecerContrasenia = async (req, res) => {
    const { token, nuevaContrasenia } = req.body;

    try {
        // Verifica y decodifica el token JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Obtiene el ID del usuario desde el token
        const { idUsuario } = decoded;

        // Hashea la nueva contraseña
        const hashedPassword = await bcrypt.hash(nuevaContrasenia, saltRounds);

        // Actualiza la contraseña del usuario en la base de datos
        await bd.query('UPDATE usuarios SET contrasenia = ? WHERE idUsuario = ?', [hashedPassword, idUsuario]);

        res.status(200).json({ message: 'Contraseña restablecida exitosamente' });
    } catch (error) {
        console.error('Error al restablecer la contraseña:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};



module.exports = {
    login,
    register,
    logout,
    actualizarPerfil,
    obtenerPerfil,
    cambiarContrasenia,
    solicitarRestablecimientoContrasenia,
    restablecerContrasenia
};
