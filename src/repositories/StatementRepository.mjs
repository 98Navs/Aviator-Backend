// src/repository/StatementRepository.mjs
import Statement from "../models/StatementModel.mjs";
import { paginate } from "../project_setup/Utils.mjs";

class StatementRepository{

    static async createStatement(data) { return await Statement.create(data); }

    static async getAllStatement(options, req) { return await paginate(Statement, {}, options.page, options.limit, req); }

    static async getStatementById(id) { return await Statement.findById(id); }

    static async getStatementsByUserId(userId, options, req) {
        const query = { userId };
        return await paginate(Statement, query, options.page, options.limit, req);
    }

    static async updateStatementById(id, updateData) { return await Statement.findByIdAndUpdate(id, updateData, { new: true }); }

    static async deleteStatementById(id) { return await Statement.findByIdAndDelete(id); }

    static async filterStatements(filterParams, options, req) {
        const query = {};

        if (filterParams.status) { query.status = new RegExp(`^${filterParams.status}`, 'i'); }
        if (filterParams.search) {
            const searchRegex = new RegExp(`^${filterParams.search}`, 'i');
            query.$or = [
                { $expr: { $regexMatch: { input: { $toString: "$userId" }, regex: searchRegex } } },
                { userName: searchRegex }
            ];
        }
        if (filterParams.startDate || filterParams.endDate) {
            query.createdAt = {};
            if (filterParams.startDate) query.createdAt.$gte = new Date(filterParams.startDate);
            if (filterParams.endDate) { query.createdAt.$lte = new Date(new Date(filterParams.endDate).setHours(23, 59, 59, 999)); }
        }
        return await paginate(Statement, query, options.page, options.limit, req);
    }
}
export default StatementRepository;