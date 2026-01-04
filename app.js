const express = require('express');
const userRoutes = require('./routes/users');
require('dotenv').config({ quiet: true });// Load variables
const productRoutes = require('./routes/products');

const app = express();
app.use(express.json());
app.use(express.static('public'));

app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);

// Use the port from .env or default to 3000
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));