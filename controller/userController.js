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
const item_per_page = 6;
const Razorpay = require("razorpay");
var {
  validatePaymentVerification,
} = require("../node_modules/razorpay/dist/utils/razorpay-utils");

var instance = new Razorpay({
  key_secret: process.env.RAZ_SECRET_KEY,
  key_id: process.env.RAZ_KEY_ID,
});

module.exports = {
  // defining home page

  home: async (req, res, next) => {
    try {
      const cat = await category.find();
      const product = await Product.find().limit(8);
      const banner = await Banner.find({ delete: { $ne: true } });
      const coup = await Coupon.find();
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
        coup,
        layout: "layouts/layout.ejs",
      });
    } catch (error) {
      console.log("Error Message :", error);
      next(error);
    }
  },
  // defining about

  about: (req, res, next) => {
    try {
      res.render("user/about", { layout: "layouts/layout.ejs" });
    } catch (error) {
      console.log("Error Message :", error);
      next(error);
    }
  },

  // defining signup page

  signup: (req, res, next) => {
    try {
      userHelper.doSignup(req, res);
    } catch (error) {
      console.log("Error Message :", error);
      next(error);
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
    } catch (error) {
      console.log("Error Message :", error);
      next(error);
    }
  },

  // defining  register

  register: (req, res, next) => {
    try {
      userHelper.doRegister(req.body, res, () => {
        res.render("user/otp", { layout: "layouts/separate.ejs" });
      });
    } catch (error) {
      console.log("Error Message :", error);
      next(error);
    }
  },

  // defining  otp

  otp: async (req, res, next) => {
    try {
      userHelper.otp(req.body.otp, res, (user) => {
        req.session.log = user;
        res.redirect("/");
      });
    } catch (error) {
      console.log("Error Message :", error);
      next(error);
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
    } catch (error) {
      console.log("Error Message :", error);
      next(error);
    }
  },

  // shop page

  shop: async (req, res, next) => {
    try {
      const page = req.query.page;

      let newCategories;
      newCategories = await category.find();

      let newproducts;

      if (req.query.cate) {
        newproducts = await Product.find({ category: req.query.cate })
          .skip((page - 1) * item_per_page)
          .limit(item_per_page);
        console.log(newproducts);
      } else if (req.query.q) {
        newproducts = await Product.find({ _id: req.query.q })
          .skip((page - 1) * item_per_page)
          .limit(item_per_page);
      } else if (req.query.sortHigh) {
        newproducts = await Product.find()
          .skip((page - 1) * item_per_page)
          .limit(item_per_page)
          .sort({ price: -1 });
      } else if (req.query.sortlow) {
        newproducts = await Product.find()
          .skip((page - 1) * item_per_page)
          .limit(item_per_page)
          .sort({ price: 1 });
      } else {
        newproducts = await Product.find()
          .skip((page - 1) * item_per_page)
          .limit(item_per_page);
      }

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
    } catch (error) {
      console.log("Error Message :", error);
      next(error);
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
    } catch (error) {
      console.log("Error Message :", error);
      next(error);
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
    } catch (error) {
      console.log("Error Message :", error);
      next(error);
    }
  },

  // Add Wishlist

  addWishlist: async (req, res, next) => {
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
    } catch (error) {
      console.log("Error Message :", error);
      next(error);
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
    } catch (error) {
      console.log("Error Message :", error);
      next(error);
    }
  },

  // add to cart wishlist

  addCartHome: async (req, res, next) => {
    try {
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
    } catch (error) {
      console.log("Error Message :", error);
      next(error);
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

                notAvailable: req.flash("notAvailable"),
              });
            } else {
              res.render("user/cartEmpty", {
                layout: "layouts/layout.ejs",
                user: req.session.log,
              });
            }
          }
        });
    } catch (error) {
      console.log("Error Message :", error);
      next(error);
    }
  },

  //  add cart

  addcart: async (req, res, next) => {
    try {
      let ownerId = req.session.log._id;
      if (!ownerId) {
        res.redirect("/log");
      }

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
    } catch (error) {
      console.log("Error Message :", error);
      next(error);
    }
  },

  // cart delete

  deleteCartProduct: async (req, res, next) => {
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
    } catch (error) {
      console.log("Error Message :", error);
      next(error);
    }
  },

  // cart product  quantity change
  cartChangeQuantity: async (req, res, next) => {
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
    } catch (error) {
      console.log("Error Message :", error);
      next(error);
    }
  },

  // user profile

  getprofile: async (req, res, next) => {
    try {
      const userId = req.session.log._id;
      const userDb = await User.findOne({ _id: userId });

      res.render("user/profile", {
        userDb,
        user: req.session.user,
        layout: "layouts/layout.ejs",
      });
    } catch (error) {
      console.log("Error Message :", error);
      next(error);
    }
  },

  // update profile

  updateProfile: async (req, res, next) => {
    try {
      await User.findByIdAndUpdate(req.session.log._id, {
        name: req.body.name,
        email: req.body.email,
      }).then(res.redirect("/profile"));
    } catch (error) {
      console.log("Error Message :", error);
      next(error);
    }
  },

  // logout user

  logoutUser: (req, res, next) => {
    try {
      req.session.destroy();
      res.redirect("/");
    } catch (error) {
      console.log("Error Message :", error);
      next(error);
    }
  },

  // show adress

  showAddress: async (req, res, next) => {
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
    } catch (error) {
      console.log("Error Message :", error);
      next(error);
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
    } catch (error) {
      console.log("Error Message :", error);
      next(error);
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
    } catch (error) {
      console.log("Error Message :", error);
      next(error);
    }
  },

  // delete address

  deleteAddress: async (req, res, next) => {
    try {
      const userId = req.session.log._id;
      const id = req.query.address;
      await Address.updateOne(
        { user: userId },
        { $pull: { address: { _id: id } } }
      );
      res.json("success");
    } catch (error) {
      console.log("Error Message :", error);
      next(error);
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
    } catch (error) {
      console.log("Error Message :", error);
      next(error);
    }
  },

  // post checkout

  postCheckout: async (req, res, next) => {
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
                let response = {
                  Razorpay: true,
                  razorpayOrderData: order,
                  userOrderData: userOrderData,
                };
                response.raz_key = process.env.RAZ_KEY_ID;
                console.log(response);
                Cart.findOneAndRemove({ userId: result.userId }).then(
                  (result) => {
                    res.json(response);
                  }
                );
              }
            );
          });
        }

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
    } catch (error) {
      console.log("Error Message :", error);
      next(error);
    }
  },

  // verify payment
  verifyPayment: async (req, res, next) => {
    try {
      let razorpayOrderDataId = req.body.response.razorpay_order_id;

      let paymentId = req.body.response.razorpay_payment_id;

      let paymentSignature = req.body.response.razorpay_signature;

      let userOrderDataId = req.body.userOrderData._id;

      validate = validatePaymentVerification(
        { order_id: razorpayOrderDataId, payment_id: paymentId },
        paymentSignature,
        process.env.RAZ_SECRET_KEY
      );
      if (validate) {
        console.log("validate : ", validate);
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
    } catch (error) {
      console.log("Error Message :", error);
      next(error);
    }
  },

  // payment   failed
  paymentFailed: (req, res, next) => {
    try {
      res.json({ status: true });
    } catch (error) {
      console.log("Error Message :", error);
      next(error);
    }
  },

  // order complete

  getOrderComplete: async (req, res, next) => {
    try {
      res.render("user/order_confirm", {
        layout: "layouts/layout.ejs",
        user: req.session.user,
      });
    } catch (error) {
      console.log("Error Message :", error);
      next(error);
    }
  },

  // my order page

  getMyOrder: async (req, res, next) => {
    try {
      let orders = await Order.find({ userId: req.session.log }).sort({
        updatedAt: -1,
      });
      res.render("user/myOrder", {
        layout: "layouts/layout.ejs",
        user: req.session.log,
        orders,
      });
    } catch (error) {
      console.log("Error Message :", error);
      next(error);
    }
  },

  // get order details

  getOrderDetails: async (req, res, next) => {
    try {
      let id = req.query.id;
      let orderDetails = await Order.findOne({
        userId: req.session.log._id,
        _id: id,
      }).populate("products.product");
      let idOrder = await Order.findOne({
        userId: req.session.log._id,
        _id: id,
      });
      res.render("user/orderDetails", {
        layout: "layouts/layout.ejs",
        orderDetails,
        idOrder,
      });
    } catch (error) {
      console.log("Error Message :", error);
      next(error);
    }
  },

  // order cancel
  cancelOrder: async (req, res, next) => {
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
    } catch (error) {
      console.log("Error Message :", error);
      next(error);
    }
  },

  // verify coupon

  verifyCoupon: async (req, res, next) => {
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
    } catch (error) {
      console.log("Error Message :", error);
      next(error);
    }
  },
  checkPassword: async (req, res, next) => {
    try {
      const pass = req.body.nPassword;
      const userId = req.session.log._id;

      const user = await User.findOne({ _id: userId });
      if (user && user.access) {
        bcrypt.compare(pass, user.nPassword).then((status) => {
          if (status) {
            res.json({ stat: true });
          } else {
            res.json({ stat: false });
          }
        });
      } else {
        res.json({ stat: false });
      }
    } catch (error) {
      console.log("Error Message :", error);
      next(error);
    }
  },
  updatePass: async (req, res, next) => {
    try {
      let pass = req.body.nPassword;
      pass = await bcrypt.hash(pass, 10);
      const userId = req.session.log._id;

      await User.findOneAndUpdate(
        { _id: userId },
        { $set: { nPassword: pass } }
      );
      res.json({ status: true });
    } catch (error) {
      console.log("Error Message :", error);
      next(error);
    }
  },

  // search

  search: async (req, res, next) => {
    try {
      const sResult = [];
      const skey = req.params.id;
      const regex = new RegExp("^" + skey + ".*", "i");
      const pros = await Product.aggregate([
        {
          $match: {
            $or: [{ name: regex }, { description: regex }, { brand: regex }],
          },
        },
      ]);

      pros.forEach((val, i) => {
        sResult.push({ name: val.name, type: "Product", id: val._id });
      });

      const catlist = await category.aggregate([
        { $match: { $or: [{ title: regex }] } },
      ]);

      catlist.forEach((val, i) => {
        sResult.push({ title: val.title, type: "Category", id: val._id });
      });

      res.send({ id: sResult });
    } catch (error) {
      console.log("Error Message :", error);
      next(error);
    }
  },
};
