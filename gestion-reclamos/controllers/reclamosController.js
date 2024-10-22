const reclamosService = require('../services/reclamosService');
const { enviarNotificacion } = require('../services/notificacionesService');

//CREAR un reclamo
const crearReclamo = async (req, res) => {
    try {
        const { asunto, descripcion, idReclamoTipo } = req.body;
        const idUsuarioCreador = req.user.idUsuario; // Obtenido del token

        const nuevoReclamoId = await reclamosService.crearReclamo({
            asunto,
            descripcion,
            idReclamoTipo,
            idReclamoEstado: 1,        //1 es Creado
            idUsuarioCreador
        });

        //Obtener los detaller del reclamo creado
        const nuevoReclamo = reclamosService.obtenerReclamoPorId(nuevoReclamoId);
        if (!nuevoReclamo) {
            throw new Error('Error al obtener el reclamo creado');
        }

        //Enviar notificación
        const cliente = await reclamosService.obtenerDatosClientePorId(idUsuarioCreador);
        const datosCorreo = {
            nombre: cliente.nombre,
            asunto,
            idReclamo: nuevoReclamoId,
            fechaCreacion: new Date().toLocaleString()
        };

        try {
            await enviarNotificacion(cliente.correoElectronico, datosCorreo, 'Creado');
            console.log('Notificación enviada con exito.');
        } catch (error) {
            console.error('Error al enviar la notificación:', error);
        }

        res.status(201).json({
            exito: true,
            mensaje: 'Reclamo creado exitosamente.',
            idReclamo: nuevoReclamoId
        });
    } catch (error) {
        console.error('Error al crear el reclamo:', error);
        res.status(500).json({
            exito: false,
            mensaje: 'Error interno del servidor',
            error: error.message
        });
    }
};

//Listar reclamos - Cliente 
const listarReclamos = async (req, res) => {
    try {
        const idUsuario = req.user.idUsuario;
        const reclamos = await reclamosService.listarReclamosUsuario(idUsuario);
        const reclamosFiltrados = reclamos.map(reclamo => ({
            id: reclamo.idReclamo,
            asunto: reclamo.asunto,
            descripcion: reclamo.descripcion,
            estado: reclamo.estado,
            fechaCreacion: reclamo.fechaCreado
        }));
        res.status(200).json({
            exito: true,
            datos: reclamosFiltrados  
        }); 
    } catch (error) {
        console.error('Error al listar los reclamos: ', error);
        res.status(500).json({ 
            exito: false,
            mensaje: 'Error interno del servidor'
        });
    }
};

const consultarEstadoReclamo = async (req, res) => {
    try {
        const { idReclamo } = req.params;
        const idUsuario = req.user.idUsuario;
        const reclamo = await reclamosService.consultarEstadoReclamo(idReclamo, idUsuario);
        if (reclamo) {
            res.status(200).json({
                exito: true,
                reclamo: {
                    id: reclamo.idReclamo,
                    asunto: reclamo.asunto,
                    estado: reclamo.estado,
                    fechaCreacion: reclamo.fechaCreado
                }
            });
        } else {
            res.status(404).json({
                exito: false,
                mensaje: 'Reclamo no encontrado'
            });
        }
    } catch (error) {
        console.error('Error al consultar el estado del reclamo:', error);
        res.status(500).json({ exito: false, mensaje: 'Error interno del servidor' });
    }
};

const cancelarReclamo = async (req, res) => {
    try {
        const { idReclamo } = req.params;
        const idUsuario = req.user.idUsuario;
        const resultado = await reclamosService.cancelarReclamo(idReclamo, idUsuario);

        if (resultado.exito) {
            const cliente = await reclamosService.obtenerDatosClientePorId(idUsuario);

            const datosCorreo = {
                nombre: cliente.nombre,
                idReclamo: idReclamo,
                estadoReclamo: 'Cancelado',
                fechaCancelado: new Date().toLocaleString(),
                cancelado: 'Por el usuario'
            };
            try {
                await enviarNotificacion(cliente.correoElectronico, datosCorreo, 'Cambio de estado');
                console.log('Notificación enviada con exito.');
            } catch (notificacionError) {
                console.error('Error al enviar la notificación:', notificacionError);
            }
        }
        res.status(200).json(resultado);
    } catch (error) {
        console.error('Error al cancelar reclamo:', error);
        res.status(500).json({ 
            exito: false, 
            mensaje: 'Error interno del servidor',
            error: error.message
        });
    }
};


module.exports = {
    crearReclamo,
    listarReclamos,
    consultarEstadoReclamo,
    cancelarReclamo
};
