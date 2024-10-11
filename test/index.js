const sequelize = require('../config/database');
const Products = require('../models/Products'); // Adjust path if necessary

async function connectDB() {
  try {
    // Test the connection
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    // Sync all models
    await sequelize.sync({ alter: true }); // Use { force: true } for development, but not recommended for production
    console.log('All models were synchronized successfully.');

    // Example usage
    // const newProducts = await Products.create({
    //   name: 'John Doe',
    //   price: 100.0,
    //   category: 'General',
    // });
    // console.log(newProducts.toJSON());
    
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  } finally {
    // Close the connection if needed
    // await sequelize.close();
  }
}

connectDB();
