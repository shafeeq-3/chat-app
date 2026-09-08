const express = require('express');
const router = express.Router();
const authRoute = require('./authRoute');
const userRoute = require('./userRoute');
const postRoute = require('./postRoute');
const notificationRoute = require('./notificationRoute');
const chatRoute = require('./chatRoute');
const ApiIndex = [
    {
        path: '/auth',
        route: authRoute
    },
    {
        path: '/user',
        route: userRoute
    },
    {
        path: '/posts',
        route: postRoute
    },
    {
        path: '/notifications',
        route: notificationRoute
    }
    ,
    {
        path: '/chat',
        route: chatRoute
    }
]

ApiIndex.forEach((item) => {
    router.use(item.path, item.route)
})

module.exports = router
