const userModel = require("../models/user");
const User = require("../models/user");
const category = require("../models/category");
const Products = require("../models/product");
const Banner = require("../models/banner");
const Coupon = require("../models/coupon");
const Order = require("../models/order");
const moment = require("moment");

const adminEmail = process.env.AdminEmail;
const adminPassword = process.env.AdminPassword;

module.exports = {
  getAdminlogin: (req, res) => {
    if (req.session.adminLog) {
      res.redirect("/admin/dashboard", { layout: "layouts/adminLayout.ejs" });
    } else {
      res.render("admin/login");
    }
  },
  postAdminlogin: (req, res) => {
    const admin = req.body.email;
    const password = req.body.password;

    if (admin === adminEmail && password === adminPassword) {
      req.session.adminLog = true;
      res.redirect("/admin/dashboard");
    } else {
      req.session.adminLogErr = true;
      res.redirect("/admin");
    }
  },

  userManagement: async (req, res, next) => {
    try {
      let users = await userModel.find({ delete: { $ne: true } });
      res.render("admin/userManagement", {
        layout: "layouts/adminLayout.ejs",
        users,
      });
    } catch (error) {
      console.log("Error Message :", error);
      error.admin = true;
      next(error);
    }
  },

  blockuser: async (req, res, next) => {
    try {
      const id = req.params.id;
      await userModel
        .updateOne({ _id: id }, { $set: { access: false } })
        .then(() => {
          res.redirect("/admin/users");
        });
    } catch (error) {
      console.log("Error Message :", error);
      error.admin = true;
      next(error);
    }
  },
  unblockuser: async (req, res, next) => {
    try {
      const id = req.params.id;
      await userModel
        .updateOne({ _id: id }, { $set: { access: true } })
        .then(() => {
          res.redirect("/admin/users");
        });
    } catch (error) {
      console.log("Error Message :", error);
      error.admin = true;
      next(error);
    }
  },

  deleteUser: async (req, res, next) => {
    try {
      const id = req.query.id;

      const deleteUser = await userModel.findOneAndUpdate(
        { _id: id },
        { $set: { delete: true } }
      );
      deleteUser.save().then(() => {
        res.json("success");
      });
    } catch (error) {
      console.log("Error Message :", error);
      error.admin = true;
      next(error);
    }
  },

  categoryManagement: async (req, res, next) => {
    try {
      const showCategory = await category.find({ access: { $ne: false } });
      res.render("admin/categoryManagement", {
        layout: "layouts/adminLayout.ejs",
        showCategory,
      });
    } catch (error) {
      console.log("Error Message :", error);
      error.admin = true;
      next(error);
    }
  },
  viewCategory: async (req, res, next) => {
    try {
      const err = req.flash("err");
      res.render("admin/addCategory", {
        layout: "layouts/adminLayout.ejs",
        err,
      });
    } catch (error) {
      console.log("Error Message :", error);
      error.admin = true;
      next(error);
    }
  },
  addCategory: async (req, res, next) => {
    try {
      const image = req.files.categoryImage;

      if (!image) {
        res.redirect("/admin/addCategory");
      } else {
        let imageUrl = image[0].path;

        imageUrl = imageUrl.substring(6);

        const newCategory = new category({
          title: req.body.title,

          categoryImage: imageUrl,
        });
        newCategory
          .save()
          .then((newOne) => {
            res.redirect("/admin/viewCategory");
          })
          .catch((err) => {
            if (err.code === 11000) {
              req.flash("err", "! Duplicate value !");
              res.redirect("/admin/addCategory");
            }
          });
      }
    } catch (error) {
      console.log("Error Message :", error);
      error.admin = true;
      next(error);
    }
  },

  getEditCategory: async (req, res, next) => {
    try {
      let iid = req.query.id;

      const err = req.flash("err");
      const oneUser = await category.findOne({ _id: iid });
      res.render("admin/editCategory", {
        layout: "layouts/adminLayout.ejs",
        oneUser,
        err,
      });
    } catch (error) {
      console.log("Error Message :", error);
      error.admin = true;
      next(error);
    }
  },

  postEditCategory: async (req, res) => {
    try {
      const id = req.params.id;
      const updatedName = req.body.title;
      const image = req.files.categoryImage;
      const cat = { title: updatedName };
      if (image) {
        const imageUrl = image[0].path.substring(6);
        cat.categoryImage = imageUrl;
      }
      category
        .findOneAndUpdate(
          { _id: id },
          {
            $set: {
              title: req.body.title,

              categoryImage: cat.categoryImage,
            },
          }
        )
        .then((newOne) => {
          res.redirect("/admin/viewCategory");
        })
        .catch((err) => {
          if (err.code === 11000) {
            req.flash("err", "! Duplicate value !");
            res.redirect("/admin/editCategory?id=" + id);
          }
        });
    } catch (error) {
      console.log("Error Message :", error);
      error.admin = true;
      next(error);
    }
  },

  deleteCategory: async (req, res, next) => {
    try {
      const id = req.query.id;
      const deletecat = await category.findOneAndUpdate(
        { _id: id },
        { $set: { access: false } }
      );
      deletecat.save().then(() => {
        res.json("success");
      });
    } catch (error) {
      console.log("Error Message :", error);
      error.admin = true;
      next(error);
    }
  },

  productManagement: async (req, res, next) => {
    try {
      const showProducts = await Products.find({
        access: { $ne: false },
      }).populate("category");
      res.render("admin/productManagement", {
        layout: "layouts/adminLayout.ejs",
        showProducts,
      });
    } catch (error) {
      console.log("Error Message :", error);
      error.admin = true;
      next(error);
    }
  },

  getAddProducts: async (req, res, next) => {
    try {
      const categories = await category.find();
      res.render("admin/addProducts", {
        layout: "layouts/adminLayout.ejs",
        categories,
      });
    } catch (error) {
      console.log("Error Message :", error);
      error.admin = true;
      next(error);
    }
  },

  postAddProducts: (req, res, next) => {
    try {
      const image = req.files.productImage;
      const img = [];
      image.forEach((el, i, arr) => {
        img.push(arr[i].path.substring(6));
      });

      const products = new Products({
        name: req.body.name,
        brand: req.body.brand,
        price: parseInt(req.body.price),
        stock: parseInt(req.body.stock),
        category: req.body.category.trim(),
        size: req.body.size,
        productImage: img,
        description: req.body.description,
        discount: req.body.discount,
      });
      products.save((error, doc) => {
        if (error) {
          res.redirect("/admin/addProducts");
        } else {
          res.redirect("/admin/viewProducts");
        }
      });
    } catch (error) {
      console.log("Error Message :", error);
      error.admin = true;
      next(error);
    }
  },

  getEditProducts: async (req, res, next) => {
    try {
      const idproducts = req.query.id;
      const newCategories = await category.find();
      const productShow = await Products.findOne({ _id: idproducts }).populate(
        "category"
      );

      res.render("admin/editProduct", {
        layout: "layouts/adminLayout.ejs",
        productShow,
        newCategories,
      });
    } catch (error) {
      console.log("Error Message :", error);
      error.admin = true;
      next(error);
    }
  },

  postEditProducts: async (req, res, next) => {
    try {
      const id = req.params.id;

      const image = req.files.productImage;
      const product = {
        name: req.body.name,
        brand: req.body.brand,
        price: req.body.price,
        stock: req.body.stock,
        category: req.body.category,
        description: req.body.description,
        discount: req.body.discount,
        size: req.body.size,
      };
      if (image) {
        const img = [];
        image.forEach((el, i, arr) => {
          img.push(arr[i].path.substring(6));
        });

        await Products.updateOne(
          { _id: id },
          {
            $set: {
              name: product.name,
              brand: product.brand,
              price: product.price,
              stock: product.stock,
              category: product.category.trim(),
              size: product.size,
              productImage: img,
              description: product.description,
            },
          }
        );
      } else {
        await Products.updateOne(
          { _id: id },
          {
            $set: {
              name: product.name,
              brand: product.brand,
              price: product.price,
              stock: product.stock,
              category: product.category.trim(),
              size: product.size,
              description: product.description,
            },
          }
        );
      }

      res.redirect("/admin/viewProducts");
    } catch (error) {
      console.log("Error Message :", error);
      error.admin = true;
      next(error);
    }
  },

  // product delete

  deleteProducts: async (req, res, next) => {
    try {
      const id = req.query.id;
      const deleteProduct = await Products.findOneAndUpdate(
        { _id: id },
        { $set: { access: false } }
      );
      deleteProduct.save().then(() => {
        res.json("success");
      });
    } catch (error) {
      console.log("Error Message :", error);
      error.admin = true;
      next(error);
    }
  },

  getBanner: async (req, res, next) => {
    try {
      let banner = await Banner.find({ delete: { $ne: true } }).sort({
        updatedAt: -1,
      });
      res.render("admin/bannermanagement", {
        layout: "layouts/adminLayout.ejs",
        banner,
        bannerView: true,
      });
    } catch (error) {
      console.log("Error Message :", error);
      error.admin = true;
      next(error);
    }
  },

  getAddBanner: (req, res, next) => {
    try {
      const err = req.flash("err");
      res.render("admin/add_banner", {
        layout: "layouts/adminLayout.ejs",
        bannerAddErr: req.flash("bannerAddErr"),
        bannerView: true,
        err,
      });
    } catch (error) {
      console.log("Error Message :", error);
      error.admin = true;
      next(error);
    }
  },

  postAddBanner: async (req, res, next) => {
    try {
      const imageUrl = req.files;
      const { head1, head2, route, description } = req.body;

      if (description && head1 && head2 && route && imageUrl) {
        let obj = { imageUrl: imageUrl.imageUrl[0].filename };

        Object.assign(req.body, obj);

        const newBanner = new Banner(req.body);
        newBanner
          .save()
          .then((result) => {
            res.redirect("/admin/banner");
          })
          .catch((err) => {
            if (err.code === 11000) {
              req.flash("err", "! Duplicate value !");
              res.redirect("/admin/addBanner");
            } else {
              req.flash("bannerAddErr", "Add Data");
              res.redirect("/admin/addBanner");
            }
          });
      }
    } catch (error) {
      console.log("Error Message :", error);
      error.admin = true;
      next(error);
    }
  },
  // banner delete

  deleteBanner: async (req, res, next) => {
    try {
      const id = req.params.id;
      const deleteBanner = await Banner.findOneAndUpdate(
        { _id: id },
        { $set: { delete: true } }
      );
      deleteBanner.save().then(() => {
        res.json("success");
      });
    } catch (error) {
      console.log("Error Message :", error);
      error.admin = true;
      next(error);
    }
  },

  // get coupon

  getCoupon: async (req, res, next) => {
    try {
      const coupons = await Coupon.find().sort({ timeStamp: -1 });
      res.render("admin/coupon", {
        layout: "layouts/adminLayout.ejs",
        coupons,
        couponView: true,
      });
    } catch (error) {
      console.log("Error Message :", error);
      error.admin = true;
      next(error);
    }
  },

  // get add coupon page

  getAddCoupon: async (req, res, next) => {
    try {
      res.render("admin/add-coupon", {
        layout: "layouts/adminLayout.ejs",
        addCouponErr: req.flash("addCouponErr"),
        couponView: true,
        couponExistErr: req.flash("couponExistErr"),
      });
    } catch (error) {
      console.log("Error Message :", error);
      error.admin = true;
      next(error);
    }
  },

  // post add coupoon
  postAddCoupon: async (req, res, next) => {
    try {
      const {
        code,
        CouponType,
        cutOff,
        minAmount,
        maxAmount,
        genetateCount,
        expireDate,
      } = req.body;
      if (
        code &&
        CouponType &&
        cutOff &&
        minAmount &&
        maxAmount &&
        genetateCount &&
        expireDate
      ) {
        let regExp = new RegExp(code, "i");

        const coupon = await Coupon.find({ code: { $regex: regExp } });
        if (coupon.length == 0) {
          const coupon = new Coupon({
            code: code,
            cutOff: cutOff,
            couponType: CouponType,
            minCartAmount: minAmount,
            maxRedeemAmount: maxAmount,
            generateCount: genetateCount,
            expireDate: expireDate,
          });
          coupon.save().then((result) => {
            res.redirect("/admin/coupon");
          });
        } else {
          couponExistErr = "Coupon Already Exist";
          req.flash("couponExistErr", "Coupon Already Exist");
          res.redirect("/admin/addcoupon");
        }
      } else {
        req.flash("addCouponErr", "fill full coloms");
        res.redirect("/admin/addCoupon");
      }
    } catch (error) {
      console.log("Error Message :", error);
      error.admin = true;
      next(error);
    }
  },

  // delete coupon

  deleteCoupon: (req, res, next) => {
    try {
      const coupenId = req.query.id;
      Coupon.findByIdAndRemove(coupenId).then((coupon) => {
        res.json("success");
      });
    } catch (error) {
      console.log("Error Message :", error);
      error.admin = true;
      next(error);
    }
  },

  // active coupon

  couponActive: async (req, res, next) => {
    try {
      coupenId = req.query.id;
      await Coupon.updateOne(
        { _id: coupenId },
        { $set: { status: "ACTIVE" } }
      ).then((result) => {
        res.redirect("/admin/coupon");
      });
    } catch (error) {
      console.log("Error Message :", error);
      error.admin = true;
      next(error);
    }
  },

  // block coupon

  couponBlock: async (req, res, next) => {
    try {
      coupenId = req.query.id;
      await Coupon.updateOne(
        { _id: coupenId },
        { $set: { status: "BLOCK" } }
      ).then((result) => {
        res.redirect("/admin/coupon");
      });
    } catch (error) {
      console.log("Error Message :", error);
      error.admin = true;
      next(error);
    }
  },

  //  order page
  ordersView: async (req, res, next) => {
    try {
      let order = await Order.find().sort({ updatedAt: -1 }).populate("userId");
      Object.values(order);
      res.render("admin/orders", {
        layout: "layouts/adminLayout.ejs",
        order,
        user: req.session.log,
      });
    } catch (error) {
      console.log("Error Message :", error);
      error.admin = true;
      next(error);
    }
  },

  // get order details

  getOrderDetails: async (req, res, next) => {
    try {
      let order = await Order.findOne({ _id: req.params.id }).populate(
        "products.product"
      );
      res.render("admin/orderDetails", {
        layout: "layouts/adminLayout.ejs",
        order,
        ordersView: true,
      });
    } catch (error) {
      console.log("Error Message :", error);
      error.admin = true;
      next(error);
    }
  },

  //  change order status

  changeTrack: async (req, res, next) => {
    try {
      oid = req.body.orderId;
      value = req.body.value;
      console.log("req.body : ", req.body);
      if (value == "Delivered") {
        await Order.updateOne(
          {
            _id: oid,
          },
          {
            $set: {
              track: value,
              orderStatus: value,
              paymentStatus: "Payment Completed",
            },
          }
        ).then((response) => {
          res.json({ status: true });
        });
      } else {
        await Order.updateOne(
          {
            _id: oid,
          },
          {
            $set: {
              track: value,
              orderStatus: value,
            },
          }
        ).then((response) => {
          res.json({ status: true });
        });
      }
    } catch (error) {
      console.log("Error Message :", error);
      error.admin = true;
      next(error);
    }
  },

  // bar chart details
  GetChartDetails: async (req, res, next) => {
    try {
      const value = req.query.value;
      var date = new Date();
      var month = date.getMonth();
      var year = date.getFullYear();
      let sales = [];
      if (value == 365) {
        year = date.getFullYear();
        var currentYear = new Date(year, 0, 1);
        let salesByYear = await Order.aggregate([
          {
            $match: {
              createdAt: { $gte: currentYear },
              orderStatus: { $eq: "Delivered" },
            },
          },
          {
            $group: {
              _id: { $dateToString: { format: "%m", date: "$createdAt" } },
              totalPrice: { $sum: "$total" },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]);

        for (let i = 1; i <= 12; i++) {
          let result = true;
          for (let k = 0; k < salesByYear.length; k++) {
            result = false;
            if (salesByYear[k]._id == i) {
              sales.push(salesByYear[k]);
              break;
            } else {
              result = true;
            }
          }
          if (result) sales.push({ _id: i, totalPrice: 0, count: 0 });
        }
        var lastYear = new Date(year - 1, 0, 1);
        let salesData = [];
        for (let i = 0; i < sales.length; i++) {
          salesData.push(sales[i].totalPrice);
        }
        res.json({ status: true, sales: salesData });
      } else if (value == 30) {
        console.log("month");
        let firstDay = new Date(year, month, 1);
        firstDay = new Date(firstDay.getTime() + 1 * 24 * 60 * 60 * 1000);
        let nextWeek = new Date(firstDay.getTime() + 7 * 24 * 60 * 60 * 1000);

        for (let i = 1; i <= 5; i++) {
          let abc = {};
          let salesByMonth = await Order.aggregate([
            {
              $match: {
                createdAt: { $gte: firstDay, $lt: nextWeek },
                orderStatus: { $eq: "Delivered" },
              },
            },
            {
              $group: {
                _id: moment(firstDay).format("DD-MM-YYYY"),
                totalPrice: { $sum: "$total" },
                count: { $sum: 1 },
              },
            },
          ]);
          if (salesByMonth.length) {
            sales.push(salesByMonth[0]);
          } else {
            (abc._id = moment(firstDay).format("DD-MM-YYYY")),
              (abc.totalPrice = 0);
            abc.count = 0;
            sales.push(abc);
          }

          firstDay = nextWeek;
          if (i == 4) {
            nextWeek = new Date(
              firstDay.getFullYear(),
              firstDay.getMonth() + 1,
              1
            );
          } else {
            nextWeek = new Date(
              firstDay.getFullYear(),
              firstDay.getMonth() + 0,
              (i + 1) * 7
            );
          }
        }

        let salesData = [];
        for (let i = 0; i < sales.length; i++) {
          salesData.push(sales[i].totalPrice);
        }
        res.json({ status: true, sales: salesData });
      } else if (value == 7) {
        let today = new Date();
        let lastDay = new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000);
        for (let i = 1; i <= 7; i++) {
          let abc = {};
          let salesByWeek = await Order.aggregate([
            {
              $match: {
                createdAt: { $lt: today, $gte: lastDay },
                orderStatus: { $eq: "Delivered" },
              },
            },
            {
              $group: {
                _id: moment(today).format("DD-MM-YYYY"),
                totalPrice: { $sum: "$total" },
                count: { $sum: 1 },
              },
            },
          ]);
          if (salesByWeek.length) {
            sales.push(salesByWeek[0]);
          } else {
            abc._id = today.getDay() + 1;
            abc.totalPrice = 0;
            abc.count = 0;
            sales.push(abc);
          }

          today = lastDay;
          lastDay = new Date(
            new Date().getTime() - (i + 1) * 24 * 60 * 60 * 1000
          );
        }

        let salesData = [];
        for (let i = 0; i < sales.length; i++) {
          salesData.push(sales[i].totalPrice);
        }

        res.json({ status: true, sales: salesData });
      }
    } catch (error) {
      console.log("Error Message :", error);
      error.admin = true;
      next(error);
    }
  },

  // get sales report

  salesReport: async (req, res, next) => {
    try {
      const salesReport = await Order.aggregate([
        {
          $match: { orderStatus: { $eq: "Delivered" } },
        },
        {
          $group: {
            _id: {
              month: { $month: "$createdAt" },
              day: { $dayOfMonth: "$createdAt" },
              year: { $year: "$createdAt" },
            },
            totalPrice: { $sum: "$total" },
            products: { $sum: { $size: "$products" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { date: -1 } },
      ]);

      // const filterOrder = await Order.find({})
      res.render("admin/sales_report", {
        layout: "layouts/adminLayout.ejs",
        salesReport,
      });
    } catch (error) {
      console.log("Error Message :", error);
      error.admin = true;
      next(error);
    }
  },

  // month report
  MonthReport: async (req, res, next) => {
    try {
      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      const salesReport = await Order.aggregate([
        {
          $match: { orderStatus: { $eq: "Delivered" } },
        },
        {
          $group: {
            _id: { month: { $month: "$createdAt" } },
            totalPrice: { $sum: "$total" },
            products: { $sum: { $size: "$products" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { date: -1 } },
      ]);
      const newSalesReport = salesReport.map((el) => {
        let newEl = { ...el };
        newEl._id.month = months[newEl._id.month - 1];
        return newEl;
      });
      res.render("admin/monthReport", {
        layout: "layouts/adminLayout.ejs",
        salesReport: newSalesReport,
      });
    } catch (error) {
      console.log("Error Message :", error);
      error.admin = true;
      next(error);
    }
  },

  // year report
  yearReport: async (req, res, next) => {
    try {
      const salesReport = await Order.aggregate([
        {
          $match: { orderStatus: { $eq: "Delivered" } },
        },
        {
          $group: {
            _id: { year: { $year: "$createdAt" } },
            totalPrice: { $sum: "$total" },
            products: { $sum: { $size: "$products" } },
            count: { $sum: 1 },
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
      ]);

      // const filterOrder = await Order.find({})
      res.render("admin/yearReport", {
        layout: "layouts/adminLayout.ejs",
        salesReport,
      });
    } catch (error) {
      console.log("Error Message :", error);
      error.admin = true;
      next(error);
    }
  },

  // pie chart details

  pieChart: async (req, res, next) => {
    try {
      const cancel = await Order.find({ orderStatus: "Cancelled" }).count();
      const Delivered = await Order.find({ orderStatus: "Delivered" }).count();
      const returned = await Order.find({ orderStatus: "Returnd" }).count();
      let data = [];
      data.push(cancel);
      data.push(Delivered);
      data.push(returned);

      res.json({ data });
    } catch (error) {
      console.log("Error Message :", error);
      error.admin = true;
      next(error);
    }
  },

  //  dashboard page
  dashboardView: async (req, res, next) => {
    try {
      let order = await Order.find();
      let orderCount = order.length;
      console.log("orderCount started : ", orderCount, "orderCount finished");
      let user = await User.find();
      let usersCount = user.length;
      const total = await Order.aggregate([
        {
          $group: {
            _id: order._id,
            total: {
              $sum: "$total",
            },
          },
        },
      ]);
      const totalProfit = total[0].total;

      let pending = await Order.aggregate([
        {
          $match: {
            paymentStatus: "Payment Pending",
          },
        },
        {
          $count: "Count",
        },
      ]);
      let pendingCount;
      if (pending.length != 0) {
        pendingCount = pending[0].Count;
      }
      res.render("admin/dashboard", {
        layout: "layouts/adminLayout.ejs",
        order,
        orderCount,
        usersCount,
        totalProfit,
        pendingCount,
        dashboard: true,
      });
    } catch (error) {
      console.log("Error Message :", error);
      error.admin = true;
      next(error);
    }
  },

  // log out
  logoutButton: (req, res, next) => {
    try {
      req.session.destroy();
      res.redirect("/admin");
    } catch (error) {
      console.log("Error Message :", error);
      error.admin = true;
      next(error);
    }
  },
};
