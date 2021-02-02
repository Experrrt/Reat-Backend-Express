const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  // console.log(req.header("authtoken"));
  const token = req.header("authtoken");
  console.log(token);
  if (!token) return res.send({ loggedIn: false });
  try {
    const verified = jwt.decode(token, process.env.TOKEN_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.send("Invalid Token");
    console.log(err);
  }
};
