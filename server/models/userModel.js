const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const User = mongoose.Schema({
    name: String,
    
    username: String,
    email: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
        validate(value){
            if (!validator.isEmail(value)) {
                throw new Error('Invalid email!');
            }
            else {
                return true;
            }
        }
    },
    password: {
        type: String,
        trim: true,

    },
    profilePicture: String,
    followers: Array,
    following: Array,
    bio: String,
    location: String,
    website: String,
    phone: String,
    birthday: String,
    work: String,
    lastActive: { type: Date, default: Date.now },
    isOnline: { type: Boolean, default: false },
    joinDate: {
        type: String,
        default: () => {
            // default to a human friendly month + year format, e.g. "October 2025"
            const d = new Date();
            try {
                return d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
            } catch (e) {
                // fallback to ISO year if locale formatting fails
                return d.getFullYear().toString();
            }
        }
    }

});

User.pre('save', async function(next){
    if (this.isModified('password')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});
User.methods.genToken = async function() {
    const userObj = {sub: this._id.toHexString(), email: this.email}
    const token = jwt.sign(userObj, process.env.JWT_SECRET || 'HelloSecretKey', {
        expiresIn: process.env.JWT_EXPIRES_IN || '5h'
    })
    return token;
}
User.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
}

User.statics.emailExists = async function(email) {
    const user = await this.findOne({email});
    return !!user;
}


const userSchema = mongoose.model('GenzUser', User, 'genzusers');
module.exports = {userSchema};