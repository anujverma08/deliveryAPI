// server.js
const express = require('express');
const bodyParser = require('body-parser');
const deliveryRoutes = require('./routes/delivery');
require('dotenv').config(); // Load environment variables
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000; // fallback to 3000
app.use(cors()); // allow all origins

app.use(bodyParser.json());

// Use delivery routes
app.use('/api/delivery', deliveryRoutes);

// 404 handler
app.use((req, res) => res.status(404).json({ error: 'Endpoint not found' }));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
