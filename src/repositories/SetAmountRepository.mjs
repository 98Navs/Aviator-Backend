import { generatePaginationUrls } from '../utils/index.mjs'
import SetAmount from '../models/SetAmountModel.mjs'


class SetAmountRepository {
    static async createSetting(name, value) {
        try {
            const setup = await SetAmount.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
            if (setup) {
                return { success: false, message: "Setting with the same name already exists" }
            }

            const setting = new SetAmount(
                { 
                  name, 
                  value 
                });

            await setting.validate();
            await setting.save();
            // Success response when setting is created successfully
            return { success: true, message: 'Setting created successfully', data: setting };
            

        } catch (error) {
            throw new Error('Error creating user: ' + error.message);
        }
    }

    static async getAllAmount(req, res) {
        try {
            const data = await SetAmount.find();
            if (data.length > 0) {
                return { success: true, message: "All data fetched successfully", data };
            } else {
                return { success: false, message: "Data not found" };
            }
        } catch (error) {
            throw new Error('Error creating user: ' + error.message);
        }
    }
    static async getAmount(Id){
        try {
            const data = await SetAmount.findById(Id);
            if (data) {
                return { success: true, message: "Data fetched successfully", data };
            } else {
                return { success: false, message: "Data not found" };
            }
        } catch (error) {
            throw new Error('Error creating user: ' + error.message); 
        }
    }

    static async updateSetAmount(settingId, name, value){
        try {
          
            const existingSetting = await SetAmount.findOne({ _id: { $ne: settingId }, name: { $regex: new RegExp(`^${name}$`, 'i') } });
            if (existingSetting) {
                return { success: false, message: 'Setting with the same name already exists' };
            }

            const updatedSetting = await SetAmount.findByIdAndUpdate(
                settingId,
                { name, value },
                { new: true, runValidators: true }
            );

            if (!updatedSetting) {
                return { success: false, message: 'Setting not found' };
            }

            return { success: true, message: 'Setting updated successfully', data: updatedSetting };
        } catch (error) {
            throw new Error('Error creating user: ' + error.message);  
        }
    }

    static async deleteSetAmount(settingId){
        try {
            const deletedSetting = await SetAmount.findByIdAndDelete(settingId);

            if (!deletedSetting) {
                return { success: false, message: 'Setting not found' };
            }

            return { success: true, message: 'Setting deleted successfully', data: deletedSetting };
        } catch (error) {
            throw new Error('Error creating user: ' + error.message);  
        }
    }

}

export default SetAmountRepository;