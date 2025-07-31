const swaggerJsdoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Recruitment API',
    version: '1.0.0',
    description: 'API quản lý tuyển dụng',
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT', // Quan trọng để Swagger hiểu là bạn dùng JWT
      },
    },
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./docs/*.js'], // đường dẫn tới file chứa @swagger
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
