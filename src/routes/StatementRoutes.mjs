// src/routes/WithdrawalRoutes.mjs
import express from 'express';
import StatementController from '../controllers/StatementController.mjs';

const router = express.Router();

// POST /Route to create a new statement request by userId
router.post('/createStatementByUserId/:userId', StatementController.createStatementByUserId);

// GET /Route to get all the statements
router.get('/getAllStatements', StatementController.getAllStatements);

// GET /Route to get a statement by Id
router.get('/getStatementById/:id', StatementController.getStatementById);

// PUT /Route to update a statement by Id
router.put('/updateStatementById/:id', StatementController.updateStatementById);

// DELET /Route to delete a statement by Id
router.delete('/deleteStatementById/:id', StatementController.deleteStatementById);

export default router;