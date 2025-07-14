import { Router } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = Router();
const ordersFilePath = path.join(__dirname, '../data/orders.json');
// Helper to read orders data
const readOrders = () => {
    const data = fs.readFileSync(ordersFilePath, 'utf8');
    return JSON.parse(data);
};
// Helper to write orders data
const writeOrders = (orders) => {
    fs.writeFileSync(ordersFilePath, JSON.stringify(orders, null, 2), 'utf8');
};
// Get all orders
router.get('/', (req, res) => {
    try {
        const orders = readOrders();
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ message: 'Error reading orders data' });
    }
});
// Get order by ID
router.get('/:id', (req, res) => {
    try {
        const orders = readOrders();
        const order = orders.find((o) => o.id === req.params.id);
        if (order) {
            res.json(order);
        }
        else {
            res.status(404).json({ message: 'Order not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Error reading order data' });
    }
});
// Create new order
router.post('/', (req, res) => {
    try {
        const orders = readOrders();
        // Validate required fields
        const { customer, product, quantity, colors, deadline, price } = req.body;
        if (!customer || !product || !quantity || !colors || !deadline || !price) {
            return res.status(400).json({
                message: 'Missing required fields: customer, product, quantity, colors, deadline, price'
            });
        }
        // Generate unique ID
        const newOrderId = `ORD-${Date.now().toString().slice(-6)}`;
        // Create new order object
        const newOrder = {
            id: newOrderId,
            customer: customer.trim(),
            product: product.trim(),
            quantity: quantity.trim(),
            colors: colors.trim(),
            deadline,
            total: parseFloat(price) || 0,
            deposit: parseFloat(req.body.deposit) || 0,
            remaining: (parseFloat(price) || 0) - (parseFloat(req.body.deposit) || 0),
            status: 'pending',
            date: new Date().toISOString().split('T')[0],
            notes: req.body.notes || '',
            paymentMethod: req.body.paymentMethod || 'Pending',
            items: 1
        };
        orders.push(newOrder);
        writeOrders(orders);
        console.log('New order created:', newOrder.id);
        res.status(201).json(newOrder);
    }
    catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Error creating order', error: String(error) });
    }
});
// Update order
router.put('/:id', (req, res) => {
    try {
        let orders = readOrders();
        const index = orders.findIndex((o) => o.id === req.params.id);
        if (index !== -1) {
            orders[index] = { ...orders[index], ...req.body };
            writeOrders(orders);
            res.json(orders[index]);
        }
        else {
            res.status(404).json({ message: 'Order not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating order' });
    }
});
// Delete order
router.delete('/:id', (req, res) => {
    try {
        let orders = readOrders();
        const initialLength = orders.length;
        orders = orders.filter((o) => o.id !== req.params.id);
        if (orders.length < initialLength) {
            writeOrders(orders);
            res.status(204).send();
        }
        else {
            res.status(404).json({ message: 'Order not found' });
        }
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting order' });
    }
});
export default router;
