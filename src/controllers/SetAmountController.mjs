//scr/controllers/UserController.mjs
import SetAmountRepository from "../repositories/SetAmountRepository.mjs";
import mongoose from 'mongoose';
class SetAmountController {
    static async createAmount(req, res) {
        try {

            const { name, value } = req.body;

            if (!name || typeof name !== 'string' || name.trim().length === 0) {
                return res.status(400).json({ success: false, message: 'Invalid name provided. Name must be a non-empty string.' });
            }

            if (!value || typeof value !== 'string' || value.trim().length === 0) {
                return res.status(400).json({ success: false, message: 'Invalid value provided. Value must be a non-empty string.' });
            }
            const data = await SetAmountRepository.createSetting(name, value);
            if (data) {
                return res.json(data);
            } else {
                return res.status(404).json({ success: false, message: "Data not found!" });
            }
            res.status(200).json({ success: true, message: 'Setting created successfully' });

        } catch (error) {
            console.error(error.message);

            if (error.name === 'ValidationError') {
                return res.status(400).json({ success: false, message: error.message });
            }
            res.status(500).json({ error: error.message });
        }

    }
    static async getAllAmount(req, res) {
        try {
            const result = await SetAmountRepository.getAllAmount()
            if (result.success) {
                return res.status(200).json(result);
            } else {
                return res.status(404).json(result);
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async getSetAmount(req, res) {
        try {
            const Id = req.params.id

            if (!mongoose.Types.ObjectId.isValid(Id)) {
                return res.status(400).json({ success: false, message: "Invalid ID format" });
            }

            const result = await SetAmountRepository.getAmount(Id)
            if (result.success) {
                return res.status(200).json(result);
            } else {
                return res.status(404).json(result);
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async updateSetAmount(req, res) {
        try {
            const { name, value } = req.body;
            const settingId = req.params.id;

            if (!mongoose.Types.ObjectId.isValid(settingId)) {
                return res.status(400).json({ success: false, message: 'Invalid setting ID format' });
            }
            if (!name || typeof name !== 'string' || name.trim().length === 0) {
                return res.status(400).json({ success: false, message: 'Invalid name provided. Name must be a non-empty string.' });
            }

            if (!value || typeof value !== 'string' || value.trim().length === 0) {
                return res.status(400).json({ success: false, message: 'Invalid value provided. Value must be a non-empty string.' });
            }
            const result = await SetAmountRepository.updateSetAmount(settingId, name, value);

            if (result.success) {
                return res.status(200).json(result);
            } else if (result.message === 'Invalid setting ID format' || result.message === 'Setting with the same name already exists') {
                return res.status(400).json(result);
            } else {
                return res.status(404).json(result);
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async deleteSetAmount(req, res) {
        try {
            const settingId = req.params.id;

            if (!mongoose.Types.ObjectId.isValid(settingId)) {
                return res.status(400).json({ success: false, message: 'Invalid setting ID format' });
            }

            const result = await SetAmountRepository.deleteSetAmount(settingId);

            if (result.success) {
                return res.status(200).json(result);
            } else {
                return res.status(404).json(result);
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

}


export default SetAmountController;