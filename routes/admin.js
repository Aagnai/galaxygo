const express = require('express')
const router = express.Router()
const admincontroller = require('../controller/adminController')
const {adminVerifyLogin}=require('../middleware/adminVerifyLogin')


router.get('/', admincontroller.getAdminlogin)
router.get('/500',admincontroller.show500)


// get routes


router.get('/home',adminVerifyLogin, admincontroller.getAdminHome)
router.get('/users',adminVerifyLogin, admincontroller.userManagement)
router.get('/viewCategory',adminVerifyLogin, admincontroller.categoryManagement)
router.get('/addCategory',adminVerifyLogin, admincontroller.viewCategory)
router.get('/editCategory',adminVerifyLogin, admincontroller.getEditCategory)
router.get('/deleteCategory',adminVerifyLogin, admincontroller.deleteCategory)
router.get('/viewProducts',adminVerifyLogin, admincontroller.productManagement)
router.get('/addProducts',adminVerifyLogin, admincontroller.getAddProducts)
router.get('/editProduct',adminVerifyLogin, admincontroller.getEditProducts)
router.get('/deleteProduct',adminVerifyLogin, admincontroller.deleteProducts)
router.get('/addBanner',adminVerifyLogin,admincontroller.getAddBanner)
router.get('/banner/',adminVerifyLogin,admincontroller.getBanner)
router.get('/addCoupon',adminVerifyLogin,admincontroller.getAddCoupon)
router.get('/couponActive',adminVerifyLogin,admincontroller.couponActive)
router.get('/couponBlock',adminVerifyLogin,admincontroller.couponBlock)
router.get('/orders',adminVerifyLogin,admincontroller.ordersView)
router.get('/ChartDetails',adminVerifyLogin,admincontroller.GetChartDetails)
router.get('/salesReport',adminVerifyLogin,admincontroller.salesReport)
router.get('/monthReport',adminVerifyLogin,admincontroller.MonthReport)
router.get('/yearReport',adminVerifyLogin,admincontroller.yearReport)
router.get('/pieChart',adminVerifyLogin,admincontroller.pieChart)
router.get('/dashboard',adminVerifyLogin,admincontroller.dashboardView)
router.get('/logout',admincontroller.logoutButton)


// post routes

router.post('/', admincontroller.postAdminlogin)
router.post('/blockUser/:id',adminVerifyLogin, admincontroller.blockuser)
router.post('/unBlockUser/:id',adminVerifyLogin, admincontroller.unblockuser)
router.post('/addCategory',adminVerifyLogin, admincontroller.addCategory)
router.post('/editCategory/:id',adminVerifyLogin, admincontroller.postEditCategory)
router.post('/addProducts',adminVerifyLogin, admincontroller.postAddProducts)
router.post('/editProduct/:id',adminVerifyLogin, admincontroller.postEditProducts)
router.post('/banner/',adminVerifyLogin,admincontroller.postAddBanner)
router.post('/orderStatus',adminVerifyLogin,admincontroller.changeTrack)
router.get('/orderDetails/:id',adminVerifyLogin,admincontroller.getOrderDetails)

// extra routes

router.delete('/bannerDelete',adminVerifyLogin,admincontroller.deleteBanner)
router.delete('/userDelete',adminVerifyLogin,admincontroller.deleteUser)

// chain routes

router.
route('/coupon/')
.get(adminVerifyLogin,admincontroller.getCoupon)
.post(adminVerifyLogin,admincontroller.postAddCoupon)
.delete(adminVerifyLogin,admincontroller.deleteCoupon)



module.exports = router

