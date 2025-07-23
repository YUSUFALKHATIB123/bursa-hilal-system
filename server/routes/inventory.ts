import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();
const inventoryDataPath = path.join(__dirname, '../data/inventory.json');
const stockMovementsPath = path.join(__dirname, '../data/stock_movements.json');

// Helper function to read JSON file
const readJsonFile = (filePath: string) => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error);
    return [];
  }
};

// Helper function to write JSON file
const writeJsonFile = (filePath: string, data: any) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing ${filePath}:`, error);
    return false;
  }
};

// Get all inventory items
router.get('/', (req, res) => {
  try {
    const inventory = readJsonFile(inventoryDataPath);
    res.json(inventory);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

// Get inventory item by ID
router.get('/:id', (req, res) => {
  try {
    const inventory = readJsonFile(inventoryDataPath);
    const item = inventory.find((item: any) => item.id === req.params.id);
    
    if (!item) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    
    res.json(item);
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    res.status(500).json({ error: 'Failed to fetch inventory item' });
  }
});

// Create new inventory item
router.post('/', (req, res) => {
  try {
    const inventory = readJsonFile(inventoryDataPath);
    const newItem = {
      id: `INV-${Date.now()}`,
      ...req.body,
      createdAt: new Date().toISOString()
    };
    
    inventory.push(newItem);
    
    if (writeJsonFile(inventoryDataPath, inventory)) {
      res.status(201).json(newItem);
    } else {
      res.status(500).json({ error: 'Failed to save inventory item' });
    }
  } catch (error) {
    console.error('Error creating inventory item:', error);
    res.status(500).json({ error: 'Failed to create inventory item' });
  }
});

// Update inventory item
router.put('/:id', (req, res) => {
  try {
    const inventory = readJsonFile(inventoryDataPath);
    const index = inventory.findIndex((item: any) => item.id === req.params.id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    
    inventory[index] = {
      ...inventory[index],
      ...req.body,
      updatedAt: new Date().toISOString()
    };
    
    if (writeJsonFile(inventoryDataPath, inventory)) {
      res.json(inventory[index]);
    } else {
      res.status(500).json({ error: 'Failed to update inventory item' });
    }
  } catch (error) {
    console.error('Error updating inventory item:', error);
    res.status(500).json({ error: 'Failed to update inventory item' });
  }
});

// Delete inventory item
router.delete('/:id', (req, res) => {
  try {
    const inventory = readJsonFile(inventoryDataPath);
    const index = inventory.findIndex((item: any) => item.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    inventory[index].isDeleted = true;
    if (writeJsonFile(inventoryDataPath, inventory)) {
      res.json({ message: 'Inventory item soft deleted' });
    } else {
      res.status(500).json({ error: 'Failed to soft delete inventory item' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to soft delete inventory item' });
  }
});

// Get stock movements
router.get('/movements/all', (req, res) => {
  try {
    const movements = readJsonFile(stockMovementsPath);
    res.json(movements);
  } catch (error) {
    console.error('Error fetching stock movements:', error);
    res.status(500).json({ error: 'Failed to fetch stock movements' });
  }
});

// Get stock movements for specific item
router.get('/movements/:itemId', (req, res) => {
  try {
    const movements = readJsonFile(stockMovementsPath);
    const itemMovements = movements.filter((movement: any) => movement.itemId === req.params.itemId);
    res.json(itemMovements);
  } catch (error) {
    console.error('Error fetching item movements:', error);
    res.status(500).json({ error: 'Failed to fetch item movements' });
  }
});

// Add stock movement
router.post('/movements', (req, res) => {
  try {
    const movements = readJsonFile(stockMovementsPath);
    const newMovement = {
      id: `MOV-${Date.now()}`,
      ...req.body,
      createdAt: new Date().toISOString()
    };
    
    movements.push(newMovement);
    
    if (writeJsonFile(stockMovementsPath, movements)) {
      res.status(201).json(newMovement);
    } else {
      res.status(500).json({ error: 'Failed to save stock movement' });
    }
  } catch (error) {
    console.error('Error creating stock movement:', error);
    res.status(500).json({ error: 'Failed to create stock movement' });
  }
});

// Update stock quantity and record movement
router.post('/:id/movement', (req, res) => {
  try {
    const { operation, quantity, notes, date, user } = req.body;
    
    if (!operation || !quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Invalid operation or quantity' });
    }
    
    // Read current inventory
    const inventory = readJsonFile(inventoryDataPath);
    const itemIndex = inventory.findIndex((item: any) => item.id === req.params.id);
    
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }
    
    const item = inventory[itemIndex];
    const previousQuantity = item.quantity;
    
    // Calculate new quantity
    let newQuantity;
    if (operation === 'in') {
      newQuantity = previousQuantity + quantity;
    } else if (operation === 'out') {
      if (quantity > previousQuantity) {
        return res.status(400).json({ error: 'Insufficient stock' });
      }
      newQuantity = previousQuantity - quantity;
    } else {
      return res.status(400).json({ error: 'Invalid operation' });
    }
    
    // Update inventory item
    inventory[itemIndex] = {
      ...item,
      quantity: newQuantity,
      lastRestocked: operation === 'in' ? date : item.lastRestocked,
      updatedAt: new Date().toISOString()
    };
    
    // Record movement
    const movements = readJsonFile(stockMovementsPath);
    const newMovement = {
      id: `MOV-${Date.now()}`,
      itemId: req.params.id,
      type: item.type,
      color: item.color,
      quantity: quantity,
      operation: operation,
      user: user || 'admin',
      date: date || new Date().toISOString().split('T')[0],
      notes: notes || '',
      previousQuantity: previousQuantity,
      newQuantity: newQuantity,
      createdAt: new Date().toISOString()
    };
    
    movements.push(newMovement);
    
    // Save both files
    if (writeJsonFile(inventoryDataPath, inventory) && writeJsonFile(stockMovementsPath, movements)) {
      res.json({
        item: inventory[itemIndex],
        movement: newMovement
      });
    } else {
      res.status(500).json({ error: 'Failed to update inventory and record movement' });
    }
  } catch (error) {
    console.error('Error processing stock movement:', error);
    res.status(500).json({ error: 'Failed to process stock movement' });
  }
});

export default router;
