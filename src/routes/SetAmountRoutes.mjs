import express from 'express';
import Middleware from '../project_setup/Middleware.mjs';

const router = express.Router();


router.post('/setAmount', Middleware.admin, SetAmountController.createAmount);


router.get('/setAmountAll', Middleware.admin, SetAmountController.getAllAmount);


router.get('/setAmount/:id', Middleware.admin, SetAmountController.getSetAmount)


router.put('/setAmount/:id', Middleware.admin, SetAmountController.updateSetAmount);


router.delete('/setAmount/:id', Middleware.admin, SetAmountController.deleteSetAmount);



export default router;
