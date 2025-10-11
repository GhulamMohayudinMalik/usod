import { SecurityLog } from '../models/SecurityLog.js';
import mongoose from 'mongoose';

export const logController = {
  getLogs: async (req, res) => {
    try {
      const { page = 1, limit = 20, action, status, startDate, endDate } = req.query;
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);

      const filter = {};
      if (action) filter.action = action;
      if (status) filter.status = status;
      if (startDate || endDate) {
        filter.timestamp = {};
        if (startDate) filter.timestamp.$gte = new Date(startDate);
        if (endDate) filter.timestamp.$lte = new Date(endDate);
      }

      const totalLogs = await SecurityLog.countDocuments(filter);
      const logs = await SecurityLog.find(filter)
        .populate('userId', 'username email')
        .sort({ timestamp: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum);

      const totalPages = Math.ceil(totalLogs / limitNum);
      return res.json({ logs, pagination: { total: totalLogs, page: pageNum, limit: limitNum, totalPages } });
    } catch (error) {
      console.error('Error fetching logs:', error);
      return res.status(500).json({ message: 'Error fetching logs', error: error.message });
    }
  },

  getLogStatistics: async (req, res) => {
    try {
      const results = { totalLogs: 0, byStatus: { success: 0, failure: 0 }, byAction: {}, recent: { day: 0, week: 0, month: 0 } };
      const now = new Date();
      const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      results.totalLogs = await SecurityLog.countDocuments();

      const statusStats = await SecurityLog.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
      statusStats.forEach((stat) => { results.byStatus[stat._id] = (results.byStatus[stat._id] || 0) + stat.count; });

      const actionStats = await SecurityLog.aggregate([{ $group: { _id: '$action', count: { $sum: 1 } } }]);
      actionStats.forEach((stat) => { results.byAction[stat._id] = (results.byAction[stat._id] || 0) + stat.count; });

      results.recent.day = await SecurityLog.countDocuments({ timestamp: { $gte: dayAgo } });
      results.recent.week = await SecurityLog.countDocuments({ timestamp: { $gte: weekAgo } });
      results.recent.month = await SecurityLog.countDocuments({ timestamp: { $gte: monthAgo } });

      return res.json(results);
    } catch (error) {
      console.error('Error fetching log statistics:', error);
      return res.status(500).json({ message: 'Error fetching log statistics', error: error.message });
    }
  },

  getLogsByUser: async (req, res) => {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 20 } = req.query;
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);

      if (!userId) return res.status(400).json({ message: 'User ID is required' });

      const filter = {};
      if (mongoose.Types.ObjectId.isValid(userId)) filter.userId = userId;
      else return res.status(400).json({ message: 'Invalid user ID format' });

      const totalLogs = await SecurityLog.countDocuments(filter);
      const logs = await SecurityLog.find(filter).sort({ timestamp: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum);
      const totalPages = Math.ceil(totalLogs / limitNum);

      return res.json({ logs, pagination: { total: totalLogs, page: pageNum, limit: limitNum, totalPages } });
    } catch (error) {
      console.error('Error fetching logs by user:', error);
      return res.status(500).json({ message: 'Error fetching logs by user', error: error.message });
    }
  },

  createLog: async (req, res) => {
    try {
      const logData = req.body;
      if (!logData.action || !logData.status) return res.status(400).json({ message: 'Log data must include action and status' });
      if (!logData.timestamp) logData.timestamp = new Date();
      if (req.user?.id) logData.userId = req.user.id;

      const securityLog = new SecurityLog(logData);
      const savedLog = await securityLog.save();
      return res.status(201).json({ message: 'Log created', log: savedLog });
    } catch (error) {
      console.error('Error creating log:', error);
      return res.status(500).json({ message: 'Error creating log', error: error.message });
    }
  },

  clearLogs: async (req, res) => {
    try {
      const result = await SecurityLog.deleteMany({});
      return res.json({
        message: 'All logs cleared successfully',
        deletedCount: result.deletedCount
      });
    } catch (error) {
      console.error('Error clearing logs:', error);
      return res.status(500).json({ message: 'Error clearing logs', error: error.message });
    }
  }
};
