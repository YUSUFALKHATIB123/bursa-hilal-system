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
const writeOrders = (orders: any) => {
    fs.writeFileSync(ordersFilePath, JSON.stringify(orders, null, 2), 'utf8');
};

// Get all orders
router.get('/', (req, res) => {
    try {
        const orders = readOrders();
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Error reading orders data' });
    }
});

// Get order by ID
router.get('/:id', (req, res) => {
    try {
        const orders = readOrders();
        const order = orders.find((o: any) => o.id === req.params.id);
        if (order) {
            res.json(order);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
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
            items: 1,
            completedStages: [1], // Start with first stage completed
            currentStage: 'Sent to Dyeing',
            timelineNotes: {}
        };
        
        orders.push(newOrder);
        writeOrders(orders);
        
        console.log('New order created:', newOrder.id);
        res.status(201).json(newOrder);
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ message: 'Error creating order', error: String(error) });
    }
});

// Update order
router.put('/:id', (req, res) => {
    try {
        let orders = readOrders();
        const index = orders.findIndex((o: any) => o.id === req.params.id);
        if (index !== -1) {
            orders[index] = { ...orders[index], ...req.body };
            writeOrders(orders);
            res.json(orders[index]);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error updating order' });
    }
});

// Delete order
router.delete('/:id', (req, res) => {
    try {
        let orders = readOrders();
        const initialLength = orders.length;
        orders = orders.filter((o: any) => o.id !== req.params.id);
        if (orders.length < initialLength) {
            writeOrders(orders);
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting order' });
    }
});

// Add note to order timeline
router.post('/:id/timeline-note', (req, res) => {
    try {
        const orders = readOrders();
        const order = orders.find((o: any) => o.id === req.params.id);
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        const { stepId, note } = req.body;
        
        if (!stepId || !note) {
            return res.status(400).json({ message: 'Step ID and note are required' });
        }
        
        // Initialize timeline notes if not exists
        if (!order.timelineNotes) {
            order.timelineNotes = {};
        }
        
        // Add or update the note for this step
        order.timelineNotes[stepId] = note;
        
        writeOrders(orders);
        res.json({ message: 'Note added successfully', order });
    } catch (error) {
        console.error('Error adding timeline note:', error);
        res.status(500).json({ message: 'Error adding timeline note' });
    }
});

// Update order progress/stage
router.put('/:id/progress', (req, res) => {
    try {
        const orders = readOrders();
        const order = orders.find((o: any) => o.id === req.params.id);
        
        if (!order) {
            return res.status(404).json({ message: 'Order not found' });
        }
        
        const { currentStage, status, completedStages } = req.body;
        
        // Update order progress
        if (currentStage) order.currentStage = currentStage;
        if (status) order.status = status;
        if (completedStages) order.completedStages = completedStages;
        
        // Update timestamp for stage completion
        order.lastUpdated = new Date().toISOString();
        
        writeOrders(orders);
        res.json({ message: 'Order progress updated successfully', order });
    } catch (error) {
        console.error('Error updating order progress:', error);
        res.status(500).json({ message: 'Error updating order progress' });
    }
});

export default router;

