const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.CORREO,
        pass: process.env.CLAVE
    },
    tls: {
      rejectUnauthorized: false
    }
});

// Función para enviar el correo electrónico
const enviarNotificacion = async (correoElectronico, datos, tipoNotificacion) => {
  try {
    let templatePath;
    let subject;  
    
    //Selecion plantilla de envio
    switch (tipoNotificacion) {
      case 'Creado':
        templatePath = path.join(__dirname, '../utils/Handlebars/notificacionEstado.hbs');
        subject = 'Notificación reclamo Creado';
        break;

      case 'Cambio de estado':
        templatePath = path.join(__dirname, '../utils/Handlebars/notificacionCambioEstado.hbs');
        subject = 'Notificación de cambio de estado en su reclamo';
        break;

      case 'Finalizado':
        templatePath = path.join(__dirname, '..', 'utils', 'Handlebars', 'notificacionFinal.hbs');
        subject = 'Notificación de que su reclamo a finalizado';
        break;
      
      default:
        throw new Error('Tipo de notificación no válido');
    }

    console.log('Ruta de la plantilla:', templatePath);

    const plantilla = fs.readFileSync(templatePath, 'utf8');
    const template = handlebars.compile(plantilla);
    const html = template(datos);         //Compila la plantilla 

    await transporter.sendMail({
      from: '"Sistema de Reclamos - Concesionaria" <no-reply@sistema.com>',
      to: correoElectronico,
      subject: subject,
      html: html
    });

    console.log('Notificación enviada exitosamente');
  } catch (error) {
    console.error('Error al enviar notificación: ', error);
    throw error;  
  }
};
module.exports = { enviarNotificacion };
