const express = require('express');
const { Router } = require("express");
const bcrypt = require("bcryptjs");
const Categories = require("../../config/Categories");
const auth = require("../../middleware/auth");
var jwt = require('jsonwebtoken');
var JWT_Key = 'sl_myJwtSecret';
const URL = require('url');
var ObjectID = require('mongodb').ObjectID;
var paypal = require('paypal-rest-sdk');
const Vendor = require("../../models/vendor");
const Review = require("../../models/reviews");
const Listing = require("../../models/vendorlisting");
const Payment = require("../../models/payment");
const Subscription = require("../../models/subscription");
const Category = require("../../models/category");
var ObjectID = require('mongodb').ObjectID;
const json = require("body-parser");
// const accountSid = "AC09851c49c81c1147749077942df693a0";
// const authToken = "28418c83f247a92486af69ba82731e18";
// const client = require('twilio')(accountSid, authToken);
const client = require('twilio')('AC09851c49c81c1147749077942df693a0', '28418c83f247a92486af69ba82731e18');
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey("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");
let frontendurl;
let serverurl;
// if (process.env.NODE_ENV === 'production') {
//   frontendurl = "http://localhost:3000/vendor-dashboard"
//   serverurl = "http://localhost:5001/api/auth"
// } else {
//   frontendurl = "http://localhost:3000/vendor-dashboard"
//   serverurl = "http://localhost:5001/api/auth"
// }
if (process.env.NODE_ENV === 'production') {
  frontendurl = "http://partycrack.ivylabtech.com/vendor-dashboard"
  serverurl = "http://93.188.166.179:3000/api/auth"
} else {
  frontendurl = "http://partycrack.ivylabtech.com/vendor-dashboard"
  serverurl = "http://93.188.166.179:3000/api/auth"
}

paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AWEU4GfnXxgH9Bc3QLm0rpuHk798Vf2He8ReXjIuR_uIVim3iA7lqSf61P2eNZDIoKExfVx6GCWw1zx0',
  'client_secret': 'EAOaR4cFkZ4eb_vPxY2XJUuVNezCTqxYgDZ59bm_d2Y_vLpLjeJay7rcZcBtNavdmLWRUMUc4nc55529'
});
module.exports = {
  // Token: function Token(req, res, next) {
  //   console.log("Token")
  //   if (!req.headers.authorization) {
  //     return res.status(403).json({
  //       message: 'No credentials sent!',
  //       error: true,
  //     });
  //   }

  //   var token = req.headers.authorization.split(' ');

  //   jwt.verify(token[1], JWT_Key, (err, data) => {
  //     if (err) {
  //       err.error = true;
  //       res.status(403).json(err);
  //     } else {
  //       req.userData = data;
  //       next();
  //     }
  //   });
  // },

  vendorlogin: async function (req, res) {
    const { email, password } = req.body;
    // Simple validation
    if (!email || !password) {
      return res.status(400).json({ msg: 'Please enter all fields' });
    }
    try {
      // Check for existing user
      const vendor = await Vendor.findOne({ email });
      if (!vendor) {
        return res.json({ Error: true, msg: 'User does not exist' });
      }
      const isMatch = await bcrypt.compare(password, vendor.password);
      if (!isMatch) {
        return res.json({ Error: true, msg: 'Invalid username or password' });
      }
      // if(!vendor) throw Error({Error: true,msg:'User does not exist'});
      // if (!isMatch) throw Error({Error: true,msg:'Invalid credentials'});
      // if (!token) throw Error('Couldnt sign the token');
      const token = jwt.sign({ id: vendor._id }, JWT_Key, { expiresIn: 360000 });
      if (!token) {
        return res.json({ Error: true, msg: "Couldn't sign the token" });
      }
      if (vendor.status == true) {
        res.status(200).json({
          status: vendor.status,
          token,
          vendor: {
            id: vendor._id,
            name: vendor.name,
            email: vendor.email
          }
        });
      } else {
        var OTP = Math.floor(100000 + Math.random() * 900000)
        Vendor.findOneAndUpdate({ _id: vendor._id }, { $set: { otp: OTP } }).then(result => {
          const msg = {
            to: vendor.email, // Change to your recipient
            from: 'IvyLab Technologies <syedhas31@gmail.com>', // Change to your verified sender
            subject: 'Verification',
            text: 'Hello World',
            html: `<!DOCTYPE html>
          <html>
          <head>
          </head>
          <body>
            <div style="border: 3px solid #f6bcd5;">
              <h2 style="font-weight: 400;margin-left:15px;">Your OTP is:  ${OTP}</h2>
            </div>
          </body>
          </html>`,
          }
          console.log(OTP)
          sgMail.send(msg)
            .then(() => {
              res.status(200).json({
                status: vendor.status,
                token,
                vendor: {
                  id: vendor._id,
                  name: vendor.name,
                  email: vendor.email
                }
              });
            })
        }).catch(error => {
          return res.json(error);
        })
      }
    } catch (e) {
      res.status(400).json({ msg: e.message });
    }
  },

  resendotp: async function (req, res) {
    var OTP = Math.floor(100000 + Math.random() * 900000)
    Vendor.findOneAndUpdate({ _id: req.body.id }, { $set: { otp: OTP } }).then(result => {
      const token = jwt.sign({ id: result._id }, JWT_Key, { expiresIn: 360000 });
      if (!token) throw Error('Couldnt sign the token');
      const msg = {
        to: result.email, // Change to your recipient
        from: 'IvyLab Technologies <syedhas31@gmail.com>', // Change to your verified sender
        subject: 'Verification',
        text: 'Hello World',
        html: `<!DOCTYPE html>
          <html>
          <head>
          </head>
          <body>
            <div style="border: 3px solid #f6bcd5;">
              <h2 style="font-weight: 400;margin-left:15px;">Your OTP is:  ${OTP}</h2>
            </div>
          </body>
          </html>`,
      }
      console.log(OTP)
      sgMail.send(msg)
        .then(() => {
          res.status(200).json({
            message: 'success',
            email: 'Email sent',
            token,
            vendor: {
              id: result._id,
              name: result.name,
              email: result.email
            }
          });
        })
    }).catch(error => {
      return res.json(error);
    })
  },

  resendotpmobile: async function (req, res) {
    var OTP = Math.floor(100000 + Math.random() * 900000)
    client.messages
      .create({
        to: req.body.Mobile_Number,
        from: '+19048539214',
        body: `Your OTP is:  ${OTP}`
      })
      .then(result => {
        return res.json({
          Error: false,
          msg: "Message sent for mobile number verification."
        });
      }).catch(error => {
        return res.json(error)
      })
  },

  // updatestatus: function (req, res) {
  //   Vendor.findOneAndUpdate({ _id: req.params.id }, { $set: { status: true } }).then(result => {
  //     return res.json({
  //       Error: false,
  //       Msg: "Status Updated."
  //     });
  //   }).catch(error => {
  //     return res.json(error);
  //   })
  // },

  vendorregister: async function (req, res) {
    const { name, email, password, phone } = req.body;

    // console.log(req.body)
    // Simple validation
    if (!name || !email || !password) {
      return res.status(400).json({ msg: 'Please enter all fields' });
    }
    try {
      const vendor = await Vendor.findOne({ email });
      if (vendor) {
        res.json({
          status: false,
          msg: "user already exist"
        })
      }
      const salt = await bcrypt.genSalt(10);
      if (!salt) throw Error('Something went wrong with bcrypt');

      const hash = await bcrypt.hash(password, salt);
      if (!hash) throw Error('Something went wrong hashing the password');

      let mobile_number = ""
      if (req.body.mobile_number) {
        mobile_number = req.body.mobile_number
      }
      const newVendor = new Vendor({
        name,
        email,
        password: hash,
        mobile_number
      });
      const savedVendor = await newVendor.save();
      if (!savedVendor) throw Error('Something went wrong saving the user');
      const token = jwt.sign({ id: savedVendor._id }, JWT_Key, { expiresIn: 360000 });
      if (!token) throw Error('Couldnt sign the token');
      var OTP = Math.floor(100000 + Math.random() * 900000)
      Vendor.findOneAndUpdate({ _id: savedVendor.id }, { $set: { otp: OTP } }).then(result => {
        const msg = {
          to: savedVendor.email, // Change to your recipient
          from: 'IvyLab Technologies <syedhas31@gmail.com>', // Change to your verified sender
          subject: 'Verification',
          text: 'Hello World',
          html: `<!DOCTYPE html>
          <html>
          <head>
          </head>
          <body>
            <div style="border: 3px solid #f6bcd5;">
              <h2 style="font-weight: 400;margin-left:15px;">Your OTP is:  ${OTP}</h2>
            </div>
          </body>
          </html>`,
        }
        console.log(OTP)
        sgMail.send(msg)
          .then(() => {
            res.status(200).json({
              message: 'success',
              email: 'Email sent',
              token,
              vendor: {
                id: savedVendor.id,
                name: savedVendor.name,
                email: savedVendor.email
              }
            });
          })
      }).catch(error => {
        return res.json(error);
      })
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  },
  index: async function (req, res) {
    let id = req.user.id
    // console.log(req.user)
    const docCount = await Listing.countDocuments({ vendor_id: id, Status: { $ne: "Disabled" } })
    Listing.find({ vendor_id: id, Status: { $ne: "Disabled" } })
      .sort({ createdAt: -1 })
      .exec(function (err, list) {
        if (err) {
          res.send(err)
        }
        else {
          res.send({
            success: true,
            message: "listing fetched successfully",
            count: docCount,
            listing: list
          })
        }
      })
  },

  SaveListing: function (req, res) {
    let men = []
    let pho = []
    if (req.body.Saved_Menu) {
      req.body.Saved_Menu = JSON.parse(req.body.Saved_Menu)
      for (let i = 0; i < req.body.Saved_Menu.length; i++) {
        men.push(req.body.Saved_Menu[i]);
      }
    }
    if (req.body.Saved_Photos) {
      req.body.Saved_Photos = JSON.parse(req.body.Saved_Photos)
      for (let i = 0; i < req.body.Saved_Photos.length; i++) {
        pho.push(req.body.Saved_Photos[i]);
      }
    }
    if (req.body.Saved_Profile_Pic) {
      req.body.Profile_Pic = req.body.Saved_Profile_Pic;
    }
    if (req.body.Service) {
      req.body.Service = JSON.parse(req.body.Service)
    }
    if (req.body.Catering) {
      req.body.Catering = JSON.parse(req.body.Catering)
    }
    if (req.body.Address) {
      req.body.Address = JSON.parse(req.body.Address)
    }
    if (req.body.Availability) {
      req.body.Availability = JSON.parse(req.body.Availability)
    }
    if (req.body.package) {
      req.body.package = JSON.parse(req.body.package)
    }
    if (req.body.Social_Media_Links) {
      req.body.Social_Media_Links = JSON.parse(req.body.Social_Media_Links)
    }
    if (req.body.Payment_Terms) {
      req.body.Payment_Terms = JSON.parse(req.body.Payment_Terms)
    }
    if (req.body.Price) {
      req.body.Price = JSON.parse(req.body.Price)
    }
    req.body.Completed = true
    if (req.files.Menu) {
      if (req.files.Menu.length > 0) {
        for (let i = 0; i < req.files.Menu.length; i++) {
          men.push(req.files.Menu[i].filename)
        }
      }
    }
    if (req.files.Photos) {
      if (req.files.Photos.length > 0) {
        for (let i = 0; i < req.files.Photos.length; i++) {
          pho.push(req.files.Photos[i].filename)
        }
      }
    }
    req.body.Menu = men
    req.body.Status = "Draft"
    req.body.Photos = pho
    if (req.files.Profile_Pic) {
      if (req.files.Profile_Pic) {
        req.body.Profile_Pic = req.files.Profile_Pic[0].filename
      }
    }
    let listing = new Listing(req.body);
    listing.save(function (err) {
      if (err) {
        res.send({
          err: err
        })
      }
      else {
        res.send({
          success: true,
          listing: listing
        })
      }
    })
  },

  addListing: function (req, res) {

    let men = []
    let pho = []
    if (req.body.Saved_Menu) {
      req.body.Saved_Menu = JSON.parse(req.body.Saved_Menu)
      for (let i = 0; i < req.body.Saved_Menu.length; i++) {
        men.push(req.body.Saved_Menu[i]);
      }
    }
    if (req.body.Saved_Photos) {
      req.body.Saved_Photos = JSON.parse(req.body.Saved_Photos)
      for (let i = 0; i < req.body.Saved_Photos.length; i++) {
        pho.push(req.body.Saved_Photos[i]);
      }
    }
    if (req.body.Saved_Profile_Pic) {
      req.body.Profile_Pic = req.body.Saved_Profile_Pic;
    }
    // res.json({files:req.files,body:req.body})
    // console.log(req.filses)
    req.body.Address = JSON.parse(req.body.Address)
    req.body.Service = JSON.parse(req.body.Service)
    req.body.Catering = JSON.parse(req.body.Catering)
    req.body.Availability = JSON.parse(req.body.Availability)
    req.body.Social_Media_Links = JSON.parse(req.body.Social_Media_Links)
    req.body.Payment_Terms = JSON.parse(req.body.Payment_Terms)
    req.body.Price = JSON.parse(req.body.Price)
    req.body.package = JSON.parse(req.body.package)

    req.body.Completed = true
    // console.log(req.files)
    // console.log(req.body)
    // res.json({files:req.files,body:req.body});
    // console.log("req.files",req.files)
    if (req.files.Menu) {
      for (let i = 0; i < req.files.Menu.length; i++) {
        men.push(req.files.Menu[i].filename)
      }
    }
    if (req.files.Photos) {
      for (let i = 0; i < req.files.Photos.length; i++) {
        pho.push(req.files.Photos[i].filename)
      }
    }
    req.body.Menu = men
    req.body.Photos = pho
    // req.body.Profile_Pic = "req.files.Photos"
    if (req.files.Profile_Pic) {
      req.body.Profile_Pic = req.files.Profile_Pic[0].filename
    }
    // req.body.Menu = ""
    // req.body.Photos = ""
    // req.body.Profile_Pic = ""
    // console.log(req.body)
    let listing = new Listing(req.body);
    listing.save(function (err) {
      if (err) {
        res.send({
          err: err
        })
      }
      else {
        return res.json({
          success: true,
          listing: listing
        });
      }
    })
  },

  editlisting: function (req, res) {
    // console.log(req.body)
    let men = []
    let pho = []
    if (req.body.Saved_Menu) {
      req.body.Saved_Menu = JSON.parse(req.body.Saved_Menu)
      for (let i = 0; i < req.body.Saved_Menu.length; i++) {
        men.push(req.body.Saved_Menu[i]);
      }
    }
    if (req.body.Saved_Photos) {
      req.body.Saved_Photos = JSON.parse(req.body.Saved_Photos)
      for (let i = 0; i < req.body.Saved_Photos.length; i++) {
        pho.push(req.body.Saved_Photos[i]);
      }
    }
    if (req.body.Saved_Profile_Pic) {
      req.body.Profile_Pic = req.body.Saved_Profile_Pic;
    }
    if (req.files.Menu) {
      for (let i = 0; i < req.files.Menu.length; i++) {
        men.push(req.files.Menu[i].filename)
      }
    }
    if (req.files.Photos) {
      for (let i = 0; i < req.files.Photos.length; i++) {
        pho.push(req.files.Photos[i].filename)
      }
    }
    req.body.Menu = men
    req.body.Photos = pho
    if (req.files.Profile_Pic) {
      req.body.Profile_Pic = req.files.Profile_Pic[0].filename
    }
    Listing.findOneAndUpdate({ _id: req.body.id }, {
      $set: {
        Name: req.body.Name,
        Tagline: req.body.Tagline,
        Address: JSON.parse(req.body.Address),
        Phone_Number: req.body.Phone_Number,
        Mobile_Number: req.body.Mobile_Number,
        Accept_Whatsapp: req.body.Accept_Whatsapp,
        Availability: JSON.parse(req.body.Availability),
        Category: req.body.Category,
        Sub_Category: req.body.Sub_Category,
        Photos: req.body.Photos,
        Profile_Pic: req.body.Profile_Pic,
        Description: req.body.Description,
        Industry_Experience: req.body.Industry_Experience,
        Service: JSON.parse(req.body.Service),
        Catering: JSON.parse(req.body.Catering),
        Menu: req.body.Menu,
        Cusisine: req.body.Cusisine,
        Price: JSON.parse(req.body.Price),
        Payment_Terms: JSON.parse(req.body.Payment_Terms),
        Cancellation_Policy: req.body.Cancellation_Policy,
        Minimum_Group_Size: req.body.Minimum_Group_Size,
        Event_Types: req.body.Event_Types,
        Social_Media_Links: JSON.parse(req.body.Social_Media_Links),
        Status: req.body.Status
      }
    }).then(result => {
      return res.json({
        Error: false,
        Msg: "Updated Successfully"
      });
    }).catch(error => {
      return res.json(error);
    })
  },

  deletelisting: function (req, res) {
    Listing.findOneAndUpdate({ _id: req.body.id }, { $set: { Status: "Disabled" } }).then(result => {
      return res.json({
        success: true,
        listing: result
      });
    }).catch(error => {
      return res.json(error);
    })
  },

  getvendorlist: function (req, res) {
    Listing.find({ role: "Admin" }).then(data => {
      return res.json({
        listing: data,
        Error: false
      });
    }).catch(error => {
      return res.json(error);
    })
  },

  savedlisting: function (req, res) {
    Listing.findOne({ vendor_id: req.params.id }).then(result => {
      return res.json({
        Error: false,
        data: result
      });
    }).catch(error => {
      return res.json(error);
    })
  },

  forgotpassword: function (req, res) {
    Vendor.findOne({ email: req.body.email }).then(result => {
      if (result) {
        const msg = {
          to: req.body.email, // Change to your recipient
          from: 'IvyLab Technologies <syedhas31@gmail.com>', // Change to your verified sender
          subject: 'Reset Password',
          text: 'Hello World',
          html: `<!DOCTYPE html>
          <html>
          <head>
          </head>
          <body>
            <div style="border: 3px solid #f6bcd5;">
              <h2 style="font-weight: 400;margin-left:15px;"><a style="color:#12086d" href="${frontendurl}/reset-password/${result._id}">
              Click Here To Reset Password
          </a></h2>
            </div>
          </body>
          </html>`,
        }
        sgMail.send(msg)
          .then(() => {
            res.status(200).json({
              Error: false,
              msg: "Email sent for reset password."
            });
          })
      } else {
        return res.json({
          Error: false,
          msg: "User not Found"
        });
      }
    }).catch(error => {
      return res.json(error);
    })
  },

  resetpassword: async function (req, res) {
    const salt = await bcrypt.genSalt(10);
    if (!salt) throw Error('Something went wrong with bcrypt');
    const hash = await bcrypt.hash(req.body.password, salt);
    Vendor.findOneAndUpdate({ _id: req.body.id }, { $set: { password: hash } }).then(result => {
      return res.json({
        Error: false,
        msg: "Password updated successfully."
      });
    }).catch(error => {
      return res.json(error);
    })
  },

  vendorprofile: function (req, res) {
    Vendor.findOne({ _id: req.params.id }).then(result => {
      return res.json({
        Error: false,
        data: result
      });
    }).catch(error => {
      return res.json(error);
    })
  },

  getlisting: function (req, res) {
    Listing.findOne({ _id: req.params.id }).then(result => {
      return res.json({
        Error: false,
        data: result
      });
    }).catch(error => {
      return res.json(error);
    })
  },

  getcategories: function (req, res) {
    Category.find({}).then(result => {
      return res.json({
        Error: false,
        data1: result[0].Catagories
      });
    }).catch(error => {
      return res.json(error);
    })
  },

  categoriesforhome: function (req, res) {
    Category.find({}, { "Catagories.Category": 1, "Catagories.SubCategory": 1, "Catagories.Images": 1 }).then(result => {
      return res.json(result[0].Catagories);
    }).catch(error => {
      return res.json(error);
    })
  },

  otpverification: function (req, res) {
    Vendor.findOne({ _id: req.body.id }).then(result => {
      console.log(result.otp)
      if (result.otp == req.body.otp) {
        Vendor.findOneAndUpdate({ _id: req.body.id }, { $set: { status: true } }).then(resul => {
          return res.json({
            Error: false,
            data: result
          });
        }).catch(error => {
          return res.json(error);
        })
      } else {
        return res.json({
          Error: true,
          msg: "OTP is not valid."
        });
      }
    }).catch(error => {
      return res.json(error);
    })
  },

  mobileotpverification: function (req, res) {
    Vendor.findOne({ "phone.Phone": req.body.Mobile_Number }).then(result => {
      if (result) {
        console.log(req.body)
        for (let i = 0; i < result.phone.length; i++) {
          if (result.phone[i].Phone == req.body.Mobile_Number) {
            if (result.phone[i].OTP == req.body.OTP) {
              Vendor.findOneAndUpdate({ "phone.Phone": req.body.Mobile_Number }, { $set: { "phone.$.Status": "Verified" } }).then(resul => {
                return res.json({
                  Error: false,
                  msg: "Status Updated"
                });
              }).catch(error => {
                return res.json(error);
              })
            } else {
              return res.json({
                Error: true,
                msg: "OTP is not valid."
              });
            }
          }
        }
      }
    }).catch(error => {
      return res.json(error);
    })
  },

  editvendorprofile: function (req, res) {
    if (req.files.Profile_Pic) {
      req.body.Profile_Pic = req.files.Profile_Pic[0].filename
    }
    Vendor.findOneAndUpdate({ _id: req.body.id }, req.body, { new: true }).then(result => {
      return res.json({
        Error: false,
        data: result
      });
    }).catch(error => {
      return res.json(error);
    })
  },

  activatedlisting: function (req, res) {
    Listing.findOneAndUpdate({ _id: req.body.id }, { $set: { Status: "Activated" } }, { new: true }).then(result => {
      return res.json({
        Error: false,
        data: result
      });
    }).catch(error => {
      return res.json(error);
    })
  },

  suspendlisting: function (req, res) {
    Listing.findOneAndUpdate({ _id: req.body.id }, { $set: { Status: "Suspended" } }, { new: true }).then(result => {
      return res.json({
        Error: false,
        data: result
      });
    }).catch(error => {
      return res.json(error);
    })
  },

  getreviews: function (req, res) {
    Review.find({ listing_id: req.params.id }).then(result => {
      return res.json({
        Error: false,
        data: result
      });
    }).catch(error => {
      return res.json(error);
    })
  },

  addcategories: function (req, res) {
    let cat = new Category(req.body);
    cat.save(function (err) {
      if (err) {
        res.send({
          err: err
        })
      }
      else {
        return res.json({
          Error: false,
          data: cat
        });
      }
    })
  },

  subscriptions: function (req, res) {
    Subscription.find({}).then(result => {
      return res.json({
        Error: false,
        data: result
      });
    }).catch(error => {
      return res.json(error);
    })
  },

  alllistings: function (req, res) {
    Listing.find({ vendor_id: req.params.id, Status: { $ne: "Disabled" } }).then(listing => {
      return res.json({
        Error: false,
        data: listing
      });
    }).catch(error => {
      return res.json(error);
    })
  },

  checkMobile: function (req, res) {
    var OTP = Math.floor(100000 + Math.random() * 900000)
    console.log(OTP)
    Vendor.findOneAndUpdate({ "phone.Phone": req.body.Mobile_Number }, { $set: { "phone.$.OTP": OTP } }, { new: true }).then(result => {
      if (result) {
        for (let i = 0; i < result.phone.length; i++) {
          if (result.phone[i].Phone == req.body.Mobile_Number) {
            if (result.phone[i].Status == "Verified") {
              res.status(200).json({
                Error: false,
                msg: "Mobile is already verified."
              });
            } else {
              console.log("hi")
              // res.status(200).json({
              //   Error: false,
              //   msg: "Message sent for mobile number verification."
              // });
              client.messages
                .create({
                  /*  to: req.body.Mobile_Number */
                  to: '+923246486607',
                  from: '+19048539214',
                  body: `Your OTP is:  ${OTP}`
                })
                .then(result => {
                  return res.json({
                    Error: false,
                    msg: "Message sent for mobile number verification."
                  });
                }).catch(error => {
                  return res.json(error)
                })
              // message => console.log(message.sid));
              // const msg = {
              //   to: req.body.email,
              //   from: 'IvyLab Technologies <syedhas31@gmail.com>',
              //   subject: 'Mobile Number Verification',
              //   text: 'Hello World',
              //   html: `<!DOCTYPE html>
              //       <html>
              //       <head>
              //       </head>
              //       <body>
              //         <div style="border: 3px solid #f6bcd5;">
              //           <h2 style="font-weight: 400;margin-left:15px;">Your OTP is:  ${OTP}</h2>
              //         </div>
              //       </body>
              //       </html>`,
              // }
              // sgMail.send(msg)
              //   .then(() => {
              //     res.status(200).json({
              //       Error: false,
              //       msg: "Email sent for mobile number verification."
              //     });
              //   })
            }
          }
        }
      } else {
        let phone = { Phone: req.body.Mobile_Number, OTP: OTP };
        Vendor.findOneAndUpdate({ _id: req.body.vendor_id }, { $push: { phone: phone } }, { new: true }).then(result => {
          // console.log(`Your OTP is:  ${OTP}`)
          // console.log(client.messages)
          // res.status(200).json({
          //   Error: false,
          //   msg: "Message sent for mobile number verification."
          // });
          client.messages
            .create({
              /*  to: req.body.Mobile_Number, */
              to: '+923246486607',
              from: '+19048539214',
              body: `Your OTP is:  ${OTP}`
            })
            .then(message => {
              return res.json({
                Error: false,
                msg: "Message sent for mobile number verification."
              });
            }).catch(error => {
              return res.json(error)
            })
          // const msg = {
          //   to: req.body.email,
          //   from: 'IvyLab Technologies <syedhas31@gmail.com>',
          //   subject: 'Mobile Number Verification',
          //   text: 'Hello World',
          //   html: `<!DOCTYPE html>
          //       <html>
          //       <head>
          //       </head>
          //       <body>
          //         <div style="border: 3px solid #f6bcd5;">
          //           <h2 style="font-weight: 400;margin-left:15px;">Your OTP is:  ${OTP}</h2>
          //         </div>
          //       </body>
          //       </html>`,
          // }
          // sgMail.send(msg)
          //   .then(() => {
          //     res.status(200).json({
          //       Error: false,
          //       msg: "Email sent for mobile number verification."
          //     });
          //   })
        }).catch(error => {
          return res.json(error);
        })
      }
    }
    );

    // Vendor.find({ "phone.Phone": req.body.phone },
    //   function(err, result) {
    //     if (err) {
    //       res.send(err);
    //     } else {
    //       res.json(result);
    //     }
    //   }
    // );

  },

  getPaypal: function (req, res) {
    var payReq = JSON.stringify({
      'intent': 'sale',
      'redirect_urls': {
        'return_url': serverurl + `/paypalsuccess`,
        'cancel_url': serverurl + `/paypalcancel`
      },
      'payer': {
        'payment_method': 'paypal'
      },
      'transactions': [{
        'amount': {
          'total': (req.body.package.price),
          'currency': 'AUD'
        },
        'description': 'This is the payment for the subsciption of The Student Marketplace.'
      }]
    });
    paypal.payment.create(payReq, function (error, payment) {
      if (error) {
        console.log(error)
      } else {
        var links = {};
        payment.links.forEach(function (linkObj) {
          links[linkObj.rel] = {
            'href': linkObj.href,
            'method': linkObj.method
          };
        })
        if (links.hasOwnProperty('approval_url')) {
          let url = URL.parse(links['approval_url'].href);
          url = url.query;
          url = new URLSearchParams(url);
          req.body.vendor_id = ObjectID(req.body.vendor_id)
          req.body.listing_id = ObjectID(req.body.listing_id)
          req.body.amount = req.body.package.price
          req.body.paypal.token = url.get('token')
          req.body.paypal.payId = payment.id
          // console.log(req.body)
          let pay = new Payment(req.body);
          pay.save(function (err) {
            if (err) {
              res.send({
                err: err
              })
            }
            else {
              res.send({
                url: links['approval_url'].href
              })
            }
          })
        } else {
          console.error('no redirect URI present');
        }
      }
    });
  },

  PaypalSuccess: function (req, res) {
    const paymentId = req.query.paymentId;
    const payerId = req.query.PayerID;
    console.log(paymentId, payerId)
    paypal.payment.execute(paymentId, { 'payer_id': payerId }, function (error, payment) {
      if (error) {
        console.error(error);
      } else {
        if (payment.state == 'approved') {
          // return res.json(data);
          Payment.findOneAndUpdate({ 'paypal.payId': paymentId }, { $set: { status: "Paid", 'paypal.payerId': payerId } }, function (err, data) {
            console.log("data: ", data)
            if (err) throw err;
            Listing.findOneAndUpdate({ _id: data.listing_id }, { $set: { Status: "Activated", Payment: "Paid", Payment_id: data._id } }).then(result => {
              res.send('<script>window.location.href="' + frontendurl + '"</script>');
            })
          });
        } else {
          Payment.findOneAndUpdate({ 'paypal.payId': paymentId }, { $set: { status: "Unsuccesssfull", 'paypal.payerId': payerId } }, function (err, data) {
            if (err) throw err;
            res.send('<script>window.location.href="' + frontendurl + '"</script>');
          });
        }
      }
    });
  },
  PaypalCancel: function (req, res) {
    // console.log(req.query)
    Payment.findOneAndUpdate({ 'paypal.token': req.query.token }, { $set: { status: "Cancelled" } }, function (err, data) {
      if (err) throw err;
      console.log("Payment Cancelled.");
      res.send('<script>window.location.href="' + frontendurl + '"</script>');
      // return res.send('<script>window.location.href=""</script>');
    });
  }
};
