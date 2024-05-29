// src/controllers/BannerController.mjs
import BannerRepository from "../repositories/BannerRepository.mjs";

class BannerController {
    static async createBanner(req, res) {
        try {
            const { name, status, groupId } = req.body;
            const image = req.file;
            if (!name || !status || !groupId || !image) { return res.status(400).json({ status: 400, success: false, message: 'Name, status, groupID, and image are required fields.' });}
            const banner = await BannerRepository.createBanner({ name, status, groupId }, image.filename);
            res.status(201).json({ status: 201, success: true, message: 'Banner created successfully', banner });
        } catch (error) {
            BannerController.catchError(error, res);
        }
    }

    static async getAllBanners(req, res) {
        try {
            const banners = await BannerRepository.getAllBanners();
            res.status(200).json({ status: 200, success: true, message: 'Banners fetched successfully', banners });
        } catch (error) {
            BannerController.catchError(error, res);
        }
    }

    static async getBannerById(req, res) {
        try {
            const { id } = req.params;
            const banner = await BannerRepository.getBannerById(id);
            if (!banner) {
                return res.status(404).json({ status: 404, success: false, message: 'Banner not found.' });
            }
            res.status(200).json({ status: 200, success: true, message: 'Banner fetched successfully', banner });
        } catch (error) {
            BannerController.catchError(error, res);
        }
    }

    static async updateBannerById(req, res) {
        try {
            const { id } = req.params;
            const { name, status, groupId } = req.body;
            const image = req.file;

            if (!name && !status && !groupId && !image) {
                return res.status(400).json({ status: 400, success: false, message: 'No fields to update.' });
            }

            const bannerData = { name, status, groupId };
            const updatedBanner = await BannerRepository.updateBannerById(id, bannerData, image?.filename);
            if (!updatedBanner) {
                return res.status(404).json({ status: 404, success: false, message: 'Banner not found.' });
            }
            res.status(200).json({ status: 200, success: true, message: 'Banner updated successfully', banner: updatedBanner });
        } catch (error) {
            BannerController.catchError(error, res);
        }
    }

    static async deleteBannerById(req, res) {
        try {
            const { id } = req.params;
            const deletedBanner = await BannerRepository.deleteBannerById(id);
            if (!deletedBanner) {
                return res.status(404).json({ status: 404, success: false, message: 'Banner not found.' });
            }
            res.status(200).json({ status: 200, success: true, message: 'Banner deleted successfully', banner: deletedBanner });
        } catch (error) {
            BannerController.catchError(error, res);
        }
    }

    static catchError(error, res) {
        console.error('Error:', error);
        res.status(500).json({ status: 500, success: false, message: 'Internal server error.' });
    }
}

export default BannerController;
