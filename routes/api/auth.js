const vendorController = require('../controllers/vendor.controller');
const vendorRoute = require('express').Router();
const Router = require ("express");
// import { upload } from '../../helpers/upload';
const auth = require ("../../middleware/auth");
const uploader = require('../../helpers/upload');
const router = Router();


router.post('/login',vendorController.vendorlogin)
// vendorRoute.route('/login').post(vendorController.vendorlogin);
router.route('/register').post(uploader.upload.single('image')).post(vendorController.vendorregister);
router.route('/addlisting').post( uploader.upload.fields([{
  name: 'Menu', maxCount: 12
}, {
  name: 'Photos', maxCount: 12
}, {
  name: 'Profile_Pic', maxCount: 1
}
])).post(vendorController.addListing);
router.route('/savelisting').post( uploader.upload.fields([{
  name: 'Menu', maxCount: 12
}, {
  name: 'Photos', maxCount: 12
}, {
  name: 'Profile_Pic', maxCount: 1
}
])).post(vendorController.SaveListing);
router.route('/showlisting').get(auth,vendorController.index);
router.route('/editlisting').post( uploader.upload.fields([{
  name: 'Menu', maxCount: 12
}, {
  name: 'Photos', maxCount: 12
}, {
  name: 'Profile_Pic', maxCount: 1
}
])).post(vendorController.editlisting);
router.route('/deletelisting').post(vendorController.deletelisting);
router.route('/getlisting').get(vendorController.getvendorlist);
router.route('/vendorprofile/:id').get(vendorController.vendorprofile);
router.route('/edit-vendorprofile').post( uploader.upload.fields([{
  name: 'Profile_Pic', maxCount: 1
}
])).post(vendorController.editvendorprofile);
router.route('/checkMobile').post(vendorController.checkMobile);
router.route('/getreviews/:id').get(vendorController.getreviews);
router.route('/otpverification').post(vendorController.otpverification);
router.route('/mobileotpverification').post(vendorController.mobileotpverification);
router.route('/resendotp').post(vendorController.resendotp);
router.route('/resendotpmobile').post(vendorController.resendotpmobile);
router.route('/savedlisting/:id').get(vendorController.savedlisting);
router.route('/getcategories/:id').get(vendorController.getcategories);
router.route('/categoriesforhome').get(vendorController.categoriesforhome);
// router.route('/updatestatus/:id').get(vendorController.updatestatus);
router.route('/listing/:id').get(vendorController.getlisting);
router.route('/alllistings/:id').get(vendorController.alllistings);
router.route('/activatedlisting').post(vendorController.activatedlisting);
router.route('/suspendlisting').post(vendorController.suspendlisting);
router.route('/subscriptions').get(vendorController.subscriptions);
router.route('/addcategories').post(vendorController.addcategories);

//Forgot Password

router.route('/forgotpassword').post(vendorController.forgotpassword);
router.route('/resetpassword').post(vendorController.resetpassword);

//Paypal Integrational Api's

router.route('/getPaypal').put(vendorController.getPaypal);
router.route('/paypalsuccess').get(vendorController.PaypalSuccess);
router.route('/paypalcancel').get(vendorController.PaypalCancel)

module.exports = router;
