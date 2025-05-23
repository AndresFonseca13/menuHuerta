const express = require('express');
const { getAllCocktailsService } = require('../services/cocktailsService');

const getAllCocktails = async (req, res) =>{
    try{
        const cocktails = await getAllCocktailsService();
        res.status(200).json(cocktails);
        console.log(cocktails);
        
    }catch (error){
        console.error('Error al obtener los cócteles:', error);
        res.status(500).json({ mensaje: 'Error al obtener los cócteles', error });
    }
}

module.exports = {
    getAllCocktails
}


