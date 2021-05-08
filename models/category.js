const mongoose = require('mongoose');
const { Schema, model } = require("mongoose");

// Create Schema
const CategorySchema = new Schema({
    Catagories: [{
        Category: { type: String },
        SubCategory: [{ type: String }],
        Images: [{ type: String }]
    }]
});

const Category = model('category', CategorySchema);

module.exports = Category;
