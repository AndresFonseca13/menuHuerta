const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middleware/authMiddleware');


router.post('/', authMiddleware, categoryController.createCategory);
router.delete('/:id', authMiddleware, categoryController.deleteCategory);
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);



module.exports = router;