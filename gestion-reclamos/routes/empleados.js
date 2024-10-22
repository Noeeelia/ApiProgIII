const express = require('express');
const router = express.Router();
const empleadosController = require('../controllers/empleadosController');
const { verifyToken } = require('../config/jwtMiddleware');
const { verifyRole } = require('../services/roleService');
const ROLES = require('../config/roles');

/**
 * @swagger
 * tags:
 *   name: Empleados
 *   description: API para gestionar reclamos de empleados
 */

//Ruta protegida para que el empleado 
router.get('/reclamos/listar', verifyToken, verifyRole([ROLES.EMPLEADO]), empleadosController.listarReclamosOficina);
router.patch('/reclamos/atender/:idReclamo', verifyToken, verifyRole([ROLES.EMPLEADO]), empleadosController.atenderReclamo);
router.patch('/reclamos/finalizar/:idReclamo', verifyToken, verifyRole([ROLES.EMPLEADO]), empleadosController.finalizarReclamo);

module.exports = router;
