const express = require("express");
const router = express.Router();
const usercontroller = require("../controller/userController");
const { userVerifyLogin } = require("../middleware/userVerifylogin");
const { axiossession } = require("../middleware/axiossession");

// get routes

router.get("/", usercontroller.home);
router.get("/signup", usercontroller.signup);
router.get("/log", usercontroller.signin);
router.get("/shop", usercontroller.shop);
router.get("/about", usercontroller.about);
router.get("/productDetails/:id", usercontroller.productDetails);
router.get("/cart", userVerifyLogin, usercontroller.cart);
router.get("/checkout", userVerifyLogin, usercontroller.getCheckout);
router.get("/profile", userVerifyLogin, usercontroller.getprofile);
router.get("/logoutUser", userVerifyLogin, usercontroller.logoutUser);
router.get("/wishlist", userVerifyLogin, usercontroller.WishList);
router.get("/address", userVerifyLogin, usercontroller.showAddress);
router.get("/addaddress", userVerifyLogin, usercontroller.getAddAddress);
router.get("/order-complete", userVerifyLogin, usercontroller.getOrderComplete);
router.get("/myOrder", userVerifyLogin, usercontroller.getMyOrder);
router.get("/orderDetails", userVerifyLogin, usercontroller.getOrderDetails);


// post routes

router.post("/register", usercontroller.register);
router.post("/otp", usercontroller.otp);
router.post("/log", usercontroller.logIn);
router.post("/addcart/:id", axiossession, usercontroller.addcart);
router.post("/addaddress", userVerifyLogin, usercontroller.postAddAddress);
router.post("/checkout/:CartId", userVerifyLogin, usercontroller.postCheckout);
router.post("/updateProfile", userVerifyLogin, usercontroller.updateProfile);
router.post("/addWishlist/:id", axiossession, usercontroller.addWishlist);
router.post("/addCartHome", userVerifyLogin, usercontroller.addCartHome);
router.post("/verifyCoupon", userVerifyLogin, usercontroller.verifyCoupon);
router.post("/verifyPayment", userVerifyLogin, usercontroller.verifyPayment);
router.post("/paymentFailed", userVerifyLogin, usercontroller.paymentFailed);
router.post("/cancelOrder", userVerifyLogin, usercontroller.cancelOrder);
router.post("/search/:id", usercontroller.search);
router.post("/updatePassword", usercontroller.updatePass);
router.post("/checking", usercontroller.checkPassword);

// extra routes

router.patch("/cart", userVerifyLogin, usercontroller.cartChangeQuantity);
router.delete("/cart/", userVerifyLogin, usercontroller.deleteCartProduct);
router.delete("/address/", userVerifyLogin, usercontroller.deleteAddress);
router.delete(
  "/deleteWishlist/",
  userVerifyLogin,
  usercontroller.deleteWishlist
);

module.exports = router;
