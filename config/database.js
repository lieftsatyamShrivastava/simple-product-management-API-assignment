const { Sequelize } = require('sequelize');
require('dotenv').config();

const DB_NAME = process.env.DB_NAME??"";
const DB_USER = process.env.DB_USER??"";
const DB_PASS = process.env.DB_PASS??"";
const DB_HOST = process.env.DB_HOST??"";

// Create a new Sequelize instance
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST, // or your database host
  dialect: 'postgres',
  port: 5432, // PostgreSQL default port
  logging: false, // Disable logging; set to true for debugging purposes
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, 
    },
  },
});

module.exports = sequelize;
