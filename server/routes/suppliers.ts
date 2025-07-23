import { Router } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();
const dataFilePath = path.join(__dirname, '../data/suppliers.json');

const readData = () => {
    const data = fs.readFileSync(dataFilePath, 'utf8');
    return JSON.parse(data);
};

const writeData = (data: any) => {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
};

// إعداد مجلد رفع فواتير الموردين
const supplierInvoicesDir = path.join(__dirname, '../uploads/supplier-invoices');
if (!fs.existsSync(supplierInvoicesDir)) {
    fs.mkdirSync(supplierInvoicesDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, supplierInvoicesDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `supplier-invoice-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF, JPG, PNG files are allowed.'));
        }
    }
});

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
                res.status(200).json({ message: 'Supplier soft deleted' });
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

// جلب جميع فواتير مورد معين
router.get('/:id/invoices', (req, res) => {
    try {
        const data = readData();
        const supplier = Array.isArray(data) ? data.find((i: any) => i.id === req.params.id) : null;
        if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
        res.json(supplier.invoices || []);
    } catch (error) {
        res.status(500).json({ message: 'Error reading supplier invoices' });
    }
});

// إضافة فاتورة جديدة لمورد (مع رفع ملف)
router.post('/:id/invoices', upload.single('file'), (req, res) => {
    try {
        const data = readData();
        const supplierIndex = Array.isArray(data) ? data.findIndex((i: any) => i.id === req.params.id) : -1;
        if (supplierIndex === -1) return res.status(404).json({ message: 'Supplier not found' });

        const { date, quantity, notes } = req.body;
        const file = req.file;
        if (!file) return res.status(400).json({ message: 'No file uploaded' });

        const invoice = {
            id: `SUPINV-${Date.now()}`,
            date,
            quantity,
            notes,
            file: {
                originalName: file.originalname,
                filename: file.filename,
                path: file.path,
                size: file.size,
                mimetype: file.mimetype,
                uploadDate: new Date().toISOString()
            }
        };
        if (!data[supplierIndex].invoices) data[supplierIndex].invoices = [];
        data[supplierIndex].invoices.push(invoice);
        writeData(data);
        res.status(201).json(invoice);
    } catch (error) {
        res.status(500).json({ message: 'Error saving supplier invoice' });
    }
});

// تعديل فاتورة مورد
router.put('/:id/invoices/:invoiceId', (req, res) => {
    try {
        const data = readData();
        const supplierIndex = Array.isArray(data) ? data.findIndex((i: any) => i.id === req.params.id) : -1;
        if (supplierIndex === -1) return res.status(404).json({ message: 'Supplier not found' });

        const invoices = data[supplierIndex].invoices || [];
        const invoiceIndex = invoices.findIndex((inv: any) => inv.id === req.params.invoiceId);
        if (invoiceIndex === -1) return res.status(404).json({ message: 'Invoice not found' });

        invoices[invoiceIndex] = { ...invoices[invoiceIndex], ...req.body };
        data[supplierIndex].invoices = invoices;
        writeData(data);
        res.json(invoices[invoiceIndex]);
    } catch (error) {
        res.status(500).json({ message: 'Error updating supplier invoice' });
    }
});

// تحميل ملف فاتورة مورد
router.get('/:id/invoices/download/:filename', (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(supplierInvoicesDir, filename);
        if (fs.existsSync(filePath)) {
            res.download(filePath);
        } else {
            res.status(404).json({ message: 'File not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error downloading file' });
    }
});

export default router;
