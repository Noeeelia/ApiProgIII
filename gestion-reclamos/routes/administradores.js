const express = require('express');
const router = express.Router();
const { verifyToken } = require('../config/jwtMiddleware');
const { verifyRole } = require('../services/roleService');
const administradoresController = require('../controllers/administradoresController');
const ROLES = require('../config/roles');

/**
 * @swagger
 * tags:
 *   name: Administradores
 *   description: API para gestionar tipos de reclamos, empleados y oficinas
 */

//Ruta protegida para gestionar tipos de reclamos
router.post('/tiposReclamos/crear', verifyToken, verifyRole([ROLES.ADMINISTRADOR]), administradoresController.crearTipoReclamo);
router.get('/tiposReclamos/listar', verifyToken, verifyRole([ROLES.ADMINISTRADOR]), administradoresController.obtenerTiposReclamo);
router.patch('/tiposReclamos/actualizar/:idReclamoTipo', verifyToken, verifyRole([ROLES.ADMINISTRADOR]), administradoresController.actualizarTipoReclamo);
router.delete('/tiposReclamos/eliminar/:idReclamoTipo', verifyToken, verifyRole([ROLES.ADMINISTRADOR]), administradoresController.eliminarTipoReclamo);

//Rutas protegidas para gestionar empleados...
router.post('/empleados/crear', verifyToken, verifyRole([ROLES.ADMINISTRADOR]), administradoresController.crearEmpleado);
router.get('/empleados/listar', verifyToken, verifyRole([ROLES.ADMINISTRADOR]), administradoresController.obtenerEmpleados);
router.patch('/empleados/actualizar/:id', verifyToken, verifyRole([ROLES.ADMINISTRADOR]), administradoresController.actualizarEmpleado);
router.delete('/empleados/eliminar/:id', verifyToken, verifyRole([ROLES.ADMINISTRADOR]), administradoresController.eliminarEmpleado);

//Rutas protegidas para gestionar oficinas
router.post('/oficinas/crear', verifyToken, verifyRole([ROLES.ADMINISTRADOR]), administradoresController.crearOficina);
router.get('/oficinas/listar', verifyToken, verifyRole([ROLES.ADMINISTRADOR]), administradoresController.obtenerOficinas);
router.patch('/oficinas/actualizar/:id', verifyToken, verifyRole([ROLES.ADMINISTRADOR]), administradoresController.actualizarOficina);
router.delete('/oficinas/eliminar/:id', verifyToken, verifyRole([ROLES.ADMINISTRADOR]), administradoresController.eliminarOficina);

//Rutas para gestionar empleados de oficinas
router.post('/oficinas/:idOficina/empleados', verifyToken, verifyRole([ROLES.ADMINISTRADOR]), administradoresController.agregarEmpleadoAOficina);
router.delete('/oficinas/:idOficina/empleados/:idEmpleado', verifyToken, verifyRole([ROLES.ADMINISTRADOR]), administradoresController.quitarEmpleadoDeOficina);

//Rutas para estadisticas e informes
router.get('/estadisticas', administradoresController.obtenerEstadisticas);
router.get('/informes', administradoresController.generarInforme);

router.get('/test', (req, res) => res.json({ message: 'Ruta de prueba funcionando' }));

module.exports = router;
