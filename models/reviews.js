const mongoose = require('mongoose');
const { Schema, model } = require ("mongoose");

// Create Schema
const ReviewSchema = new Schema({
    listing_id: { type: mongoose.Schema.Types.ObjectId, ref: 'listing', required: true },
  name: {
    type: String,
    required: true
  },
  customer_image: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
 star_reviews: {
    type: String,
    required: true
  },
  
  date: {
    type: Date,
    default: Date.now
  }
});

const Review = model('reviews', ReviewSchema);

module.exports = Review;
