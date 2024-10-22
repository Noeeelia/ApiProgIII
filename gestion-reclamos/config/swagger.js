const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

//Configuración de Swagger
const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'API de Reclamos',
            version: '1.0.0',
            description: 'API para gestionar reclamos',
        },
        servers: [
            {
                url: 'http://localhost:3001/api/v1',
            },
        ],
    },
    apis: ['./routes/*.js'],
};

//Inicializar Swagger
const swaggerDocs = swaggerJSDoc(swaggerOptions);

module.exports = (app) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
};