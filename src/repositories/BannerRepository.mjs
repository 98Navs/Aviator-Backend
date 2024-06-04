// src/repositories/BannerRepository.mjs
import Banner from '../models/BannerModel.mjs';
import { paginate } from '../project_setup/Utils.mjs';
import fs from 'fs';
import path from 'path';

class BannerRepository {
    static async createBanner(bannerData) { return await Banner.create(bannerData); }

    static async getAllBanners(options, req) { return await paginate(Banner, {}, options.page, options.limit, req); }

    static async getBannerById(id) { return await Banner.findById(id); }

    static async updateBannerById(id, bannerData) {
        const existingBanner = await Banner.findById(id);
        await Promise.all(existingBanner.images.map(image =>
            fs.promises.unlink(path.join('src/public/uploads', image)).catch(err => {
                if (err.code !== 'ENOENT') throw err;
            })
        ));
        return await Banner.findByIdAndUpdate(id, bannerData, { new: true });
    }

    static async deleteBannerById(id, banner) {
        await Promise.all(banner.images.map(image =>
            fs.promises.unlink(path.join('src/public/uploads', image)).catch(err => {
                if (err.code !== 'ENOENT') throw err;
            })
        ));
        return await Banner.findByIdAndDelete(id);
    }
}

export default BannerRepository;