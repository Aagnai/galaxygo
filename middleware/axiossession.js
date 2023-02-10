const axiossession = (req, res, next) => {
  if (req.session.log) {
    next();
  } else {
    res.json("LOGIN");
  }
};

module.exports = { axiossession };
