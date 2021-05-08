const { Schema, model } = require ("mongoose");

// Create Schema
const VendorSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  mobile_number:{
    type:String
  },
  phone: [{
    Phone: {type: String},
    OTP: {type: String, default: ""},
    Status: {type: String, default: "Pending"},
  }],
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  register_date: {
    type: Date,
    default: Date.now
  },
  address: {
    Address: {
      type: String
    },
    Lat: {
      type: String
    },
    Lng: {
      type: String
    }
  },
  otp: {
    type: Number
  },
  status: {
    type: Boolean,
    default: false
  }
});

const Vendor = model('vendor', VendorSchema);

module.exports = Vendor;
