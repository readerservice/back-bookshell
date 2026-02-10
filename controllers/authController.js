const users = require('../models/usersModel');
const favourites = require('../models/favouritesModel.js');
const bcrypt = require('bcryptjs');
const crypto = require('crypto')
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer')
const env = require('../config/env')

const verifyEmailTemplate = require('../emailTemplates/verifyEmail')
const verifyErrorTemplate = require('../emailTemplates/verifyError')
const verifySuccessTemplate = require('../emailTemplates/verifySuccess')
const forgotPasswordTemplate = require('../emailTemplates/forgotPassword')

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: env.smtp.user,
        pass: env.smtp.pass
    },
});

const APP_URL = env.appUrl
const SMTP_USER = env.smtp.user
const JWT_SECRET = env.jwtSecret
const REFRESH_SECRET = env.refreshSecret

exports.register = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const hash = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const user = await users.create({
            name,
            email,
            password: hash,
            isVerified: false,
            verificationToken,
        });
        const accessToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: env.jwtExpiresIn });
        const refreshToken = jwt.sign({ id: user._id }, REFRESH_SECRET, { expiresIn: env.refreshExpiresIn })
        user.refreshToken = refreshToken;
        await user.save();
        res.json({ accessToken, refreshToken, name: user.name, email: user.email, isVerified: false })
        const verifyLink = `${APP_URL}/auth/verify-email?token=${verificationToken}`;
        const mailOptions = {
            from: `${env.email.fromName} <${SMTP_USER}>`,
            to: email,
            subject: 'Confirm your email',
            html: verifyEmailTemplate(name, verifyLink),
        };

        await transporter.sendMail(mailOptions);
    } catch (err) {
        if (err.keyPattern?.email) {
            return res.status(400).json({ message: 'Email is already exist', statusCode: 'email_is_exist' });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    const user = await users.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ message: 'Invalid data' });
    }
    const accessToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: env.jwtExpiresIn });
    const refreshToken = jwt.sign({ id: user._id }, REFRESH_SECRET, { expiresIn: env.refreshExpiresIn });
    user.refreshToken = refreshToken;
    await user.save();
    res.json({ accessToken, refreshToken, name: user.name, email: user.email, isVerified: user.isVerified });
};

exports.updateName = async (req, res) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ message: 'Name is empty' });
        }

        const user = await users.findByIdAndUpdate(
            req.user.id,
            { name },
            { new: true }
        );
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const accessToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: env.jwtExpiresIn });
        const refreshToken = jwt.sign({ id: user._id }, REFRESH_SECRET, { expiresIn: env.refreshExpiresIn });
        user.refreshToken = refreshToken;
        await user.save();

        res.json({
            accessToken,
            refreshToken,
            name: user.name,
            email: user.email,
            isVerified: user.isVerified
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Missing password fields' });
        }

        const user = await users.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid current password', statusCode: 'invalid_password' });
        }

        const hash = await bcrypt.hash(newPassword, 10);
        user.password = hash;
        await user.save();

        const accessToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: env.jwtExpiresIn });
        const refreshToken = jwt.sign({ id: user._id }, REFRESH_SECRET, { expiresIn: env.refreshExpiresIn });
        user.refreshToken = refreshToken;
        await user.save();

        res.json({
            accessToken,
            refreshToken,
            name: user.name,
            email: user.email,
            isVerified: user.isVerified
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteProfile = async (req, res) => {
    try {
        const { password } = req.body;

        const user = await users.findById(req.user.id);
        console.log('user', user)
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid password', statusCode: 'invalid_password' });
        }

        await users.findByIdAndDelete(req.user.id);
        await favourites.deleteMany({ userId: req.user.id });
        res.json({ message: 'Profile and favourites deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.verifyEmail = async (req, res) => {
    const { token } = req.query;

    try {
        const user = await users.findOne({ verificationToken: token });
        if (!user) {
            return res.status(400).send(verifyErrorTemplate());
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        res.send(verifySuccessTemplate());
    } catch (err) {
        res.status(500).send(verifyErrorTemplate('Server error. Please try again later.'));
    }
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await users.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const tempPassword = crypto.randomBytes(4).toString('hex');
        const hash = await bcrypt.hash(tempPassword, 10);

        user.password = hash;
        await user.save();

        await transporter.sendMail({
            from: `${env.email.supportName} <${SMTP_USER}>`,
            to: email,
            subject: 'Password reset',
            html: forgotPasswordTemplate(user.name || '', tempPassword),
        });

        res.json({ message: 'Temporary password sent to email' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await users.findById(req.user.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json({
            name: user.name,
            email: user.email,
            isVerified: user.isVerified,
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getUserId = async (req, res) => {
    try {
        const user = await users.findById(req.user.id).select('_id');
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json({
            userId: user._id,
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.logout = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ message: 'No token provided' });

  const user = await users.findOne({ refreshToken });
  if (user) {
    user.refreshToken = null;
    await user.save();
  }

  res.json({ message: 'Logged out successfully' });
};

exports.refresh = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);
    const user = await users.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }

    const newAccessToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: env.jwtExpiresIn });
    const newRefreshToken = jwt.sign({ id: user._id }, REFRESH_SECRET, { expiresIn: env.refreshExpiresIn });

    user.refreshToken = newRefreshToken;
    await user.save();

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (err) {
    res.status(403).json({ message: 'Invalid or expired token' });
  }
}

exports.sendVerificationEmail = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await users.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isVerified) {
      return res.json({ message: "Email is already verified" });
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");
    user.verificationToken = verificationToken;
    await user.save();

    const verifyLink = `${APP_URL}/auth/verify-email?token=${verificationToken}`;

    const mailOptions = {
      from: `${env.email.fromName} <${SMTP_USER}>`,
      to: user.email,
      subject: "Confirm your email",
      html: verifyEmailTemplate(user.name, verifyLink),
    };

    await transporter.sendMail(mailOptions);
    return res.json({ message: "Verification email sent successfully" });

  } catch (error) {
    return res.status(500).json({ message: "Failed to send email" });
  }
};