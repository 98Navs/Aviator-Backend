// src/repository/ManageQueriesRepository.mjs
import ManageQueries from "../models/ManageQueriesModel.mjs";
import { paginate } from "../project_setup/Utils.mjs";

class ManageQueriesRepository {

    static async createManageQuery(manageQueriesData) { return await ManageQueries.create(manageQueriesData); }

    static async getAllManageQueries(options, req) { return await paginate(ManageQueries, {}, options.page, options.limit, req); }

    static async getManageQueryByManageQueryId(manageQueryId) { return await ManageQueries.findOne({ manageQueryId }); }

    static async updateManageQueryByManageQueryId(manageQueryId, updateData) { return await ManageQueries.findOneAndUpdate({ manageQueryId }, updateData, { new: true }); }

    static async deleteManageQueryByManageQueryId(manageQueryId) { return await ManageQueries.findOneAndDelete({ manageQueryId }); }

    static async filterManageQueries(filterParams, options, req) {
        const query = {};

        if (filterParams.status) { query.status = new RegExp(`^${filterParams.status}`, 'i'); }
        if (filterParams.priority) { query.priority = new RegExp(`^${filterParams.priority}`, 'i'); }
        if (filterParams.search) {
            const searchRegex = new RegExp(`^${filterParams.search}`, 'i');
            query.$or = [
                { $expr: { $regexMatch: { input: { $toString: "$userId" }, regex: searchRegex } } },
                { userName: searchRegex },
                { email: searchRegex },
                { assignedTo: searchRegex }
            ];
        }
        if (filterParams.startDate || filterParams.endDate) {
            query.createdAt = {};
            if (filterParams.startDate) query.createdAt.$gte = new Date(filterParams.startDate);
            if (filterParams.endDate) {
                query.createdAt.$lte = new Date(new Date(filterParams.endDate).setHours(23, 59, 59, 999));
            }
        }
        return await paginate(ManageQueries, query, options.page, options.limit, req);
    }
}

export default ManageQueriesRepository;
