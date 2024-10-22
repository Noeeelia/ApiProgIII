const jwt = require('jsonwebtoken');

//Middleware para verificar JWT
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    
    if (!token) {
        return res.status(403).json({ mensaje: 'Se requiere un token para la autenticación' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ mensaje: 'Token inválido' });
    }
};

module.exports = { verifyToken };
