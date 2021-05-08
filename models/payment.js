const mongoose = require('mongoose');
const { Schema, model } = require("mongoose");

// Create Schema
const PaymentSchema = new Schema({
    vendor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'vendor' },
    listing_id: { type: mongoose.Schema.Types.ObjectId, ref: 'listing' },
    payment_type: {
        type: String
    },
    paypal: {
        token: { type: String },
        payId: { type: String },
        payerId: { type: String }
    },
    amount: {
        type: Number
    },
    status: {
        type: String,
        enum: ['Pending', 'Cancelled', 'Paid', 'Unsuccesssfull'],
        default: 'Pending'
    },
    package: {
        name: {
            type: String
        },
        price: {
            type: Number
        }
    }
});

const Payment = model('payment', PaymentSchema);

module.exports = Payment;
