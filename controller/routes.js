const express = require('express');
const router = express.Router();
const user = require('../model/user');
const urls = require('../model/url');
const bcryptjs = require('bcryptjs');

function checkAuth(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        req.flash('error_messages', "Please Login to continue !");
        res.redirect('/login');
    }
}

router.get('/login', (req, res) => {
    res.render("login", { csrfToken: req.csrfToken() });
});

router.get('/signup', (req, res) => {
    res.render("signup", { csrfToken: req.csrfToken() });
});

router.post('/signup', async (req, res) => {
    const { email, password, confirmpassword } = req.body;
    if (!email || !password || !confirmpassword) {
        res.render("signup", { err: "All Fields Required !", csrfToken: req.csrfToken() });
    } else if (password !== confirmpassword) {
        res.render("signup", { err: "Password Don't Match !", csrfToken: req.csrfToken() });
    } else {
        try {
            const existingUser = await user.findOne({ email: email });
            if (existingUser) {
                res.render("signup", { err: "User Exists, Try Logging In !", csrfToken: req.csrfToken() });
            } else {
                const hashedPassword = await bcryptjs.hash(password, 12);
                await user.create({ email: email, password: hashedPassword, provider: 'email' });
                res.redirect('/login');
            }
        } catch (error) {
            console.error(error);
            res.status(500).send("Internal Server Error");
        }
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const existingUser = await user.findOne({ email: email });
        if (existingUser) {
            const passwordMatch = await bcryptjs.compare(password, existingUser.password);
            if (passwordMatch) {
                req.session.user = { email: existingUser.email };
                res.redirect('/dashboard');
            } else {
                req.flash('error_messages', "Invalid email or password !");
                res.redirect('/login');
            }
        } else {
            req.flash('error_messages', "User not found !");
            res.redirect('/login');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy(function (err) {
        res.redirect('/');
    });
});

router.get('/dashboard', checkAuth, async (req, res) => {
    try {
        const userUrls = await urls.find({ owned: req.session.user.email });
        const currentUser = await user.findOne({ email: req.session.user.email });
        res.render('dashboard', { logged: true, csrfToken: req.csrfToken(), urls: userUrls, verified: currentUser.isVerified });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

router.post('/create', checkAuth, async (req, res) => {
    const { original, short } = req.body;
    if (!original || !short) {
        res.render('dashboard', { logged: true, csrfToken: req.csrfToken(), err: "Empty Fields !" });
    } else {
        try {
            // Check if the same slug and originalUrl exists for the same user
            const existingUrl = await urls.findOne({ slug: short, originalUrl: original, owned: req.session.user.email });
            if (existingUrl) {
                res.render('dashboard', { logged: true, csrfToken: req.csrfToken(), err: "Try Different Short Url, This exists !" });
            } else {
                // Slug is unique for this user, create the URL
                await urls.create({ originalUrl: original, slug: short, owned: req.session.user.email });
                res.redirect('/dashboard');
            }
        } catch (error) {
            console.error(error);
            res.status(500).send("Internal Server Error");
        }
    }
});

router.get('/:slug?', async (req, res) => {
    if (req.params.slug) {
        try {
            const data = await urls.findOne({ slug: req.params.slug });
            if (data) {
                data.visits += 1;
                await data.save();
                res.redirect(data.originalUrl);
            } else {
                if (req.session.user) {
                    res.render("index", { logged: true, err: true });
                } else {
                    res.render("index", { logged: false, err: true });
                }
            }
        } catch (error) {
            console.error(error);
            res.status(500).send("Internal Server Error");
        }
    } else {
        if (req.session.user) {
            res.render("index", { logged: true });
        } else {
            res.render("index", { logged: false });
        }
    }
});

router.post('/delete', checkAuth, async (req, res) => {
    const { slug } = req.body;
    if (!slug) {
        res.render('dashboard', { logged: true, csrfToken: req.csrfToken(), err: "Empty Slug !" });
    } else {
        try {
            // Find the URL to delete
            const deletedUrl = await urls.findOneAndDelete({ slug: slug, owned: req.session.user.email });
            if (deletedUrl) {
                res.redirect('/dashboard');
            } else {
                res.render('dashboard', { logged: true, csrfToken: req.csrfToken(), err: "URL not found or you don't have permission to delete it." });
            }
        } catch (error) {
            console.error(error);
            res.status(500).send("Internal Server Error");
        }
    }
});

module.exports = router;
