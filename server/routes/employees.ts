import { Router } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();
const dataFilePath = path.join(__dirname, '../data/employees.json');

const readData = () => {
    const data = fs.readFileSync(dataFilePath, 'utf8');
    return JSON.parse(data);
};

const writeData = (data: any) => {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
};

router.get('/', (req, res) => {
    try {
        const data = readData();
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: 'Error reading data' });
    }
});

router.get('/:id', (req, res) => {
    try {
        const data = readData();
        const item = Array.isArray(data) ? data.find((i: any) => i.id === req.params.id) : data;
        if (item) {
            res.json(item);
        } else {
            res.status(404).json({ message: 'Item not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error reading data' });
    }
});

router.post('/', (req, res) => {
    try {
        const data = readData();
        if (Array.isArray(data)) {
            const newItem = { id: `${req.originalUrl.split("/")[2].toUpperCase().slice(0, 3)}-${Date.now()}`, ...req.body };
            data.push(newItem);
            writeData(data);
            res.status(201).json(newItem);
        } else {
            res.status(400).json({ message: 'Cannot create item for this endpoint' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error creating item' });
    }
});

router.put('/:id', (req, res) => {
    try {
        let data = readData();
        if (Array.isArray(data)) {
            const index = data.findIndex((i: any) => i.id === req.params.id);
            if (index !== -1) {
                data[index] = { ...data[index], ...req.body };
                writeData(data);
                res.json(data[index]);
            } else {
                res.status(404).json({ message: 'Item not found' });
            }
        } else {
            data = { ...data, ...req.body };
            writeData(data);
            res.json(data);
        }
    } catch (error) {
        res.status(500).json({ message: 'Error updating item' });
    }
});

router.delete('/:id', (req, res) => {
    try {
        let data = readData();
        if (Array.isArray(data)) {
            const index = data.findIndex((i: any) => i.id === req.params.id);
            if (index !== -1) {
                data[index].isDeleted = true;
                writeData(data);
                res.status(200).json({ message: 'Employee soft deleted' });
            } else {
                res.status(404).json({ message: 'Item not found' });
            }
        } else {
            res.status(400).json({ message: 'Cannot delete from this endpoint' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error deleting item' });
    }
});

export default router;
