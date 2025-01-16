const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { verifyToken } = require('../config/jwtMiddleware');
const authController = require('../controllers/authController');
const upload = require('../middlewares/uploadMiddleware');
const swagger = require('../config/swagger');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: API para autenticación de usuarios
 */

//Ruta para iniciar sesión
router.post('/login', authController.login);

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: API para autenticación de usuarios
 */

//Ruta para registrar usuarios
router.post('/register', [
    //Validaciones
    body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
    body('apellido').notEmpty().withMessage('El apellido es obligatorio'),
    body('correoElectronico').isEmail().withMessage('Debe ser un correo electrónico válido'),
    body('contrasenia').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('idUsuarioTipo').notEmpty().withMessage('El tipo de usuario es obligatorio'),
    body('imagen').optional().isString().withMessage('La imagen debe ser una cadena de texto')
], authController.register);

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: API para autenticación de usuarios
 */

//Ruta para cerrar sesión
router.post('/logout', verifyToken, authController.logout);

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: API para autenticación de usuarios
 */

//Método para actualizar los datos del perfil
router.patch('/actualizarPerfil', verifyToken, 
    upload.single('imagen'), 
    [
        body('nombre').optional().notEmpty().withMessage('El nombre no puede estar vacío'),
        body('apellido').optional().notEmpty().withMessage('El apellido no puede estar vacío'),
        body('correoElectronico').optional().isEmail().withMessage('Debe ser un correo válido'),
        body('contrasenia').optional().isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
        body('imagen').optional().isString().withMessage('La imagen debe ser una cadena de texto')
    ], 
    authController.actualizarPerfil);

router.post('/cambiarContrasenia', verifyToken, [
    body('contraseniaActual').notEmpty().withMessage('La contraseña actual es obligatoria'),
    body('nuevaContrasenia').isLength({ min: 6 }).withMessage('La nueva contraseña debe tener al menos 6 caracteres')
], authController.cambiarContrasenia);

//Ruta protegida para el perfil de usuario
router.get('/perfil', verifyToken, authController.obtenerPerfil);
router.patch('/actualizarPerfil', verifyToken, authController.actualizarPerfil);

// Ruta para solicitar restablecimiento de contraseña
router.post('/solicitarRestablecimiento', authController.solicitarRestablecimientoContrasenia);

// Ruta para restablecer la contraseña
router.post('/restablecerContrasenia', authController.restablecerContrasenia);

module.exports = router;
