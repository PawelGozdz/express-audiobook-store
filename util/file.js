const fs = require('fs-extra');
const path = require('path');

const multer = require('multer');

const deleteFile = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err) {
      return new Error(err);
    }
  });
};

exports.deleteFile = deleteFile;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = `./images/${new Date().getFullYear()}/${new Date().getMonth() + 1}/${new Date().getDate()}/`.toString();
    fs.ensureDir(dir, (err) => {
      if (err) return err;
      return cb(null, dir);
    });
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
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
