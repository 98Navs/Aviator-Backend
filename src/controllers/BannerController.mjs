// src/controllers/BannerController.mjs
import BannerRepository from "../repositories/BannerRepository.mjs";

class BannerController {
    static async createBanner(req, res) {
        try {
            const { bannerData } = await BannerController.bannerValidation(req);
            const banner = await BannerRepository.createBanner( bannerData );
            res.status(201).json({ status: 201, success: true, message: 'Banner created successfully', banner });
        } catch (error) {
            BannerController.catchError(error, res);
        }
    }

    static async getAllBanners(req, res) {
        try {
            const { pageNumber = 1, perpage = 10 } = req.query;
            const options = { page: Number(pageNumber), limit: Number(perpage) };
            const banners = await BannerRepository.getAllBanners(options, req);
            if (banners.data.length === 0) { return res.status(404).json({ status: 404, success: false, message: 'No data found for the provided details.' }); }
            res.status(200).json({ status: 200, success: true, message: 'Banners fetched successfully', ...banners });
        } catch (error) {
            BannerController.catchError(error, res);
        }
    }

    static async getBannerById(req, res) {
        try {
            const { id } = req.params;
            const banner = await BannerController.validateAndFetchBannerById(id);
            res.status(200).json({ status: 200, success: true, message: 'Banner fetched successfully', banner });
        } catch (error) {
            BannerController.catchError(error, res);
        }
    }

    static async updateBannerById(req, res) {
        try {
            const { id } = req.params;
            await BannerController.validateAndFetchBannerById(id);
            const { bannerData } = await BannerController.bannerValidation(req);
            const updatedBanner = await BannerRepository.updateBannerById(id, bannerData);
            res.status(200).json({ status: 200, success: true, message: 'Banner updated successfully', updatedBanner });
        } catch (error) {
            BannerController.catchError(error, res);
        }
    }

    static async deleteBannerById(req, res) {
        try {
            const { id } = req.params;
            const banner = await BannerController.validateAndFetchBannerById(id);
            const deletedBanner = await BannerRepository.deleteBannerById(id, banner);
            res.status(200).json({ status: 200, success: true, message: 'Banner deleted successfully', deletedBanner });
        } catch (error) {
            BannerController.catchError(error, res);
        }
    }
    
    //Static Methods Only For This Class (Not To Be Used In Routes)
    static async validateAndFetchBannerById(id) {
        if (!/^[0-9a-fA-F]{24}$/.test(id)) { throw new ValidationError('Invalid Id format.'); }
        const banner = await BannerRepository.getBannerById(id);
        if (!banner) { throw new NotFoundError('Banner not found.'); }
        return banner;
    }

    static async bannerValidation(req) {
        const { name, groupId, status } = req.body;
        const images = req.files;

        const requiredFields = { name, groupId, status };
        const missingFields = Object.entries(requiredFields)
            .filter(([_, value]) => value === undefined || value === '')
            .map(([field]) => field.charAt(0).toUpperCase() + field.slice(1));
        if (missingFields.length > 0) { throw new ValidationError(`Missing required fields: ${missingFields.join(', ')}`); }
        if (images.length === 0 || images.length >5) { throw new ValidationError('Atleast one image is required and maximum 5 images, key is images.'); }
        
        const validStatuses = ['Active', 'Deactive'];
        if (!validStatuses.includes(status)) { throw new ValidationError('OfferStatus must be one of: Active or Deactive'); }

        const imageFilenames = images.map(image => image.filename);
        const bannerData = { name, groupId, status, images: imageFilenames };
        bannerData.name = name.trim();
        bannerData.groupId = groupId.trim();
        bannerData.status = status.trim();
        return { bannerData };
    }

    static async catchError(error, res) {
        try {
            if (error instanceof ValidationError) { res.status(400).json({ status: 400, success: false, message: error.message }); }
            else if (error instanceof NotFoundError) { res.status(404).json({ status: 404, success: false, message: error.message }); }
            else { res.status(500).json({ status: 500, success: false, message: 'Internal server error.' }); }
        } catch (error) {
            res.status(500).json({ status: 500, success: false, message: 'Something unexpected has happened' });
        }
    }
}

class ValidationError extends Error { constructor(message) { super(message); this.name = 'ValidationError'; } }
class NotFoundError extends Error { constructor(message) { super(message); this.name = 'NotFoundError'; } }

export default BannerController;
