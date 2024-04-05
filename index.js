const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const expressSession = require('express-session');
const expressCsurf = require('csurf');
const expressFlash = require('express-flash');

const app = express();

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.use('/static', express.static(__dirname + '/static'));
app.use(express.urlencoded({ extended: true }));

const mongoURI = require('./config/key.js');
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected !"));

app.use(cookieParser('random'));

app.use(expressSession({
    secret: "random",
    resave: true,
    saveUninitialized: true,
    maxAge: 24 * 60 * 60 * 1000,
}));

app.use(expressCsurf()); // Updated CSRF protection
app.use(expressFlash()); // Updated flash messages

app.use((req, res, next) => {
    res.locals.success_messages = req.flash('success_messages');
    res.locals.error_messages = req.flash('error_messages');
    res.locals.error = req.flash('error');
    next();
});

app.use(require('./controller/routes.js'));

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => console.log("Server Started At " + PORT));
