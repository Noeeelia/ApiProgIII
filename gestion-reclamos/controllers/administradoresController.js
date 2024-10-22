const { json } = require('express');
const administradoresService = require('../services/administradoresService');
const { validationResult} = require('express-validator');

const listarTiposReclamos = async (req, res) => {
    try {
        const tiposReclamos = await administradoresService.obtenerTiposReclamos();
        res.status(200).json({
            exito: true,
            datos: tiposReclamos
        });
    } catch (error) {
        console.error('Error al obtener tipos de reclamo: ', error);
        res.status(500).json({
            exito: false,
            mensaje: 'Error interno del servidor'
        });
    }
};

const crearTipoReclamo = async (req, res) => {
    try {
        const { descripcion } = req.body;
        const nuevoTipo = await administradoresService.crearTipoReclamo(descripcion);
        res.status(201).json({
            exito: true,
            mensaje: 'Tipo de reclamo creado exitosamente',
            datos: nuevoTipo
        });
    } catch (error) {
        console.error('Error al crear tipo de reclamo: ', error);
        res.status(500).json({
            exito: false,
            mensaje: 'Error interno del servidor'
         });
    }
};

const obtenerTiposReclamo = async (req, res) => {
    try {
        const tipos = await administradoresService.obtenerTiposReclamo();
        res.status(200).json({
            exito: true,
            datos: tipos
        });
    } catch (error) {
        console.error('Error al obtener tipos de reclamo: ', error);
        res.status(500).json({
            exito: false,
            mensaje: 'Error interno del servidor'
        });
    }
};

const actualizarTipoReclamo = async(req, res) => {
    try {
        const { id} =req.params;
        const { descripcion } = req.body;
        const tipoActualizado = await administradoresService.actualizarTipoReclamo(id, descripcion);
        if (tipoActualizado) {
            res.status(200).json({
                exito: true,
                mensaje: 'Tipo de reclamo actualizado exitosamente',
                datos: tipoActualizado
            });
        } else {
            res.status(404).json({
                exito: false,
                mensaje: 'Tipo de reclamo no encontrado'
            });
        }
    } catch (error) {
        console.error('Error al actualizar tipo de reclamo: ', error);
        res.status(500).json({
            exito: false,
            mensaje: 'Error interno del servidor'
        });
    }
};

const eliminarTipoReclamo = async (req, res) => {
    try {
        const { id} = req.params;
        const resultado = await administradoresService.eliminarTipoReclamo(id);
        if (resultado) {
            res.status(200).json({
                exito: true,
                mensaje: 'Tipo de reclamo eliminado exitosamente'
            });
        } else {
            res.status(404).json({
                exito: false,
                mensaje: 'Tipo de reclamo no encontrado'
            });
        }
    } catch (error) {
        console.error('Error al eliminar tipo de reclamo: ', error);
        res.status(500).json({
            exito: false,
            mensaje: 'Error interno del servidor'
        });        
    }
};

//Gestion Empleados
const crearEmpleado = async (req, res) => {
    try {
        const { nombre, apellido, correoElectronico, contrasenia, idOficina } = req.body;
        if (!nombre || !apellido || !correoElectronico || !contrasenia || !idOficina) {
            return res.status(400).json({
                exito: false,
                mensaje: 'Todos los campos son requeridos'
            });
        }
        const nuevoEmpleado = await administradoresService.crearEmpleado({ nombre, apellido, correoElectronico, contrasenia, idOficina });
        res.status(201).json({
            exito: true,
            mensaje: 'Empleado creado exitosamente',
            datos: nuevoEmpleado
        });
    } catch (error) {
        console.error('Error al crear empleado: ', error);
        res.status(500).json({
            exito: false,
            mensaje: 'Error interno del servidor'
        });
    }
};

const obtenerEmpleados = async (req, res) => {
    try {
        const empleados = await administradoresService.obtenerEmpleados();
        res.status(200).json({
            exito: true,
            datos: empleados
        });
    } catch (error) {
        console.error('Error al obtener empleados: ', error);
        res.status(500).json({
            exito: false,
            mensaje: 'Error interno del servidor'
        });
    }
};

const actualizarEmpleado = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, apellido, correoElectronico, idOficina } = req.body;
        
        // Verifica que al menos un campo para actualizar esté presente
        if (!nombre && !apellido && !correoElectronico && !idOficina) {
            return res.status(400).json({
                exito: false,
                mensaje: 'Debe proporcionar al menos un campo para actualizar'
            });
        }

        const empleadoActualizado = await administradoresService.actualizarEmpleado(id, { nombre, apellido, correoElectronico, idOficina });
        
        if (empleadoActualizado) {
            res.status(200).json({
                exito: true,
                mensaje: 'Empleado actualizado exitosamente',
                datos: empleadoActualizado
            });
        } else {
            res.status(404).json({ 
                exito: false,
                mensaje: 'Empleado no encontrado'
            });
        }
    } catch (error) {
        console.error('Error al actualizar empleado: ', error);
        res.status(500).json({
            exito: false,
            mensaje: 'Error interno del servidor'
        });
    }
};

