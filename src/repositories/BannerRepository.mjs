// src/repositories/BannerRepository.mjs
import Banner from '../models/BannerModel.mjs';

class BannerRepository {
    static async createBanner(bannerData, imageFilename) {
            bannerData.image = imageFilename;
            return await Banner.create(bannerData);
    }

    static async getAllBanners() { return await Banner.find(); }

    static async getBannerById(id) { return await Banner.findById(id); }

    static async updateBannerById(id, bannerData, imageFilename) {
        try {
            const banner = await Banner.findById(id);
            if (!banner) return null;

            if (imageFilename) {
                bannerData.image = imageFilename;
            }

            Object.assign(banner, bannerData);
            return await banner.save();
        } catch (error) {
            throw error;
        }
    }

    static async deleteBannerById(id) { return await Banner.findByIdAndDelete(id); }
}

export default BannerRepository;
