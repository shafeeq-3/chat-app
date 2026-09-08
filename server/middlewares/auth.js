const passport = require('passport');
const { ApiError } = require('./ApiError');

// JWT Authentication middleware
const auth = (req, res, next) => {
    return new Promise((resolve, reject) => {
        passport.authenticate('jwt', { session: false }, (err, user, info) => {
            if (err) {
                return reject(err);
            }
            if (!user) {
                const error = new ApiError(401, 'Please authenticate');
                return reject(error);
            }
            req.user = user;
            resolve(user);
        })(req, res, next);
    }).then(() => next()).catch((err) => next(err));
};

module.exports = {
    auth,
};