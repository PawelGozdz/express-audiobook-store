exports.postLogin = (req, res, next) => {
  req.isLoggedIn = true;
  res.redirect('/');
};

exports.getLogin = (req, res, next) => {
  console.log(req.isLoggedIn);
};
