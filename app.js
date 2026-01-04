const express = require('express');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
// 1. ADD THIS LINE
const scheduleRoutes = require('./routes/schedules'); 

require('dotenv').config({ quiet: true });

const app = express();
app.use(express.json());
app.use(express.static('public'));

app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
// 2. ADD THIS LINE
app.use('/api/schedules', scheduleRoutes); 

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));