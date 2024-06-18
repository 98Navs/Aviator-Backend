// src/routes/BannerRoutes.mjs
import express from 'express';
import BannerController from '../controllers/BannerController.mjs';
import { uploadImages } from '../project_setup/Utils.mjs';

const router = express.Router();

// POST /Route to create a new Banner
router.post('/createBanner', uploadImages.array('images', 9999999999), BannerController.createBanner);

// GET /Route to get all Banners
router.get('/getAllBanners', BannerController.getAllBanners);

// GET /Route to get a specific Banner by its ID
router.get('/getBannerById/:id', BannerController.getBannerById);

// GET /Route to get all allowed status types
router.get('/getBannerAllowedStatusTypes', BannerController.getBannerAllowedStatusTypes);

// PUT /Route to update a specific Banner by its ID
router.put('/updateBannerById/:id', uploadImages.array('images', 9999999999), BannerController.updateBannerById);

// DELETE /Route to delete a specific Banner by its ID
router.delete('/deleteBannerById/:id', BannerController.deleteBannerById);

export default router;
