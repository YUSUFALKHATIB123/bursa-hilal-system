import { Router } from 'express';
import multer from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();
const dataFilePath = path.join(__dirname, '../data/invoices.json');

// إعداد multer لرفع الملفات
const uploadsDir = path.join(__dirname, '../uploads/invoices');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `invoice-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'];
        const ext = path.extname(file.originalname).toLowerCase();
        if (allowedTypes.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF, JPG, PNG, DOC files are allowed.'));
        }
    }
});

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
            const newItem = { 
                id: `INV-${Date.now()}`, 
                date: new Date().toISOString().split('T')[0],
                createdAt: new Date().toISOString(),
                ...req.body 
            };
            data.push(newItem);
            writeData(data);
            res.status(201).json(newItem);
        } else {
            res.status(400).json({ message: 'Invalid data format' });
        }
    } catch (error) {
        console.error('Error creating invoice:', error);
        res.status(500).json({ message: 'Error creating data' });
    }
});

// رفع ملفات الفواتير
router.post('/upload', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const fileInfo = {
            id: `UPLOAD-${Date.now()}`,
            originalName: req.file.originalname,
            filename: req.file.filename,
            path: req.file.path,
            size: req.file.size,
            mimetype: req.file.mimetype,
            uploadDate: new Date().toISOString()
        };

        // حفظ معلومات الملف في قاعدة البيانات
        const data = readData();
        if (Array.isArray(data)) {
            // ابحث عن فاتورة موجودة أو أنشئ جديدة
            const invoiceIndex = data.findIndex((invoice: any) => invoice.id === req.body.invoiceId);
            if (invoiceIndex !== -1) {
                data[invoiceIndex].attachedFile = fileInfo;
            } else {
                // إنشاء فاتورة جديدة مع الملف المرفق
                const newInvoice = {
                    id: `INV-${Date.now()}`,
                    date: new Date().toISOString().split('T')[0],
                    customer: req.body.customer || 'Unknown',
                    amount: req.body.amount || 0,
                    status: 'uploaded',
                    attachedFile: fileInfo,
                    createdAt: new Date().toISOString()
                };
                data.push(newInvoice);
            }
            writeData(data);
        }

        res.json({
            message: 'File uploaded successfully',
            file: fileInfo
        });

    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ message: 'Error uploading file' });
    }
});

// تحميل الملفات المرفقة
router.get('/download/:filename', (req, res) => {
    try {
        const filename = req.params.filename;
        const filePath = path.join(uploadsDir, filename);
        
        if (fs.existsSync(filePath)) {
            res.download(filePath);
        } else {
            res.status(404).json({ message: 'File not found' });
        }
    } catch (error) {
        console.error('Error downloading file:', error);
        res.status(500).json({ message: 'Error downloading file' });
    }
});
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
            const initialLength = data.length;
            data = data.filter((i: any) => i.id !== req.params.id);
            if (data.length < initialLength) {
                writeData(data);
                res.status(204).send();
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
