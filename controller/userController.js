const mongoose = require("mongoose");
const userHelper = require("../helpers/userHelpers");
const Product = require("../models/product");
const category = require("../models/category");
const Cart = require("../models/cart");
const User = require("../models/user");
const Address = require("../models/address");
const Wishlist = require("../models/wishlist");
const Order = require("../models/order");
const Coupon = require("../models/coupon");
const Banner = require("../models/banner");
const bcrypt = require("bcrypt");
const moment = require("moment");
const Razorpay = require("razorpay");
var {
  validatePaymentVerification,
} = require("../node_modules/razorpay/dist/utils/razorpay-utils");

var instance = new Razorpay({
  key_secret: process.env.RAZ_SECRET_KEY,
  key_id: process.env.RAZ_KEY_ID,
});

module.exports = {
  // session

  // defining home page

  home: async (req, res, next) => {
    try {
      const cat = await category.find();
      const product = await Product.find();
      const banner = await Banner.find({ delete: { $ne: true } });
      let wish = null;
      if (req.session.log) {
        const id = req.session.log._id;
        wish = await Wishlist.findOne({ user: id });
      }
      res.render("user/index", {
        wish,
        product,
        user: req.session.log,
        banner,
        cat,
        layout: "layouts/layout.ejs",
      });
    } catch (e) {
      console.log("Error Message :", e);
    }
  },

  // defining signup page

  signup: (req, res, next) => {
    try {
      userHelper.doSignup(req, res);
    } catch (e) {
      console.log("Error Message :", e);
    }
  },

  // defining signin page

  signin: (req, res, next) => {
    try {
      if (req.session.log) {
        res.redirect("/");
      } else {
        let err = req.session.logginErr;
        req.session.logginErr = false;
        res.render("user/log", { layout: "layouts/separate.ejs", err });
        err = false;
      }
    } catch (e) {
      console.log("Error Message :", e);
    }
  },

  // defining  register

  register: (req, res) => {
    try {
      userHelper.doRegister(req.body, res, () => {
        res.render("user/otp", { layout: "layouts/separate.ejs" });
      });
    } catch (e) {
      console.log("Error Message :", e);
    }
  },

  // defining  otp

  otp: async (req, res, next) => {
    try {
      userHelper.otp(req.body.otp, res, (user) => {
        req.session.log = user;
        res.redirect("/");
      });
    } catch (e) {
      console.log("Error Message :", e);
    }
  },

  // login page

  logIn: (req, res, next) => {
    try {
      userHelper.doLogin(req, res).then((response) => {
        if (response.status) {
          res.redirect("/");
          req.session.loggedIn = true;
        } else {
          req.session.logginErr = true;
          res.redirect("/log");
        }
      });
    } catch (e) {
      console.log("Error Message :", e);
    }
  },

  // shop page

  shop: async (req, res, next) => {
    try {
      const newCategories = await category.find();
      const newproducts = await Product.find();
      let wish = null;
      if (req.session.log) {
        const id = req.session.log._id;
        wish = await Wishlist.findOne({ user: id });
      }
      res.render("user/shop", {
        wish,
        newCategories,
        newproducts,
        layout: "layouts/layout.ejs",
      });
    } catch (e) {
      console.log("Error Message :", e);
    }
  },

  // product detail page

  productDetails: async (req, res, next) => {
    try {
      const id = req.params.id;
      let count = null;
      count = res.locals.count;

      const pro = await Product.findOne({ _id: id });

      res.render("user/product_details", {
        pro,
        count,
        layout: "layouts/layout.ejs",
      });
    } catch (e) {
      console.log("Error Message :", e);
    }
  },

  // Show Wishlist

  WishList: async (req, res, next) => {
    try {
      let ownerId = req.session.log._id;

      await Wishlist.findOne({ owner: ownerId })
        .populate("items.product")
        .exec((err, allWishlist) => {
          if (err) {
            return console.log(err);
          } else {
            if (allWishlist) {
              res.render("user/wishlist", {
                layout: "layouts/layout.ejs",
                allWishlist,
                user: req.session.log,
                notAvailable: req.flash("notAvailable"),
              });
            } else {
              res.render("user/wishlist-empty", {
                layout: "layouts/layout.ejs",
                user: req.session.log,
              });
            }
          }
        });
    } catch (e) {
      console.log("Error Message :", e);
    }
  },

  // Add Wishlist

  addWishlist: async (req, res) => {
    try {
      let ownerId = req.session.log._id;
      const wish = await Wishlist.findOne({ owner: ownerId });
      const productId = req.params.id;
      const user = await Wishlist.findOne({ owner: req.session.log._id });

      if (!user) {
        const addToWishlist = await Wishlist({
          owner: req.session.log._id,
          items: [{ product: productId, Date: new Date() }],
        });
        addToWishlist
          .save()
          .then(() => {
            res.json({ added: true });
          })
          .catch((e) => console.log("", e));
      } else {
        const index = wish.items.findIndex((obj) => obj.product == productId);
        console.log(index, "jijjiiiiiiiiii");
        if (index >= 0) {
          wish.items.splice(index, 1);
          await wish.save();
          res.json({ remove: true });
        } else {
          const pros = { product: productId, Date: new Date() };
          wish.items.push(pros);
          await wish.save();
          res.json({ added: true });
        }
      }
    } catch (e) {
      console.log("Error Message :", e);
    }
  },

  // delete wishlist

  deleteWishlist: async (req, res, next) => {
    try {
      const userId = req.session.log;
      const productId = req.query.productId;
      const wish = await Wishlist.findOne({ owner: userId });
      const index = wish.items.findIndex((obj) => obj.product == productId);
      if (index >= 0) {
        wish.items.splice(index, 1);
        await wish.save();
        res.json({ remove: true });
      }

      deleteProduct.save().then(() => {
        res.json("success");
      });
    } catch (e) {
      console.log("Error Message :", e);
    }
  },

  // add to cart wishlist

  addCartHome: async (req, res, next) => {
    try {
      console.log("kweriiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii");
      const id = req.session.log._id;
      const productId = req.body.productId;
      const user = await Cart.findOne({ owner: req.session.log._id });
      const product = await Product.findOne({ _id: productId });

      let price;
      price = product.price;

      if (product.stock < 1) {
        res.json({ noAvailability: true });
      } else {
        const cartTotal = price;
        if (!user) {
          const addToCart = await Cart({
            owner: req.session.log._id,
            items: [{ product: productId, totalPrice: price }],
            cartTotal: cartTotal,
          });
          addToCart
            .save()
            .then(() => {
              res.json({ added: true });
            })
            .catch((e) => console.log("", e));
        } else {
          const existProduct = await Cart.findOne({
            owner: req.session.log._id,
            "items.product": productId,
          });
          if (existProduct != null) {
            const proQuantity = await Cart.aggregate([
              {
                $match: { owner: mongoose.Types.ObjectId(req.session.log._id) },
              },
              {
                $project: {
                  items: {
                    $filter: {
                      input: "$items",
                      cond: {
                        $eq: [
                          "$$this.product",
                          mongoose.Types.ObjectId(productId),
                        ],
                      },
                    },
                  },
                },
              },
            ]);
            const quantity = proQuantity[0].items[0].quantity;
            if (product.stock <= quantity) {
              res.json({ stockReached: true });
            } else {
              await Cart.findOneAndUpdate(
                { owner: req.session.log._id, "items.product": productId },
                {
                  $inc: {
                    "items.$.quantity": 1,
                    "items.$.totalPrice": price,
                    cartTotal: cartTotal,
                    subTotal: cartTotal,
                  },
                }
              ).then(() => {
                res.json({ added: true });
              });
            }
          } else {
            const addToCart = await Cart.findOneAndUpdate(
              { owner: req.session.log._id },
              {
                $push: {
                  items: { product: productId, totalPrice: price },
                },
                $inc: { cartTotal: cartTotal, subTotal: price },
              }
            );
            addToCart.save().then(() => {
              res.json({ added: true });
            });
          }
        }
      }
    } catch (e) {
      console.log("Error Message :", e);
    }
  },
  // show cart

  cart: async (req, res, next) => {
    try {
      let ownerId = req.session.log._id;

      await Cart.findOne({ owner: ownerId })
        .populate("items.product")
        .exec((err, allCart) => {
          if (err) {
            return console.log(err);
          } else {
            if (allCart) {
              res.render("user/cart", {
                layout: "layouts/layout.ejs",
                allCart,
                user: req.session.log,
                // cartView: true,
                notAvailable: req.flash("notAvailable"),
              });
            } else {
              res.render("user/cartEmpty", {
                layout: "layouts/layout.ejs",
                user: req.session.log,
                // cartView: true,
              });
            }
          }
        });
    } catch (e) {
      console.log("Error Message :", e);
    }
  },

  //  add cart

  addcart: async (req, res, next) => {
    try {
      console.log("keri jose 1");
      let ownerId = req.session.log._id;
      if (!ownerId) {
        res.redirect("/log");
      }
     console.log("keri jose");
      const productId = req.params.id;
      const user = await Cart.findOne({ owner: req.session.log._id });
      const product = await Product.findOne({ _id: productId });

      let price;
      price = product.price;

      if (product.stock < 1) {
        res.json({ noAvailability: true });
      } else {
        const cartTotal = price;
        if (!user) {
          const addToCart = await Cart({
            owner: req.session.log._id,
            items: [{ product: productId, totalPrice: price }],
            cartTotal: cartTotal,
          });
          addToCart
            .save()
            .then(() => {
              res.redirect("/productDetails/" + productId);
            })
            .catch((e) => console.log("", e));
        } else {
          const existProduct = await Cart.findOne({
            owner: req.session.log._id,
            "items.product": productId,
          });
          if (existProduct != null) {
            const proQuantity = await Cart.aggregate([
              {
                $match: { owner: mongoose.Types.ObjectId(req.session.log._id) },
              },
              {
                $project: {
                  items: {
                    $filter: {
                      input: "$items",
                      cond: {
                        $eq: [
                          "$$this.product",
                          mongoose.Types.ObjectId(productId),
                        ],
                      },
                    },
                  },
                },
              },
            ]);
            const quantity = proQuantity[0].items[0].quantity;
            if (product.stock <= quantity) {
              res.json({ stockReached: true });
            } else {
              await Cart.findOneAndUpdate(
                { owner: req.session.log._id, "items.product": productId },
                {
                  $inc: {
                    "items.$.quantity": 1,
                    "items.$.totalPrice": price,
                    cartTotal: cartTotal,
                    subTotal: cartTotal,
                  },
                }
              ).then(() => {
                res.redirect("/productDetails/" + productId);
              });
            }
          } else {
            const addToCart = await Cart.findOneAndUpdate(
              { owner: req.session.log._id },
              {
                $push: {
                  items: { product: productId, totalPrice: price },
                },
                $inc: { cartTotal: cartTotal, subTotal: price },
              }
            );
            addToCart.save().then(() => {
              res.redirect("/productDetails/" + productId);
            });
          }
        }
      }
    } catch (e) {
      console.log("Error Message :", e);
    }
  },

  // cart delete

  deleteCartProduct: async (req, res) => {
    try {
      const userId = req.session.log;
      const productId = req.query.productId;
      const cart = await Cart.findOne({ owner: userId });
      const index = await cart.items.findIndex((el) => {
        return el.product == productId;
      });
      const price = cart.items[index].totalPrice;

      const deleteProduct = await Cart.findOneAndUpdate(
        { owner: userId },
        {
          $pull: {
            items: { product: productId },
          },
          $inc: { cartTotal: -price },
        }
      );
      deleteProduct.save().then(() => {
        res.json("success");
      });
    } catch (e) {
      console.log("Error Message :", e);
    }
  },

  // cart product  quantity change
  cartChangeQuantity: async (req, res) => {
    try {
      const { cartId, productId, count } = req.query;
      const product = await Product.findOne({ _id: productId });

      let price = product.price;

      if (count == 1) {
        var productPrice = price;
      } else {
        var productPrice = -price;
      }

      const proQuantity = await Cart.aggregate([
        { $match: { owner: mongoose.Types.ObjectId(req.session.log._id) } },
        {
          $project: {
            items: {
              $filter: {
                input: "$items",
                cond: {
                  $eq: ["$$this.product", mongoose.Types.ObjectId(productId)],
                },
              },
            },
          },
        },
      ]);
      const quantity = proQuantity[0].items[0].quantity;
      if (product.stock <= quantity && count == 1) {
        res.json({ stockReached: true });
      } else {
        const cart = await Cart.findOneAndUpdate(
          { _id: cartId, "items.product": productId },
          {
            $inc: {
              "items.$.quantity": count,
              "items.$.totalPrice": productPrice,
              cartTotal: productPrice,
            },
          }
        ).then(() => {
          res.json();
        });
      }
    } catch (e) {
      console.log("Error Message :", e);
    }
  },

  // user profile

  getprofile: async (req, res) => {
    try {
      const userId = req.session.log._id;
      const userDb = await User.findOne({ _id: userId });

      res.render("user/profile", {
        userDb,
        user: req.session.user,
        layout: "layouts/layout.ejs",
      });
    } catch (e) {
      console.log("Error Message :", e);
    }
  },

  // update profile

  updateProfile: async (req, res) => {
    try {
      await User.findByIdAndUpdate(req.session.log._id, {
        name: req.body.name,
        email: req.body.email,
      }).then(res.redirect("/profile"));
    } catch (e) {
      console.log("Error Message :", e);
    }
  },

  // logout user

  logoutUser: (req, res, next) => {
    try {
      req.session.destroy();
      res.redirect("/");
    } catch (e) {
      console.log("Error Message :", e);
    }
  },

  // show adress

  showAddress: async (req, res) => {
    try {
      const userId = req.session.log._id;
      const userDb = await User.findOne({ _id: userId });
      const addresses = await Address.findOne({ user: userId });
      let address;

      if (addresses) {
        address = addresses.address;
      } else {
        address = [];
      }
      res.render("user/address", {
        layout: "layouts/layout.ejs",
        address,
        addresses,
        userDb,
        user: req.session.log,
      });
    } catch (e) {
      console.log("Error Message :", e);
    }
  },

  // get Address

  getAddAddress: async (req, res, next) => {
    try {
      const userId = req.session.log._id;
      const userDb = await User.findOne({ _id: userId });
      const addresses = await Address.findOne({ user: userId });
      let address;
      if (addresses) {
        address = addresses.address;
      } else {
        address = [];
      }

      res.render("user/addaddress", {
        layout: "layouts/layout.ejs",
        address,
        addresses,
        userDb,
        user: req.session.log,
        addressErr: req.flash("addressErr"),
      });
    } catch (e) {
      console.log("Error Message :", e);
    }
  },

  // add Address

  postAddAddress: async (req, res, next) => {
    try {
      const { country, fName, state, addressLine, city, pincode } = req.body;
      if (country && fName && state && addressLine && city && pincode) {
        var userId = req.session.log._id;
        const existAddress = await Address.findOne({ user: userId });
        if (existAddress) {
          await Address.findOneAndUpdate(
            { user: userId },
            {
              $push: {
                address: [req.body],
              },
            }
          ).then(() => {
            res.redirect("/profile");
          });
        } else {
          const addAddress = await Address({
            user: userId,
            address: [req.body],
          });
          addAddress.save().then(() => {
            res.redirect("/address");
          });
        }
      } else {
        req.flash("addressErr", "fill full coloms");
        res.redirect("/addaddress");
      }
    } catch (e) {
      console.log("Error Message :", e);
    }
  },

  // delete address

  deleteAddress: async (req, res) => {
    try {
      const userId = req.session.log._id;
      const id = req.query.address;
      await Address.updateOne(
        { user: userId },
        { $pull: { address: { _id: id } } }
      );
      res.json("success");
    } catch (e) {
      console.log("Error Message :", e);
    }
  },

  // get checkout

  getCheckout: async (req, res, next) => {
    try {
      let index = Number(req.body.index);
      if (!index) {
        index = 0;
      }
      const userId = req.session.log._id;
      const addresses = await Address.findOne({ user: userId });
      let address;
      if (addresses) {
        address = addresses.address;
      } else {
        address = [];
      }

      const cartItems = await Cart.findOne({ owner: userId }).populate(
        "items.product"
      );
      let check = false;
      let products = [];
      for (let i = 0; i < cartItems.items.length; i++) {
        if (cartItems.items[i].quantity > cartItems.items[i].product.stock) {
          check = true;
          products.push(cartItems.items[i].product.name);
        }
      }

      if (check == true) {
        req.flash("notAvailable", products + " Not available in stock");
        res.redirect("/cart");
      } else {
        if (cartItems) {
          res.render("user/checkout", {
            layout: "layouts/layout.ejs",
            user: req.session.log,
            address,
            index,
            cartItems,
          });
        } else {
          res.redirect("/cart");
        }
      }
    } catch (e) {
      console.log("Error Message :", e);
    }
  },

  // post checkout

  postCheckout: async (req, res,next) => {
    try {
      if (req.body.address) {
        const user = req.session.log;
        const userId = user._id;
        const subTotal = req.body.subtotal;
        const total = req.body.total;

        const coupon = await Coupon.findOne({ code: req.body.couponCod });

        if (coupon) {
          var couponDis = subTotal - total;
        }
        const paymentMethod = req.body.paymentMethod;
        const address = await Address.findOne({ user: userId });
        const deliveryAddress = address.address.find(
          (el) => el._id.toString() === req.body.address
        );
        const cart = await Cart.findById(req.body.cartId);
        const proId = cart.items.product;
        let newOrder;
        if (req.body.paymentMethod === "cash on delivery") {
          newOrder = new Order({
            date: new Date(),
            time: new Date().toLocaleTimeString(),
            userId: userId,
            products: cart.items,
            couponDiscount: couponDis,
            total: total,
            address: deliveryAddress,
            paymentMethod: paymentMethod,
            paymentStatus: "Payment Pending",
            orderStatus: "orderconfirmed",
            track: "orderconfirmed",
          });
          newOrder.save().then(async (result) => {
            req.session.orderId = result._id;
            const order = await Order.findOne({ _id: result._id });
            const findProductId = order.products;
            findProductId.forEach(async (el) => {
              let removeQuantity = await Product.findOneAndUpdate(
                { _id: el.product },
                { $inc: { stock: -el.quantity } }
              );
            });

            if (coupon) {
              let cartCount = await Coupon.findOneAndUpdate(
                { _id: coupon._id },
                { $inc: { generateCount: -1 } }
              );
            }

            await Cart.findOneAndRemove({ userId: result.userId }).then(
              (result) => {
                res.json({ cashOnDelivery: true });
              }
            );
          });
        } else if (req.body.paymentMethod === "Razorpay") {
          const paymentMethod = req.body.paymentMethod;
//
          const newOrder = new Order({
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString(),
            userId: userId,
            products: cart.items,
            total: total,
            address: deliveryAddress,
            couponDiscount: couponDis,
            paymentMethod: paymentMethod,
            paymentStatus: "Payment Pending",
            orderStatus: "orderconfirmed",
            track: "orderconfirmed",
          });
          let id;
          newOrder.save().then((result) => {
            let userOrderData = result;
            req.session.orderId = result._id;
            id = result._id.toString();
            instance.orders.create(
              {
                amount: result.total * 100,
                currency: "INR",
                receipt: id,
              },
              (err, order) => {
                console.log(err, "errorrrrrrrrr");
                console.log(order, "orderrrr");
                let response = {
                  Razorpay: true,
                  razorpayOrderData: order,
                  userOrderData: userOrderData,
                };
                response.raz_key = process.env.RAZ_KEY_ID
                console.log(response);

                res.json(response);
              }
            );
          });
        }

        // quantity check
        let order = await Order.findOne({ _id: id });
        const findProductId = order.products;
        findProductId.forEach(async (el) => {
          let removeQuantity = await Product.findOneAndUpdate(
            { _id: el.product },
            { $inc: { stock: -el.quantity } }
          );
        });

        // coupon check
        if (coupon) {
          let cartCount = await Coupon.findOneAndUpdate(
            { _id: coupon._id },
            { $inc: { generateCount: -1 } }
          );
        }
      } else {
        res.json({ chooseAddress: true });
      }
    } catch (e) {
      console.log("Error Message :", e);
      next(e)
    }
  },

  // verify payment
  verifyPayment: async (req, res) => {
    try {
      console.log("verify payment");
      console.log(req.body);
      let razorpayOrderDataId = req.body.response.razorpay_order_id;
     console.log(razorpayOrderDataId,"id ivde");
      let paymentId = req.body.response.razorpay_payment_id;

      let paymentSignature = req.body.response.razorpay_signature;

      let userOrderDataId = req.body.userOrderData._id;

      validate = validatePaymentVerification(
        { order_id: razorpayOrderDataId, payment_id: paymentId },
        paymentSignature,
        process.env.RAZ_SECRET_KEY 
      );
      if (validate) {
        console.log("validate : ",validate)
        await Order.findByIdAndUpdate(userOrderDataId, {
          orderStatus: "Order Placed",
          paymentStatus: "Payment Completed",
        }).then(async (result) => {
          // quantity check
          const findProductId = result.products;
          findProductId.forEach(async (el) => {
            let removeQuantity = await Product.findOneAndUpdate(
              { _id: el.product },
              { $inc: { stock: -el.quantity } }
            );
          });

          // coupon check
          console.log(req.body.CouponCode);
          let coupon = await Coupon.findOne({ code: req.body.CouponCode });
          if (coupon) {
            let cartCount = await Coupon.findOneAndUpdate(
              { _id: coupon._id },
              { $inc: { generateCount: -1 } }
            );
          }
          // cart remove
          await Cart.findOneAndRemove({ userId: req.session.log._id }).then(
            () => {
              res.json({ status: true });
            }
          );
        });
      }
    }  catch (e) {
      console.log("Error Message :", e);
    }
  },

  // payment   failed
  paymentFailed: (req, res) => {
    try {
      res.json({ status: true });
    } catch (e) {
      console.log("Error Message :", e);
    }
  },

  // order complete

  getOrderComplete: async (req, res) => {
    try {
      res.render("user/order_confirm", {
        layout: "layouts/layout.ejs",
        user: req.session.user,
      });
    } catch (e) {
      console.log("Error Message :", e);
    }
  },

  // my order page

  getMyOrder: async (req, res) => {
    try {
      let orders = await Order.find({ userId: req.session.log }).sort({
        updatedAt: -1,
      });
      res.render("user/myOrder", {
        layout: "layouts/layout.ejs",
        user: req.session.log,
        orders,
      });
    } catch (e) {
      console.log("Error Message :", e);
    }
  },

  // get order details

  getOrderDetails: async (req, res) => {
    try {
      let orderDetails = await Order.findOne({
        userId: req.session.log._id,
      }).populate("products.product");
      let idOrder = await Order.findOne({ userId: req.session.log._id }).find();
      res.render("user/orderDetails", {
        layout: "layouts/layout.ejs",
        orderDetails,
        idOrder,
      });
    } catch (e) {
      console.log("Error Message :", e);
    }
  },

  // order cancel
  cancelOrder: async (req, res) => {
    try {
      let orderId = req.session.log;

      let order = await Order.findByIdAndUpdate(orderId, {
        orderStatus: "Cancelled",
        track: "Cancelled",
      }).then((result) => {
        const findProductId = result.products;
        findProductId.forEach(async (el) => {
          let removeQuantity = await Product.findOneAndUpdate(
            { _id: el.product },
            { $inc: { stock: el.quantity } }
          );
        });
      });
    } catch (e) {
      console.log("Error Message :", e);
    }
  },

  // verify coupon

  verifyCoupon: async (req, res) => {
    try {
      let couponcode = req.body.CouponCode;
      let total = req.body.total;
      let grandtotal;
      let couponMsg;
      let nowDate = moment().format("DD/MM/YYYY");
      let coupon = await Coupon.find({
        code: couponcode,
        status: "ACTIVE",
      });

      if (coupon.length == 0) {
        couponMsg = "Coupon Invalid";
        res.json({ status: false, couponMsg });
      } else {
        let expireDate = coupon[0].expireDate.toLocaleDateString();

        let couponType = coupon[0].couponType;
        let cutOff = parseInt(coupon[0].cutOff);
        let maxRedeemAmount = parseInt(coupon[0].maxRedeemAmount);
        let minCartAmount = parseInt(coupon[0].minCartAmount);
        let generateCount = parseInt(coupon[0].generateCount);
        if (generateCount != 0) {
          if (nowDate < expireDate) {
            if (couponType == "Amount") {
              if (total < minCartAmount) {
                couponMsg =
                  "Minimum Rs." + minCartAmount + " need to Apply this Coupon";

                res.json({ status: false, couponMsg });
              } else {
                grandtotal = Math.round(total - cutOff);
                let response = {
                  status: true,
                  grandtotal: grandtotal,
                  couponMsg,
                  CutOff: cutOff,
                };
                res.json(response);
              }
            } else if ((couponType = "Percentage")) {
              if (total < minCartAmount) {
                couponMsg =
                  "Minimum Rs." + minCartAmount + " need to Apply this Coupon";
                res.json({ status: false, couponMsg });
              } else {
                let reduceAmount = Math.round((total * cutOff) / 100);
                if (reduceAmount > maxRedeemAmount) {
                  grandtotal = Math.round(total - maxRedeemAmount);
                  let response = {
                    status: true,
                    grandtotal: grandtotal,
                    couponMsg,
                    CutOff: maxRedeemAmount,
                  };
                  res.json(response);
                } else {
                  grandtotal = Math.round(total - reduceAmount);
                  let response = {
                    status: true,
                    grandtotal: grandtotal,
                    couponMsg,
                    CutOff: reduceAmount,
                  };
                  res.json(response);
                }
              }
            }
          } else {
            couponMsg = "Coupon date expired";
            res.json({ status: false, couponMsg });
          }
        } else {
          couponMsg = "Coupon limit Exceeded";
          res.json({ status: false, couponMsg });
        }
      }
    } catch (e) {
      console.log("Error Message :", e);
    }
  },
  checkPassword:async(req,res)=>{
    console.log(req.body,'hehehheheheheheheheheheheheehe')
    const pass = req.body.nPassword
    const userId = req.session.log._id
    
    const user = await User.findOne({_id: userId })
    if (user && user.access) {
      bcrypt.compare(pass, user.nPassword).then((status) => {
        if (status) {
           res.json({stat:true})
        }
        else {
         res.json({stat:false})
        }
      })
    }
    else {

      res.json({stat:false})

    }
  },
  updatePass:async(req,res)=>{
    console.log(req.body,"ekanayiiiiiiii");
    let pass = req.body.nPassword
   pass = await bcrypt.hash(pass,10)
   const userId = req.session.log._id
    
    await User.findOneAndUpdate({_id: userId },{$set:{nPassword:pass}})
    res.json({status:true})
  }

  //

  // consoled error handling

  // catch(e){
  //   next(new Error(e))
  // }
};
