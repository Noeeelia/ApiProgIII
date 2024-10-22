const mysql = require('mysql2');
require('dotenv').config();      //Para la carga las variables de entorno

//Crear la conexión a la base de datos
const pool = mysql.createPool({
    host: process.env.BD_HOST,                     //Cambialos según tu configuración desde la variables de entorno
    user: process.env.BD_USUARIO,               //Tu usuario de MySQL
    password: process.env.BD_CLAVE,           //Tu contraseña de MySQL
    database: process.env.BD_NOMBRE,        //Nombre de tu base de datos
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

pool.on('connection', () => console.log('Nueva conexión a la base de datos establecida.'));
pool.on('error', (err) => {
    console.error('Error en la conexión a la base de datos: ', err);
    // En caso de errores críticos, cerrar la aplicación o reiniciar la conexión
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.error('Reiniciando conexión a la base de datos...');
    }
});

module.exports = pool.promise();    //Usamos promesas para simplificar el manejo asincrono
