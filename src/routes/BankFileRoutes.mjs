//src/routes/BankFileRoutes.mjs
import express from 'express';
import BankController from '../controllers/BankFileController.mjs';
import Middleware from '../project_setup/Middleware.mjs'

const router = express.Router();


router.post('/bankAccount', Middleware.admin, BankController.createBank);


router.get('/bankAccountAll', Middleware.admin, BankController.getAllBank);


router.get('/bankAccountActive',Middleware.admin,BankController.getActiveBank)

router.get('/bankAccount/:id', Middleware.admin, BankController.getBankById);


router.put('/bankAccount/:id', Middleware.admin, BankController.updateBankById);


router.delete('/bankAccount/:id', Middleware.admin, BankController.deleteBankById);

router.get('/changeStatus/:id', Middleware.admin, BankController.changeStatusById)

export default router;
