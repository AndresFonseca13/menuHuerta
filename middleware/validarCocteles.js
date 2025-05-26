const express = require('express');

const validarCoctel = (products) => (req, res, next) =>{
    
    const {name, ingredients, price, description} = req.body;
    
    const existProduct = products.find(p => p.name.toLowerCase() === name.toLowerCase());

    if(existProduct){
        return res.status(400).json({mensaje: "El coctel ya existe"})
    }
    
    if(!name || !ingredients || !description || !price){
        return res.status(400).json({mensaje: "Faltan datos"})
    }

    if(typeof name !== 'string' || typeof price !== 'number'){
        return res.status(400).json({mensaje: "Datos incorrectos"})
    }

    if(!Array.isArray(ingredients) || ingredients.length === 0){
        return res.status(400).json({mensaje: "Ingredientes incorrectos"})
    }

    if(price <= 0){
        return res.status(400).json({mensaje: "Precio incorrecto"})
    }
    
    next();
}

module.exports = validarCoctel;