if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const multer = require("multer");
const flash = require("connect-flash");
const apphelper = require("./middleware/apphelper");
const morgan = require("morgan");

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/admin/uploads");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
  },
});
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/webp" ||
    file.mimetype === "image/avif"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const app = express();

const adminRouter = require("./routes/admin");
const indexRouter = require("./routes/user");

app.use(expressLayouts);
app.set("layout", path.join(__dirname, "views/layouts/separate"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(flash());
app.use(morgan("dev"));
app.use(
  multer({ storage: fileStorage, fileFilter }).fields([
    { name: "categoryImage" },
    { name: "productImage", maxCount: 3 },
    { name: "imageUrl" },
  ])
);

app.use(express.json());

const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const { AppContext } = require("twilio/lib/rest/microvisor/v1/app");
mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
});

const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to mongoose"));

app.use(function (req, res, next) {
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  res.header("Expires", "-1");
  res.header("Pragma", "no-cache");
  next();
});

app.use(
  session({
    secret: "keyboard cat",
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 6000000 },
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(apphelper.userInViews);

app.use("/", indexRouter);
app.use("/admin", adminRouter);

// app.use((req,res,next)=>{
//   next(new Error('Error handling',404))
// })

app.use((err, req, res, next) => {
  console.log("error is showing :", err);
  const error = err.message;

  if (err.status) {
    err.status.startsWith("4")
      ? res.render("admin/404", { error })
      : res.render("admin/500");
  } else {
    res.render("admin/500", { error: "Server 500 Error" });
  }
});
app.listen(process.env.PORT || 3000);
