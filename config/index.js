const mongoose = require('mongoose')
const app = require('../app');
const env = require('./env')

const startServer = async () => {
    try {
        await mongoose.connect(env.mongoURL)
        app.listen(env.port, () => {
            console.log(`express work on: http://localhost:${env.port}`);
        });
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

startServer()