const empleadosService = require('../services/empleadosService');
const { enviarNotificacion } = require('../services/notificacionesService');
const bd = require('../config/bd');

const atenderReclamo = async (req, res) => {
    try {
        const { idReclamo } = req.params;
        const idEmpleado = req.user.idUsuario;
        const { nuevoEstado } = req.body;

        if (!nuevoEstado) {
            return res.status(400).json({
                exito: false,
                mensaje: 'El nuevo estado es requerido'
            });
        }

        const resultado = await empleadosService.atenderReclamo(idReclamo, idEmpleado, nuevoEstado);

        if (resultado.exito) {
            res.status(200).json({ 
                exito: true, 
                mensaje: resultado.mensaje
            });
        } else {
            res.status(400).json({
                exito: false,
                mensaje: resultado.mensaje
            });
        }
    } catch (error) {
        console.error('Error al atender el reclamo: ', error);
        res.status(500).json({ 
            exito: false,
            mensaje: 'Error interno del servidor'
        });
    }
};

const finalizarReclamo = async (req, res) => {
    try {
        const { idReclamo } = req.params;
        const idEmpleado = req.user.idUsuario;

        const resultado = await empleadosService.finalizarReclamo(idReclamo, idEmpleado);

        if (resultado.exito) {
            res.status(200).json({
                exito: true,
                mensaje: resultado.mensaje
            });
        } else {
            res.status(400).json({
                exito: false,
                mensaje: resultado.mensaje
            });
        }
    } catch (error) {
        console.error('Error al finalizar el reclamo: ', error);
        res.status(500).json({
            exito: false,
            mensaje: 'Error interno del servidor'
        });
    }
}

//Listar los reclamos asignados a la oficina del empleado
const listarReclamosOficina = async (req, res) => {
    try {
        const idEmpleado = req.user.idUsuario; // Asumiendo que el middleware de autenticación agrega 'user' al objeto req
        console.log('ID del empleado:', idEmpleado);

        //Verificar si el empleado está asignado a una oficina
        const asignacion = await empleadosService.verificarAsignacionEmpleado(idEmpleado);
        console.log('Asignación del empleado:', asignacion);

        const reclamos = await empleadosService.listarReclamosOficina(idEmpleado);
        console.log('Reclamos obtenidos:', reclamos.length);
        res.status(200).json({
            exito: true,
            datos: reclamos
        });
    } catch (error) {
        console.error('Error al listar los reclamos de la oficina: ', error);
        res.status(500).json({ 
            exito: false,
            mensaje: 'Error interno del servidor'
        });
    }
};

// No olvides exportar la nueva función
module.exports = {
    atenderReclamo,
    finalizarReclamo,
    listarReclamosOficina,
};
