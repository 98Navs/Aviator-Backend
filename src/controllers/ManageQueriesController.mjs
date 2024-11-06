// src/controllers/ManageQueriesController.mjs
import ManageQueriesRepository from "../repositories/ManageQueriesRepository.mjs";
import UserRepository from "../repositories/UserRepository.mjs";
import { CommonHandler, NotFoundError, ValidationError } from "./CommonHandler.mjs";

class ManageQueriesController{
    static async createManageQueries(req, res) {
        try {
            const manageQueriesData = await ManageQueriesController.manageQueryCreateValidation(req);
            const manageQuery = await ManageQueriesRepository.createManageQuery(manageQueriesData);
            res.status(201).json({ status: 201, success: true, message: 'Manage Query created successfully', data: manageQuery });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    static async getAllManageQueries(req, res) {
        try {
            const { status, priority, search, startDate, endDate, pageNumber = 1, perpage = 10 } = req.query;
            const options = { page: Number(pageNumber), limit: Number(perpage) };
            const filterParams = { status, priority, search, startDate, endDate };
            const manageQueries = Object.keys(filterParams).length > 0 ?
                await ManageQueriesRepository.filterManageQueries(filterParams, options, req) :
                await ManageQueriesRepository.getAllManageQueries(options, req);
            res.status(200).json({ status: 200, success: true, message: 'All manage queries fetched successfully', data: manageQueries });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }
    
    static async getManageQueryByManageQueryId(req, res) {
        try {
            const { manageQueryId } = req.params;
            const manageQuery = await ManageQueriesController.validateAndFetchManageQueryByManageQueryId(manageQueryId);
            res.status(200).json({ status: 200, success: true, message: 'Manage query fetched successfully', data: manageQuery });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    static async updateManageQueryByManageQueryId(req, res) {
        try {
            const { manageQueryId } = req.params;
            await ManageQueriesController.validateAndFetchManageQueryByManageQueryId(manageQueryId);
            const updatedManageQueryData = await ManageQueriesController.manageQueryCreateValidation(req)
            const updatedManageQuery = await ManageQueriesRepository.updateManageQueryByManageQueryId(manageQueryId, updatedManageQueryData);
            res.status(200).json({  status: 200, success: true, message: 'Manage query updated successfully', data: updatedManageQuery });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    static async deleteManageQueryByManageQueryId(req, res) {
        try {
            const { manageQueryId } = req.params;
            await ManageQueriesController.validateAndFetchManageQueryByManageQueryId(manageQueryId);
            const deletedManageQuery = await ManageQueriesRepository.deleteManageQueryByManageQueryId(manageQueryId);
            res.status(200).json({ status: 200, success: true, message: 'Manage query deleted successfully', data: deletedManageQuery });
        } catch (error) {
            CommonHandler.catchError(error, res);
        }
    }

    // Static Methods Only For This Class (Not To Be Used In Routes)
    static async validateAndFetchManageQueryByManageQueryId(manageQueryId) {
        await CommonHandler.validateSixDigitIdFormat(manageQueryId);
        const manageQuery = await ManageQueriesRepository.getManageQueryByManageQueryId(manageQueryId);
        if (!manageQuery) { throw new NotFoundError(`ManageQuery with manageQueryId ${manageQueryId} not found`); }
        return manageQuery;
    }

    static async manageQueryCreateValidation(data) {
        const { priority, description, status } = data.body;
        const userId = data.user.userId;

        await CommonHandler.validateRequiredFields({ priority, description });
        if (!Array.isArray(description) || description.length === 0) { throw new ValidationError('Description must be a non-empty array'); }
        
        const [user, admin] = await Promise.all([UserRepository.getUserByUserId(userId), UserRepository.getUserByEmail('admin@scriza.in')]);
        if (!user || !admin) { throw new NotFoundError('User or Admin profile not found') };
        if (status) { data.body.status = status; }

        return { ...data.body, userId: user.userId, userName: user.userName, email: user.email, assignedTo: admin.userName, priority, description };
    }

} export default ManageQueriesController;