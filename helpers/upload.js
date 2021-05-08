const multer = require('multer');

const uploaderObject = {
    upload: multer({
        storage: multer.diskStorage({
                    destination: function (req, file, cb) {
                    cb(null, 'Public')
                },
                    filename: function (req, file, cb) {
                        // let temp = file.originalname.split('.');
                    cb(null, Date.now()+ '-' + file.originalname)
                    // cb(null, file.fieldname + '-' + Date.now()+'.'+ temp[temp.length-1])
                }
            })
        })
}

module.exports = uploaderObject;