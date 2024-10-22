const express =require('express');
const router = express.Router();

const reclamosController = require('../controllers/reclamosController');
const { verifyToken } = require('../config/jwtMiddleware');
const { verifyRole }  = require('../services/roleService');
const { body } = require('express-validator');
const ROLES = require('../config/roles');

//Validación de los datos para crear un reclamo
const validarReclamo = [
    body('asunto').notEmpty().withMessage('El asunto es obligatorio'),
    body('descripcion').notEmpty().withMessage('La descripción es obligatoria')
];

/**
 * @swagger
 * tags:
 *   name: Reclamos
 *   description: API para gestionar reclamos
 */

//Rutas protegida 
//Para Clientes
router.post('/crear', verifyToken, verifyRole([ROLES.CLIENTE]), validarReclamo, reclamosController.crearReclamo);
router.get('/misReclamos', verifyToken, verifyRole([ROLES.CLIENTE]),reclamosController.listarReclamos);
router.get('/estado/:idReclamo', verifyToken, verifyRole([ROLES.CLIENTE]), reclamosController.consultarEstadoReclamo);
router.patch('/cancelar/:idReclamo', verifyToken, verifyRole([ROLES.CLIENTE]), reclamosController.cancelarReclamo);

module.exports = router;
