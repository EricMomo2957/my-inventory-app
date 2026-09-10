const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
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

// User Management Endpoints
router.get('/', userController.getAllUsers);
router.get('/all', userController.getAllUsers);
router.get('/profile', userController.getUserProfile);
router.get('/:id', userController.getUserProfile);
router.post('/', userController.createUser);
router.put('/update', upload.single('profile_pic'), userController.updateProfile);
router.put('/:id', userController.updateUser);
router.patch('/update-password/:id', userController.updatePassword);
router.delete('/:id', userController.deleteUser);

module.exports = router;