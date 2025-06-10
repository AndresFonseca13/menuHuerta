const createCategoryService = require('./createCategoryService');
const deleteCategoryService = require('./deleteCategoryService');
const getAllCategoriesService = require('./getAllCategoriesService');
const getCategoryByIdService = require('./getCategoryByIdService');
const updateCategory = require('./updateCategory');

module.exports = {
    createCategoryService,
    deleteCategoryService,
    getAllCategoriesService,
    getCategoryByIdService,
    updateCategory,
};