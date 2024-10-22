//Middleware para verificar el ROL del usuario 
const verifyRole = (rolesPermitidos) => {
    return (req, res, next) => {
        console.log('Requiere un usuario:', req.user);
        console.log('Roles permitidos:', rolesPermitidos);
        const idUsuarioTipo = req.user.idUsuarioTipo;
        console.log('Id de usuario tipo:', idUsuarioTipo);

        if (!rolesPermitidos.includes(idUsuarioTipo)) {
            console.log('No tiene permiso para realizar esta acción.');
            return res.status(403).json({ mensaje: 'Acceso denegado: No tiene permiso para realizar esta acción.'});
        }
        next();
    };
};


module.exports =  { verifyRole };
