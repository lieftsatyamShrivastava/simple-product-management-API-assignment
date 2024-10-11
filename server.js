const express = require('express');
const sequelize = require('./config/database');
const Product = require('./models/Products');
const { Op } = require('sequelize');

const app = express();
const port = 3000;

app.use(express.json()); // Middleware to parse JSON bodies

// Connect to the database and sync models
sequelize.sync({ alter: true })
  .then(() => {
    console.log('Database connected and models synchronized');
  })
  .catch((err) => {
    console.error('Error connecting to the database:', err);
  });

// 1. Add a new product (POST /products)
app.post('/products', async (req, res) => {
  try {
    const { name, price, description, category } = req.body;

    // Validate required fields
    if (!name || !price || !category) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    // Validate data types
    if (typeof name !== 'string' || typeof category !== 'string') {
      return res.status(400).json({ message: 'Name and category must be strings.' });
    }

    if (isNaN(price) || price < 0) {
      return res.status(400).json({ message: 'Price must be a valid positive number.' });
    }

    // Create a new product in the database
    const newProduct = await Product.create({
      name,
      price: parseFloat(price),
      description: description ?? 'No description provided',
      category,
    });

    res.status(201).json({ message: 'Product added successfully!', product: newProduct });
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ message: 'Error adding product.' });
  }
});

// 2. Get details of a single product by ID (GET /products/:id)
app.get('/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;

    // Validate product ID
    if (isNaN(productId)) {
      return res.status(400).json({ message: 'Invalid product ID.' });
    }

    const product = await Product.findByPk(productId);

    // Check if product exists
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Error fetching product.' });
  }
});

// 3. Update an existing product (PUT /products/:id)
app.put('/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const { name, price, description, category } = req.body;

    // Validate product ID
    if (isNaN(productId)) {
      return res.status(400).json({ message: 'Invalid product ID.' });
    }

    const product = await Product.findByPk(productId);

    // Check if product exists
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // Validate data
    if (name && typeof name !== 'string') {
      return res.status(400).json({ message: 'Name must be a string.' });
    }

    if (price && (isNaN(price) || price < 0)) {
      return res.status(400).json({ message: 'Price must be a valid positive number.' });
    }

    if (category && typeof category !== 'string') {
      return res.status(400).json({ message: 'Category must be a string.' });
    }

    // Update the product
    await product.update({
      name: name ?? product.name,
      price: price !== undefined ? parseFloat(price) : product.price,
      description: description ?? product.description,
      category: category ?? product.category,
    });

    res.json({ message: 'Product updated successfully!', product });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Error updating product.' });
  }
});

// 4. Delete a product by ID (DELETE /products/:id)
app.delete('/products/:id', async (req, res) => {
  try {
    const productId = req.params.id;

    // Validate product ID
    if (isNaN(productId)) {
      return res.status(400).json({ message: 'Invalid product ID.' });
    }

    const product = await Product.findByPk(productId);

    // Check if product exists
    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // Delete the product
    await product.destroy();
    res.json({ message: 'Product deleted successfully!' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Error deleting product.' });
  }
});

// 5. Get a list of all products (GET /products)
app.get('/products', async (req, res) => {
  try {
    // Get pagination and search parameters from query
    const { page = 1, limit = 10, search } = req.query;

    // Parse the page and limit to integers
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    // Construct the query options
    const options = {
      limit: limitNum,
      offset: offset,
    };

    // Add search functionality
    if (search) {
      options.where = {
        [Op.or]: [
          { name: { [Op.iLike]: `%${search}%` } }, // For PostgreSQL (case-insensitive)
          { category: { [Op.iLike]: `%${search}%` } }
        ]
      };
    }

    // Fetch products from the database
    const products = await Product.findAndCountAll(options);
    
    // Calculate total pages
    const totalPages = Math.ceil(products.count / limitNum);

    res.json({
      totalItems: products.count,
      totalPages: totalPages,
      currentPage: pageNum,
      products: products.rows,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Error fetching products.' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
