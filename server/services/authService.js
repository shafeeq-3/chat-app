
const { userSchema } = require('../models/userModel')
const { ApiError } = require('../middlewares/ApiError')

const createUser = async (body) => {
    try {
        if (await userSchema.findOne({email: body.email})) {
            throw new ApiError(409, 'User already exists')
        }

        const user = new userSchema(
            {
                ...body
            }
        )
        await user.save()
        return user
    } catch (error) {
        throw error
    }
}

const login = async (body) => {
    try {
        const user = await userSchema.findOne({email: body.email})

        if (!user) {
            throw new ApiError(404, 'User not found')
        }
        if (!await user.comparePassword(body.password)) {
            throw new ApiError(400, 'Invalid password')
        }
        return user
    } catch (error) {
        throw error
    }
}

module.exports = {createUser, login}