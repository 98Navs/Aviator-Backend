// src/routes/ManageQueriesRoutes.mjs
import express from 'express';
import Middleware from '../project_setup/Middleware.mjs'
import ManageQueriesController from '../controllers/ManageQueriesController.mjs';

const router = express.Router();

router.post('/createManageQueries', Middleware.user, ManageQueriesController.createManageQueries);

router.get('/getAllManageQueries', Middleware.admin, ManageQueriesController.getAllManageQueries);

router.get('/getManageQueryByManageQueryId/:manageQueryId', Middleware.admin, ManageQueriesController.getManageQueryByManageQueryId);

router.put('/updateManageQueryByManageQueryId/:manageQueryId', Middleware.admin, ManageQueriesController.updateManageQueryByManageQueryId);

router.delete('/deleteManageQueryByManageQueryId/:manageQueryId', Middleware.admin, ManageQueriesController.deleteManageQueryByManageQueryId);

export default router;
