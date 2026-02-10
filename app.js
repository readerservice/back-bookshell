const path = require('path');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors')

const app = express();

const authRoutes = require('./routes/authRoutes');
const favouritesRoutes = require('./routes/favouritesRoutes');
const bookRoutes = require('./routes/bookRoutes');
const subscriptionsRoutes = require('./routes/subscriptionsRoutes');

app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json());

app.use(morgan('tiny'))

app.use('/auth', authRoutes);
app.use('/favourites', favouritesRoutes);
app.use('/books', bookRoutes);
app.use('/subscriptions', subscriptionsRoutes);
module.exports = app;

