// src/routes/RechargeRoutes.mjs
import express from 'express';
import RechargeController from '../controllers/RechargeController.mjs';
import { uploadImages } from '../project_setup/Utils.mjs';

const router = express.Router();

// POST /Route to create a new recharge request by userId
router.post('/createRechargeByUserId/:userId', uploadImages.single('paymentProof'), RechargeController.createRechargeByUserId);

// GET /Route to get all the recharges
router.get('/getAllRecharges', RechargeController.getAllRecharges);

// GET /Route to get a recharge by rechargeId
router.get('/getRechargeByRechargeId/:rechargeId', RechargeController.getRechargeByRechargeId);

// PUT /Route to update a recharge by rechargeId
router.put('/updateRechargeByRechargeId/:rechargeId', RechargeController.updateRechargeByRechargeId);

// DELET /Route to delete a recharge by rechargeId
router.delete('/deleteRechargeByRechargeId/:rechargeId', RechargeController.deleteRechargeByRechargeId);

export default router;
