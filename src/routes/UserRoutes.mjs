//src/routes/UserRoutes.mjs
import express from 'express';
import UserController from '../controllers/UserController.mjs';
import UserRegistrationController from '../controllers/UserRegistrationController.mjs';
import Middleware from '../project_setup/Middleware.mjs'
import { uploadImages } from '../project_setup/Utils.mjs';

const router = express.Router();

// POST /Route to create a new user
router.post('/createUser', uploadImages.single('image'), UserRegistrationController.createUser);

// POST /Route for user to signIn
router.post('/signIn', UserRegistrationController.signIn);

// POST /Route for user to signOut
router.post('/signOut', Middleware.user, UserRegistrationController.signOut);

// POST /Route for user to apply for forgetPassword
router.post('/forgetPassword', UserRegistrationController.forgetPassword);

// POST /Route for user confirm otp
router.post('/otp', UserRegistrationController.otp);

// POST /Route for user to changePassword
router.post('/changePassword', UserRegistrationController.changePassword);

// POST /Route for admin to deductMoney from userWallet
router.post('/deductAmountByUserId/:userId', Middleware.admin, UserController.deductAmountByUserId);

// GET /Route to get all users
router.get('/getAllUsers', Middleware.admin, UserController.getAllUsers);

// GET /Route to get a user by userId
router.get('/getUserByUserId/:userId', Middleware.admin, UserController.getUserByUserId);

// GET /Route to get all users whose role is "affiliate"
router.get('/getAllAffiliateUsers', Middleware.admin, UserController.getAllAffiliateUsers);

// GET /Route to get refferring users"
router.get('/getRefferringUsers', Middleware.admin, UserController.getRefferringUsers);

// GET /Route to get all sub registered users"
router.get('/getAllSubRegisteredUsersByPromoCode', Middleware.affiliate, UserController.getAllSubRegisteredUsersByPromoCode);

// GET /Route to get allowed roles and status types
router.get('/getAllowedRolesAndStatusTypes', Middleware.admin, UserController.getAllowedRolesAndStatusTypes);

// GET /Route to get wallet details by userID
router.get('/getWalletByUserId/:userId', Middleware.admin, UserController.getWalletByUserId);

// GET /Route to export all users as CSV
router.get('/getAllUsersDataInCSV', Middleware.admin, UserController.getAllUsersDataInCSV);

// PUT /Route to update a user by userId
router.put('/updateUserByUserId/:userId', Middleware.admin, UserController.updateUserByUserId);

// PUT /Route to update a user image by userId
router.put('/changeUserImageByUserId/:userId', uploadImages.single('image'), UserRegistrationController.changeUserImage);

// DELETE /Route to delete a user by userId
router.delete('/deleteUserByUserId/:userId', Middleware.admin, UserController.deleteUserByUserId);

export default router;