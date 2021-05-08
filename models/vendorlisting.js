const mongoose = require('mongoose');
const { Schema, model } = require ("mongoose");

// Create Schema
const ListingSchema = new Schema({
  vendor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'vendor' },
  Payment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'payment' },
  Name: {
    type: String
  },
  Tagline: {
    type: String
  },
  Address: {
    Address: {
      type: String
    },
    Lat: {
      type: String
    },
    Lng: {
      type: String
    },
    State:{
      type:String,  
    },
    City:{
      type:String,  
    },
  },
  Phone_Number: {
    type: String
  },
  Mobile_Number: {
    type: String
  },
  Accept_Whatsapp: {
    type: Boolean,
    default: false
  },
  Completed: {
    type: Boolean,
    default: false
  },
  Availability: {
    Sunday: {
      Availability: Boolean,
      From: String,
      To: String,
    },
    Monday: {
      Availability: Boolean,
      From: String,
      To: String,
    },
    Tuesday: {
      Availability: Boolean,
      From: String,
      To: String,
    },
    Wednesday: {
      Availability: Boolean,
      From: String,
      To: String,
    },
    Thursday: {
      Availability: Boolean,
      From: String,
      To: String,
    },
    Friday: {
      Availability: Boolean,
      From: String,
      To: String,
    },
    Saturday: {
      Availability: Boolean,
      From: String,
      To: String,
    }
  },
  Category: {
    type: String
  },
  Sub_Category: {
    type: String
  },
  Photos: [{
    type: String
  }],
  Profile_Pic: {
    type: String
  },
  Description: {
    type: String
  },
  Industry_Experience: {
    type: String
  },
  Service: {
    Value: {
      type: Boolean,
      default: false
    },
    Options: {
      Inclusions: String,
      Exclusions: String,
      Takeaway_Only: Boolean,
      Food_Vehicle: Boolean
    }
  },
  Catering: {
    Halal_Menu: {
      type: Boolean
    },
    Kosher_Menu: {
      type: Boolean
    },
    Vegan_Menu: {
      type: Boolean
    },
    Vegetarian_Menu: {
      type: Boolean
    },
    Gluten_Free_Menu: {
      type: Boolean
    }
  },
  Menu: [{
    type: String
  }],
  Cusisine: [{
    type: String
  }],
  Price: [{
    Option: {
      type: String
    },
    Value: {
      type: String
    }
  }],
  Payment_Terms: {
    Option: {
      type: String
    },
    Percentage: {
      type: Number
    }
  },
  Status: {
    type: String,
    default: "Draft"
  },
  Cancellation_Policy: {
    type: String
  },
  Minimum_Group_Size: {
    type: String
  },
  Event_Types: [{
    type: String
  }],
  Payment:{
    type: String,
    default: "pending"
  },
  Social_Media_Links: {
    facebook: String,
    instagram: String,
    website: String,
    google: String,
    twitter: String
  },
  package: {
      name: {
          type: String
      },
      price: {
          type: String
      }
  }
},
  {
    timestamps: true
  }
);

const Listing = model('listing', ListingSchema);

module.exports = Listing;
