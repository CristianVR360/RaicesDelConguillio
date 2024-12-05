const express = require('express');
const cors = require('cors');

const { dbConnection } = require('../database/config');

class Server {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 8080; // Asegúrate de que el puerto sea correcto
    this.usersPath = '/api/users';
    this.loginPath = '/api/login';
    this.adminPath = '/api/admin';

    this.connectDB();
    this.middlewares();
    this.routes();
  }

  async connectDB() {
    await dbConnection();
  }

  middlewares() {
    const corsOptions = {
      origin: '*', // Ajusta según sea necesario
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    };

    this.app.use(cors(corsOptions));
    this.app.use(express.json());
    this.app.use(express.static('public'));
  }

  routes() {
    this.app.use(this.usersPath, require('../routes/user.routes'));
    this.app.use(this.loginPath, require('../routes/login.routes'));
    this.app.use(this.adminPath, require('../routes/admin.routes'));
  }

  listen() {
    this.app.listen(this.port, () => {
      console.log(`Server running at http://localhost:${this.port}/`);
    });
  }
}

module.exports = Server;
