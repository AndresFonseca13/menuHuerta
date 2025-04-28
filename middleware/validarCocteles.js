const express = require('express');

const validarCoctel = (cocteles) => (req, res, next) =>{

    const {nombre, ingredientes, precio} = req.body;

    const existeCoctel = cocteles.find(c => c.nombre.toLowerCase() === nombre.toLowerCase());
    if(existeCoctel){
        return res.status(400).json({mensaje: "El coctel ya existe"})
    }
    
    if(!nombre || !ingredientes || !precio){
        return res.status(400).json({mensaje: "Faltan datos"})
    }

    if(typeof nombre !== 'string' || typeof precio !== 'number'){
        return res.status(400).json({mensaje: "Datos incorrectos"})
    }

    if(!Array.isArray(ingredientes) || ingredientes.length === 0){
        return res.status(400).json({mensaje: "Ingredientes incorrectos"})
    }

    if(precio <= 0){
        return res.status(400).json({mensaje: "Precio incorrecto"})
    }

    next();
}

module.exports = validarCoctel;