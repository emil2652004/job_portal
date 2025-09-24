const jsonwebtoken = require('jsonwebtoken');
const {login} = require('../models/login');
const { token: TokenModel } = require('../models/token'); // Make sure this import matches your token model

module.exports = {
   isAdmin: async (req, res, next) => {
        const authHeader = req.headers["authorization"];
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                status: false,
                message: 'Invalid token'
            });
        }
        const jwtToken = authHeader.split(" ")[1];
        if (!jwtToken) {
            return res.status(401).json({
                status: false,
                message: 'Invalid token'
            });
        }
        try {
            // Check if token exists in DB (by token string)
            const tokenDoc = await TokenModel.findOne({ token: jwtToken });
            if (!tokenDoc) {
                return res.status(401).json({
                    status: false,
                    message: 'Token expired or invalid'
                });
            }

            const decoded = jsonwebtoken.verify(jwtToken, process.env.JWT_SECRET || 'your_jwt_secret');
            const user = await login.findOne({ _id: decoded.userId, status: true });
            if (!user) {
                return res.status(401).json({
                    status: false,
                    message: 'Admin not found'
                });
            }
            if (user.role !== 'admin') {
                return res.status(403).json({
                    status: false,
                    message: 'Access denied. Admin only.'
                });
            }
            req.user = user;
            next();
        } catch (error) {
            return res.status(500).json({
                status: false,
                message: 'Internal server error'
            });
        }
    },
    isEmployer: async (req, res, next) => {
        const jwtToken = req.headers["token"];
        if (jwtToken) {
            try {
                // Check if token exists in DB
                const tokenDoc = await TokenModel.findOne({ token: jwtToken });
                if (!tokenDoc) {
                    return res.status(401).json({
                        status: false,
                        message: 'Token expired or invalid'
                    });
                }

                const decoded = jsonwebtoken.verify(jwtToken, process.env.JWT_SECRET || 'your_jwt_secret');
                const user = await login.findOne({ _id: decoded.userId, status: true });
                if (!user) {
                    return res.status(401).json({
                        status: false,
                        message: 'User not found'
                    });
                }
                if (user.role !== 'employer') {
                    return res.status(403).json({
                        status: false,
                        message: 'Access denied. Employers only.'
                    });
                }
                req.user = user;
                next();
            } catch (error) {
                return res.status(500).json({
                    status: false,
                    message: 'Internal server error'
                });
            }
        } else {
            return res.status(401).json({
                status: false,
                message: 'Invalid token'
            });
        }
    },
    isUser: async (req, res, next) => {
        const jwtToken = req.headers["token"];
        if (!jwtToken) {
            return res.status(401).json({
                status: false,
                message: 'Invalid token'
            });
        }
        try {
            // Check if token exists in DB
            const tokenDoc = await TokenModel.findOne({ token: jwtToken });
            if (!tokenDoc) {
                return res.status(401).json({
                    status: false,
                    message: 'Token expired or invalid'
                });
            }

            const decoded = jsonwebtoken.verify(jwtToken, process.env.JWT_SECRET || 'your_jwt_secret');
            const user = await login.findOne({ _id: decoded.userId, status: true });
            if (!user) {
                return res.status(401).json({
                    status: false,
                    message: 'User not found'
                });
            }
            if (user.role !== 'user') {
                return res.status(403).json({
                    status: false,
                    message: 'Access denied. User only.'
                });
            }
            req.user = user;
            next(); // Only call next if all checks pass
        } catch (error) {
            return res.status(500).json({
                status: false,
                message: 'Internal server error'
            });
        }
    }
};