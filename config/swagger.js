const swaggerJsdoc = require('swagger-jsdoc');
const description = require('./description');
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'CultureBooth API',
            version: '1.0.0',
            description: description,
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development server',
            },
            {
                url: process.env.MASTER_SERVER_ADDR,
                description: 'Production server',
            },
        ],
        components: {
            securitySchemes: {
                ClientAuth: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'x-client-auth-token',
                }
            },
        },
    },
    // Paths to files containing OpenAPI definitions
    apis: [
      './docs/routes/generation.js',
      './docs/routes/model.js',
      './docs/routes/inputTemplate.js',
      './docs/routes/*.js',
      './docs/schemas/*.js',
    ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec; 