const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
// const { patch } = require("../routes/bookRoutes");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Documentation",
      version: "1.0.0",
      description: "Dokumentasi API untuk User, Book, dan Auth",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],

    tags: [
      {
        name: "Users",
        description: "Endpoints untuk mengelola user",
      },
      {
        name: "Books",
        description: "Endpoints untuk mengelola buku",
      },
      {
        name: "Auth",
        description: "Endpoints untuk mengelola autentikasi",
      },
    ],
    
  },
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJsDoc(options);

function swaggerDocs(app) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  // console.log("📚 Swagger Docs tersedia di: http://localhost:3000/api-docs");
}

module.exports = swaggerDocs;
