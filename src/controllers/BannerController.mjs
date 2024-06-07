// src/controllers/BannerController.mjs
import BannerRepository from "../repositories/BannerRepository.mjs";
import { ErrorHandler, ValidationError, NotFoundError } from '../controllers/ErrorHandler.mjs'

class BannerController {
    static async createBanner(req, res) {
        try {
            const bannerData = await BannerController.bannerValidation(req);
            const banner = await BannerRepository.createBanner( bannerData );
            res.status(201).json({ status: 201, success: true, message: 'Banner created successfully', banner });
        } catch (error) {
            ErrorHandler.catchError(error, res);
        }
    }

    static async getAllBanners(req, res) {
        try {
            const { pageNumber = 1, perpage = 10 } = req.query;
            const options = { page: Number(pageNumber), limit: Number(perpage) };
            const banners = await BannerRepository.getAllBanners(options, req);
            res.status(200).json({ status: 200, success: true, message: 'Banners fetched successfully', ...banners });
        } catch (error) {
            ErrorHandler.catchError(error, res);
        }
    }

    static async getBannerById(req, res) {
        try {
            const { id } = req.params;
            const banner = await BannerController.validateAndFetchBannerById(id);
            res.status(200).json({ status: 200, success: true, message: 'Banner fetched successfully', banner });
        } catch (error) {
            ErrorHandler.catchError(error, res);
        }
    }

    static async updateBannerById(req, res) {
        try {
            const { id } = req.params;
            await BannerController.validateAndFetchBannerById(id);
            const bannerData = await BannerController.bannerValidation(req, true);
            const updatedBanner = await BannerRepository.updateBannerById(id, bannerData);
            res.status(200).json({ status: 200, success: true, message: 'Banner updated successfully', updatedBanner });
        } catch (error) {
            ErrorHandler.catchError(error, res);
        }
    }

    static async deleteBannerById(req, res) {
        try {
            const { id } = req.params;
            const banner = await BannerController.validateAndFetchBannerById(id);
            const deletedBanner = await BannerRepository.deleteBannerById(id, banner);
            res.status(200).json({ status: 200, success: true, message: 'Banner deleted successfully', deletedBanner });
        } catch (error) {
            ErrorHandler.catchError(error, res);
        }
    }
    
    //Static Methods Only For This Class (Not To Be Used In Routes)
    static async validateAndFetchBannerById(id) {
        if (!/^[0-9a-fA-F]{24}$/.test(id)) { throw new ValidationError('Invalid Id format.'); }
        const banner = await BannerRepository.getBannerById(id);
        if (!banner) { throw new NotFoundError('Banner not found.'); }
        return banner;
    }

    static async bannerValidation(data, isUpdate = false) {
        const { name, groupId, status } = data.body;
        const images = data.files;

        const requiredFields = { name, groupId, status };
        const missingFields = Object.entries(requiredFields)
            .filter(([_, value]) => value === undefined || value === '')
            .map(([field]) => field.charAt(0).toUpperCase() + field.slice(1));
        if (missingFields.length > 0) { throw new NotFoundError(`Missing required fields: ${missingFields.join(', ')}`); }
        
        if (typeof name !== 'string') { throw new ValidationError('Name must be a string'); }
        if (typeof groupId !== 'string') { throw new ValidationError('GroupId must be a string'); }
        if (typeof status !== 'string') { throw new ValidationError('Status must be a string'); }

        const validStatuses = ['Active', 'Deactive'];
        if (!validStatuses.includes(status)) { throw new ValidationError(`Status must be one of: ${validStatuses.join(', ')} without any space`); } 
        if (images.length === 0 || images.length > 5) { throw new ValidationError('Atleast one image is required and maximum 5 images, key is images.'); }

        const imageFilenames = images.map(image => image.filename);
        const bannerData = { name: name.trim(), groupId: groupId.trim(), status, images: imageFilenames, };

        if (!isUpdate) {
            const existingName = await BannerRepository.checkDuplicateBannrName(bannerData.name);
            if (existingName && existingName.status === 'Active') { throw new ValidationError('A banner with Active status for same name already exists.'); }
            const existingGroupId = await BannerRepository.checkDuplicateGroupId(bannerData.groupId);
            if (existingGroupId && existingGroupId.status === 'Active') { throw new ValidationError('A groupId with Active status for same groupId already exists.'); }
        }

        return bannerData;
    }
}

export default BannerController;