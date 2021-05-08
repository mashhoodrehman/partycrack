const { Schema, model } = require("mongoose");

// Create Schema
const SubscriptionSchema = new Schema({
    Name: {
        type: String,
        required: true
    },
    Price: {
        type: Number,
        required: true
    },
    Currency: {
        type: String,
        default: "AUD"
    }
},
    {
        timestamps: true
    }
);

const Subscription = model('subscription', SubscriptionSchema);

module.exports = Subscription;