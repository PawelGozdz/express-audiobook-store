const fs = require('fs-extra');
// const fsExtra = require('fs-extra');
const path = require('path');

const multer = require('multer');

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     // const dest = `images/${new Date().getFullYear()}/${new Date().getMonth() + 1}/${new Date().getDate()}/`;
//     cb(null, 'images/');
//     // cb(null, `images/${new Date().getFullYear()}/${new Date().getMonth() + 1}/${new Date().getDate()}/`);
//   },
//   filename: (req, file, cb) => {
//     cb(null, file.originalname);
//     // cb(null, file.originalname + new Date().getMinutes() + new Date().getSeconds() + path.extname(file.originalname));
//   }
// });

// const storage = multer.diskStorage({
//   destination: './images/',
//   filename: (req, file, cb) => {
//     cb(null, file.originalname);
//   }
// });

// const fileFilter = (req, file, cb) => {
//   if (
//     file.mimetype === 'image/png' || 
//     file.mimetype === 'image/jpg' || 
//     file.mimetype === 'image/jpeg') {
//     cb(null, true);
//   } else {
//     cb(null, false);
//   }
// };

// const limits = { fileSize: 0.5 * 1024 * 1024 };

// exports.multerFile = () => {
//   return upload(req, res, (err) => {
//     if (err) => {

//     }
//   });
// }

const deleteFile = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err) {
      // return new Error(err);
      console.log(err);
    }
  });
};

exports.deleteFile = deleteFile;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = `./images/${new Date().getFullYear()}/${new Date().getMonth() + 1}/${new Date().getDate()}/`.toString();
    fs.ensureDir(dir, (err) => {
      if (err) return err;
      console.log('Storage - ', dir);
      return cb(null, dir);
    });
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
    // cb(null, `${file.originalname}-${new Date().getSeconds()}${path.extname(file.originalname)}`);
  }
});

exports.storage = storage;

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) { 
    cb(null, true);
  } else {
    cb(null, false);
  }
};

exports.fileFilter = fileFilter;

// exports.checkFileType = (file, cb) => {
//   // Allowed ext
//   const filetypes = /jpeg|jpg|png|gif/;
//   // Check ext
//   const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
//   // Check mime
//   const mimetype = filetypes.test(file.mimetype);

//   if (mimetype && extname) {
//     return cb(null, true);
//   } else {
//     cb('Error: Images Only allowed!');
//   }
// }


// const upload = multer({
//   storage,
//   limits: { fileSize: 10000000 },
//   fileFilter: (req, file, cb) => {
//     checkFileType(file, cb);
//   }
// }).single('image');

// exports.upload = upload;
