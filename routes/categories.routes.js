const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const authMiddleware = require('../middleware/authMiddleware');
const normalizeTextFields = require('../middleware/normalizeTextFields');


router.post('/', normalizeTextFields,authMiddleware, categoryController.createCategory);
router.delete('/:id', authMiddleware, categoryController.deleteCategory);
router.put('/:id', normalizeTextFields, authMiddleware, categoryController.updateCategory);
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);


module.exports = router;