const eliminarEmpleado = async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await administradoresService.eliminarEmpleado(id);
        if (resultado.exito) {
            res.status(200).json(resultado);
        } else {
            res.status(404).json(resultado);
        }
    } catch (error) {
        console.error('Error al eliminar empleado: ', error);
        res.status(500).json({
            exito: false,
            mensaje: 'Error interno del servidor'
        });
    }
};

//Gestión de Oficinas
const crearOficina = async (req, res) => {
    try {
        const { nombre, idReclamoTipo } = req.body;
        const nuevaOficina = await administradoresService.crearOficina(nombre, idReclamoTipo);
        res.status(201).json({
            exito: true,
            mensaje: 'Oficina creada exitosamente',
            datos: nuevaOficina
        });
    } catch (error) {
        console.error('Error al crear oficina: ', error);
        res.status(500).json({ 
            exito: false,
            mensaje: 'Error interno del servidor'
        });
    }
};

const obtenerOficinas = async (req, res) => {
    try {
        const oficinas = await administradoresService.obtenerOficinas();
        res.status(200).json({
            exito: true,
            datos: oficinas
        });
    } catch (error) {
        console.error('Error al obtener oficinas: ', error);
        res.status(500).json({
            exito: false,
            mensaje: 'Error interno del servidor'
        });
    }
};

const actualizarOficina = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, idReclamoTipo } = req.body;
        
        if (!nombre && idReclamoTipo === undefined) {
            return res.status(400).json({
                exito: false,
                mensaje: 'Debe proporcionar al menos un campo para actualizar'
            });
        }

        const resultado = await administradoresService.actualizarOficina(id, { nombre, idReclamoTipo });
        
        if (resultado.exito) {
            res.status(200).json(resultado);
        } else {
            res.status(404).json(resultado);
        }
    } catch (error) {
        console.error('Error al actualizar oficina: ', error);
        res.status(500).json({
            exito: false,
            mensaje: 'Error interno del servidor'
        });
    }
};

const eliminarOficina = async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await administradoresService.eliminarOficina(id);
        if (resultado) {
            res.status(200).json({
                exito: true,
                mensaje: 'Oficina eliminada exitosamente'
            });
        } else {
            res.status(404).json({
                exito: false,
                mensaje: 'Oficina no encontrada'
            });
        }
    } catch (error) {
        console.error('Error al eliminar oficina: ', error);
        res.status(500).json({
            exito: false,
            mensaje: 'Error interno del servidor'
        });
    }
};


//Gestión de empleados de oficinas
const agregarEmpleadoAOficina = async (req, res) => {
    try {
        const { idOficina } = req.params;
        const { idEmpleado } = req.body;
        const resultado = await administradoresService.agregarEmpleadoAOficina(idOficina, idEmpleado);
        if (resultado.exito) {
            res.status(200).json({ exito: true, mensaje: 'Empleado agregado a la oficina exitosamente' });
        } else {
            res.status(400).json({ exito: false, mensaje: resultado.mensaje });
        }
    } catch (error) {
        console.error('Error al agregar empleado a la oficina:', error);
        res.status(500).json({ exito: false, mensaje: 'Error interno del servidor' });
    }
};

const quitarEmpleadoDeOficina = async (req, res) => {
    try {
        const { idOficina, idEmpleado } = req.params;
        const resultado = await administradoresService.quitarEmpleadoDeOficina(idOficina, idEmpleado);
        if (resultado.exito) {
            res.status(200).json({ exito: true, mensaje: 'Empleado removido de la oficina exitosamente' });
        } else {
            res.status(400).json({ exito: false, mensaje: resultado.mensaje });
        }
    } catch (error) {
        console.error('Error al quitar empleado de la oficina:', error);
        res.status(500).json({ exito: false, mensaje: 'Error interno del servidor' });
    }
};


//Estadisticas e informes
const obtenerEstadisticas = async (req, res) => {
    try {
        const estadisticas = await administradoresService.obtenerEstadisticas();;
        res.status(200).json({
            exit: true,
            datos: estadisticas
        });
    } catch (error) {
        console.error('Error al obtener estadísticas: ', error);
        res.status(500).json({ 
            exito: false,
            mensaje: 'Error interno del servidor.' });
    }
};

const generarInforme = async (req, res) => {
    try {
        const formato = req.query.formato || 'pdf';
        const informe = await administradoresService.generarInforme(formato);

        if (formato === 'pdf') {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=informe.pdf');
            informe.pipe(res);
        } else {
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=informe.csv');
            res.send(informe);
        }
    } catch (error) {
        console.error('Error al generar informe: ', error);
        res.status(500).json({ exito: false, mensaje: 'Error interno del servidor' });
    }
};



module.exports = {
    listarTiposReclamos,
    crearTipoReclamo,
    obtenerTiposReclamo,
    actualizarTipoReclamo,
    eliminarTipoReclamo,
    crearEmpleado,
    obtenerEmpleados,
    actualizarEmpleado,
    eliminarEmpleado,
    crearOficina,
    obtenerOficinas,
    actualizarOficina,
    eliminarOficina,
    agregarEmpleadoAOficina,
    quitarEmpleadoDeOficina,
    obtenerEstadisticas,
    generarInforme
};
