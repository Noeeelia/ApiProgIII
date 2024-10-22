const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const { errorHandler } = require('./middlewares/errorMiddleware');
const helmet = require('helmet');       //Seguridad
const rateLimit = require('express-rate-limit');

const swagger = require('./config/swagger');

const bd = require('./config/bd');      //Importa la conexión a la bd
require('dotenv').config();      //Para la carga las variables de entorno

const app = express();

const limiter = rateLimit({
    windowMs: 15 * 60* 1000,  //15 minutos
    max: 100,  //limite de 100 solicitudes por ventana
    message: 'Demasiadas solicitudes desde esta IP, por favor intente mas tarde'
});

//Middlewares de seguridad
app.use(helmet());             //Helmet para mejorar la seguridad HTTP
app.use(limiter);             //Limitar el número de solicitudes(por si acasoataques de fuerza bruta)

//Middleware de desarrollo
app.use(morgan('dev'));
app.use(express.json());     //Para parsear JSON
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

//Inicializar Swagger
swagger(app);

//Pueba de conexión a bd
bd.getConnection()
    .then(connection => {
        console.log('Conexión exitosa a la base de datos');
        connection.release();
    })
    .catch(err => {
        console.error('Error al conectar con la base de datos', err);
    });

// Importar rutas
const authRoutes = require('./routes/auth');      //Importa las rutas de autenticación
const reclamosRoutes = require('./routes/reclamos');
const empleadosRoutes = require('./routes/empleados');
const administradoresRoutes = require('./routes/administradores');

//Rutas de autenticación
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/reclamos', reclamosRoutes);
app.use('/api/v1/empleados', empleadosRoutes);
app.use('/api/v1/administradores', administradoresRoutes);

//Ruta principal
app.get('/', (req, res) => {
    res.send('Bienvenido a la API de Gestión de reclamos');
});

 //Manejo de errores
app.use(errorHandler);      

//Iniciar servidor
const PUERTO = process.env.PUERTO || 3001;
app.listen(PUERTO, () => {
    console.log(`Servidor corriendo en el puerto ${ PUERTO }`);
});

