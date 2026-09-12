const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Product Endpoints
router.get('/', productController.getAllProducts);
router.post('/batch-stock-in', productController.batchStockIn);
router.post('/batch-reconciliation', productController.batchReconciliation);
router.post('/batch-locations', productController.batchUpdateLocations);
router.patch('/location/:id', productController.updateProductLocation);
router.get('/:id', productController.getProductById);
router.post('/', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'productImage', maxCount: 1 }]), productController.createProduct);
router.put('/:id', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'productImage', maxCount: 1 }]), productController.updateProduct);
router.patch('/archive/:id', productController.toggleArchiveProduct);
router.patch('/:id/archive', productController.toggleArchiveProduct);
router.delete('/:id', productController.deleteProduct);
router.patch('/restock/:id', productController.restockProduct);

module.exports = router;