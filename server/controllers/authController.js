const authService = require('../services/authService');

const authController = {
    async signUp(req, res, next) {
        try {
            const user = await authService.createUser(req.body)
            const token = await user.genToken()
            res.cookie('token', token)
            res.status(201).json({message: 'User created successfully',user, token})
        } catch (error) {
            next(error);
        }
    },
    
    async login(req, res, next) {
        try {
            const user = await authService.login(req.body)
            const token = await user.genToken()
            res.cookie('token', token)
            res.status(200).json({message: 'User logged in successfully',user, token})
        } catch (error) {
            next(error);
        }
    } 
};

module.exports = authController;