const createIngredient = require('./cretaeIngredientService');
const deleteIngredient = require('./deleteIngredientService');
const getAllIngredients = require('./getAllIngredientsService');
const getIngredientById = require('./getIngredientByIdService');
const updateIngredient = require('./updateIngredientService');


module.exports = {
    createIngredient,
    deleteIngredient,
    getAllIngredients,
    getIngredientById,
    updateIngredient,
}