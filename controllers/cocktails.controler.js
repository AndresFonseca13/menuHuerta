const express = require('express');
const cocktailsService = require('../services/cocktails/index');


const getAllCocktails = async (req, res) =>{
    try{
        const cocktails = await cocktailsService.getAllCocktailsService();
        res.status(200).json(cocktails);
        
    }catch (error){
        console.error('Error al obtener los cócteles:', error);
        res.status(500).json({ mensaje: 'Error al obtener los cócteles', error });
    }
}

const getCocktailById = async (req, res) => {
    const { id } = req.params;

    if (!id || isNaN(id)) {
        return res.status(400).json({ mensaje: 'ID inválido' });
    }
    try {
        const cocktail = await cocktailsService.getCocktailByIdService(id);
        if (!cocktail){
            return res.status(404).json({ mensaje: 'Cóctel no encontrado' });
        }
        res.status(200).json(cocktail);
    }catch( error ){
        console.error('Error al obtener el cóctel:', error);
        res.status(500).json({ mensaje: 'Error al obtener el cóctel', error });
    }
}

const createCocktail = async (req, res) => {
    
    const { name, price, description, ingredients, images } = req.body;
    
    if (!name || !price || !description || !ingredients || !images) {
        return res.status(400).json({ mensaje: 'Faltan datos requeridos' });
    }

    try {
        const cocktail = await cocktailsService.createCocktailService(name, price, description, ingredients, images);
        res.status(201).json({ mensaje: 'Cóctel creado exitosamente', cocktail });
    }catch (error) {
        if (error.status) {
            return res.status(error.status).json({ mensaje: error.message });
        }
        res.status(500).json({ mensaje: 'Error al crear el cóctel', error });
        console.log('Error al crear el cóctel:', error);
        
    }
}

const updateCocktail = async (req, res) => {
  const { id } = req.params;
  const { name, price, description, ingredients, images } = req.body;

  // Validaciones básicas
  if (
    !id || isNaN(id) ||
    !name || typeof name !== 'string' ||
    !description || typeof description !== 'string' ||
    typeof price !== 'number' || isNaN(price) ||
    !Array.isArray(ingredients) || ingredients.length === 0 ||
    !Array.isArray(images) || images.length === 0
  ) {
    return res.status(400).json({ mensaje: 'Datos inválidos o faltantes para actualizar' });
  }

  try {
    const updatedCocktail = await cocktailsService.updateCocktailService(id, name, price, description, ingredients, images);
    res.status(200).json({ mensaje: 'Cóctel actualizado exitosamente', updatedCocktail });
  } catch (error) {
    console.error('Error al actualizar el cóctel:', error);
    res.status(500).json({ mensaje: 'Error al actualizar el cóctel' });
  }
};

const deleteCocktail = async (req, res) => {
    const { id } = req.params;

    if(!id || isNaN(id)){
        return res.status(400).json({ mensaje: 'ID inválido' });
    }
    
    try{
        const deletedCocktail = await cocktailsService.deleteCocktailService(id);
        if (!deletedCocktail) {
            return res.status(404).json({ mensaje: 'Cóctel no encontrado' });
        }
        res.status(200).json({ mensaje: 'Cóctel eliminado exitosamente' });
    }catch (error) {
        console.error('Error al eliminar el cóctel:', error);
        res.status(500).json({ mensaje: 'Error al eliminar el cóctel', error });
    }
}

module.exports = {
    getAllCocktails,
    getCocktailById,
    createCocktail,
    updateCocktail,
    deleteCocktail
}




