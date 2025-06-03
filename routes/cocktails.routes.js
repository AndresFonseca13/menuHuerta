const express = require('express');
const router = express.Router();
const cocktailController = require('../controllers/cocktailControler');
const validateBodyCocktail = require('../middleware/validateBodyCocktail');
const validateCategories = require('../middleware/validateCategories');
const validateIngredients = require('../middleware/validateIngredients');
const authMiddleware = require('../middleware/authMiddleware');


router.get('/', cocktailController.getAllCocktails);

router.get("/:id", cocktailController.getCocktailById);

router.post('/', authMiddleware, validateBodyCocktail, validateCategories, validateIngredients, cocktailController.createCocktail);

router.put('/:id', authMiddleware, validateBodyCocktail, validateCategories, validateIngredients, cocktailController.updateCocktail);

router.delete('/:id', authMiddleware, cocktailController.deleteCocktail);

module.exports = router;

