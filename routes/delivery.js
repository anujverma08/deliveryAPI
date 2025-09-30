// routes/delivery.js
const express = require('express');
const router = express.Router();
const { calculateMinCost } = require('../controllers/deliveryController');

router.post('/calculate', (req, res) => {
    try {
        const order = req.body;

        if (!order || Object.keys(order).length === 0) {
            return res.status(400).json({ error: 'Order is empty' });
        }

        // Validate products and quantities
        for (const prod of Object.keys(order)) {
            if (!['A','B','C','D','E','F','G','H','I'].includes(prod)) {
                return res.status(400).json({ error: `Invalid product: ${prod}` });
            }
            if (order[prod] < 0) {
                return res.status(400).json({ error: `Invalid quantity for product ${prod}: ${order[prod]}` });
            }
        }

        const result = calculateMinCost(order);

        // RETURN ONLY COST
        return res.json({ cost: result.cost });

    } catch (err) {
        return res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
    }
});

module.exports = router;
