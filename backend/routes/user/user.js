const express = require('express');
const router = express.Router();
const jsonwebtoken = require('jsonwebtoken');
const bycryptjs = require('bcryptjs');
const {login} = require('../../models/login');
const {token} = require('../../models/token');
const Otp = require('../../models/otp'); // Make sure this matches your model export
const { sendTextEmail } = require('../../conrollers/email');
const Randomstring = require('randomstring');
const { isAdmin, isEmployer, isUser } = require('../../middleware/middleware');
const Job = require('../../models/job');
const Application = require('../../models/application'); // Assuming you have a JobApplication model
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads/resumes');
console.log('Upload directory path:', uploadDir);
if (!fs.existsSync(uploadDir)) {
    console.log('Creating upload directory...');
    fs.mkdirSync(uploadDir, { recursive: true });
} else {
    console.log('Upload directory already exists');
}

// Set storage engine
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log('Multer destination called, uploadDir:', uploadDir);
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
// File filter for PDF only
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed!'), false);
    }
};
const upload = multer({ storage: storage, fileFilter: fileFilter });

router.post('/user/register', async (req, res) => {
    try {
        const { email, password, name, phone, role } = req.body;
        if (!email || !password || !name || !phone || !role) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check for any existing user (verified or not)
        let existingUser = await login.findOne({ $or: [{ email }, { phone }] });

        if (existingUser && existingUser.status === true) {
            return res.status(400).json({ status: false, message: 'User already exists' });
        }

        const hashedPassword = await bycryptjs.hash(password, 10);
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const nameRegex = /^[a-zA-Z\s]{2,}$/;
        const phoneRegex = /^[6-9]\d{9}$/;
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?#&])[A-Za-z\d@$!%*?#&]{6,}$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }
        if (!nameRegex.test(name)) {
            return res.status(400).json({ message: 'Name must be at least 2 characters long and contain only letters and spaces' });
        }
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({ message: 'Phone number must be a 10-digit number starting with 6, 7, 8, or 9' });
        }
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long, contain at least one uppercase letter, one lowercase letter, one number, and one special character' });
        }
        if (role !== 'admin' && role !== 'employer' && role !== 'user') {
            return res.status(400).json({ message: 'Invalid role' });
        }

        // If unverified user exists, update their data
        let newUser;
        if (existingUser && existingUser.status === false) {
            existingUser.email = email;
            existingUser.password = hashedPassword;
            existingUser.name = name;
            existingUser.phone = phone;
            existingUser.role = role;
            await existingUser.save();
            newUser = existingUser;
        } else if (!existingUser) {
            // Create a new user
            newUser = new login({
                email,
                password: hashedPassword,
                name,
                phone,
                role,
                status: false // Initially set status to false until email is verified
            });
            await newUser.save();
        }

        // Generate and send OTP
        const otpCode = Randomstring.generate({ length: 6, charset: 'numeric' });
        const expiresat = new Date(Date.now() + 5 * 60 * 1000); // OTP valid for 5 minutes
        await Otp.findOneAndUpdate(
            { email: newUser.email },
            { otp: otpCode, expiresat },
            { upsert: true, new: true }
        );
        await sendTextEmail(email, 'Email Verification', `Your OTP is: ${otpCode}`);

        return res.status(201).json({ status: true, message: 'User registered successfully. Please verify your email with the OTP sent to your email address.' });
    } catch (error) {
        console.error('Error during user registration:', error);
        return res.status(500).json({ status: false, message: 'Internal server error' });
    }
});

router.post('/user/verify-email', async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ status: false, message: 'Email and OTP are required' });
        }

        const otpRecord = await Otp.findOne({ email: email, otp: otp });
        if (!otpRecord) {
            return res.status(400).json({ status: false, message: 'Invalid OTP' });
        }

        if (otpRecord.expiresat < new Date()) {
            return res.status(400).json({ status: false, message: 'OTP has expired' });
        }

        const user = await login.findOneAndUpdate(
            { email: email },
            { status: true },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }

        await Otp.deleteOne({ email: email }); // Delete the OTP record after successful verification

        return res.status(200).json({ status: true, message: 'Email verified successfully', data: user });
    } catch (error) {
        console.error('Error during email verification:', error);
        return res.status(500).json({ status: false, message: 'Internal server error' });
    }
});

router.post('/user/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ status: false, message: 'Email and password are required' });
        }

        const user = await login.findOne({ email: email, status: true });
        if (!user) {
            return res.status(404).json({ status: false, message: 'User not found or not verified' });
        }

        const isPasswordValid = await bycryptjs.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ status: false, message: 'Invalid password' });
        }

        const tokenData = new token({
            userId: user._id,
            role: user.role
        });
        await tokenData.save();

        const jwtToken = jsonwebtoken.sign({ userId: user._id }, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '1h' });
        // Save token in DB
        await token.create({ token: jwtToken, loginid: user._id });

        return res.status(200).json({
            status: true,
            message: 'Login successful',
            data: {
                userId: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                token: jwtToken
            }
        });
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({ status: false, message: 'Internal server error' });
    }
});

router.get('/user/profile', isUser, async (req, res) => {
    try {
        const user = await login.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }
        return res.status(200).json({ status: true, data: user });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return res.status(500).json({ status: false, message: 'Internal server error' });
    }
});

router.put('/user/profile', isUser, async (req, res) => {
    try {
        const { name, phone } = req.body;
        if (!name || !phone) {
            return res.status(400).json({ status: false, message: 'Name and phone are required' });
        }

        const user = await login.findByIdAndUpdate(
            req.user._id,
            { name, phone },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }

        return res.status(200).json({ status: true, message: 'Profile updated successfully', data: user });
    } catch (error) {
        console.error('Error updating user profile:', error);
        return res.status(500).json({ status: false, message: 'Internal server error' });
    }
});

router.post('/user/delete-account/:id', isUser, async (req, res) => {
    try {
        const userId = req.params.id;
        if (userId !== req.user._id.toString()) {
            return res.status(403).json({ status: false, message: 'You can only delete your own account' });
        }

        // Soft delete: set status to false
        const user = await login.findByIdAndUpdate(
            userId,
            { status: false },
            { new: true }
        );
        if (!user) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }

        // Optionally, soft delete associated data like applications
        await Application.updateMany({ userId: userId }, { status: 'Deleted' });

        return res.status(200).json({ status: true, message: 'Account deleted (soft delete) successfully' });
    } catch (error) {
        console.error('Error deleting user account:', error);
        return res.status(500).json({ status: false, message: 'Internal server error' });
    }
});

router.post('/user/logout', isUser, async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }

        // Delete the token from the token collection
        await token.deleteOne({ loginid: user._id });

        res.status(200).json({
            status: true,
            message: 'Logout successful'
        });
    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
});


router.post('/user/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ status: false, message: 'Email is required' });
        }

        const user = await login.findOne({ email: email, status: true });
        if (!user) {
            return res.status(404).json({ status: false, message: 'User not found or not verified' });
        }

        const otpCode = Randomstring.generate({ length: 6, charset: 'numeric' });
        const expiresat = new Date(Date.now() + 5 * 60 * 1000); // OTP valid for 5 minutes
        await Otp.findOneAndUpdate(
            { email: email },
            { otp: otpCode, expiresat },
            { upsert: true, new: true }
        );
        await sendTextEmail(email, 'Password Reset OTP', `Your OTP for password reset is: ${otpCode}`);

        return res.status(200).json({ status: true, message: 'OTP sent to your email for password reset' });
    } catch (error) {
        console.error('Error during forgot password:', error);
        return res.status(500).json({ status: false, message: 'Internal server error' });
    }
});

router.post('/user/reset-password', async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) {
            return res.status(400).json({ status: false, message: 'Email, OTP, and new password are required' });
        }

        const otpRecord = await Otp.findOne({ email: email, otp: otp });
        if (!otpRecord) {
            return res.status(400).json({ status: false, message: 'Invalid OTP' });
        }

        if (otpRecord.expiresat < new Date()) {
            return res.status(400).json({ status: false, message: 'OTP has expired' });
        }

        const hashedPassword = await bycryptjs.hash(newPassword, 10);
        const user = await login.findOneAndUpdate(
            { email: email },
            { password: hashedPassword },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }

        await Otp.deleteOne({ email: email }); // Delete the OTP record after successful reset

        return res.status(200).json({ status: true, message: 'Password reset successfully' });
    } catch (error) {
        console.error('Error during password reset:', error);
        return res.status(500).json({ status: false, message: 'Internal server error' });
    }
});

router.post('/user/register-job', isUser, async (req, res) => {
    try {
        const { jobId, resumePath } = req.body;
        if (!jobId) {
            return res.status(400).json({ status: false, message: 'Job ID is required' });
        }
        if (!resumePath) {
            return res.status(400).json({ status: false, message: 'Resume path is required' });
        }
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ status: false, message: 'Job not found' });
        }
        const existingApplication = await Application.findOne({ jobId: jobId, userId: req.user._id });
        if (existingApplication) {
            return res.status(400).json({ status: false, message: 'You have already applied for this job' });
        }

        // Save application
        const application = new Application({
            jobId: jobId,
            userId: req.user._id,
            resume: resumePath,
            status: 'Applied'
        });
        await application.save();

        // Send confirmation email to the user (temporarily disabled for debugging)
        try {
            await sendTextEmail(
                req.user.email,
                'Job Application Confirmation',
                `Dear ${req.user.name},\n\nYou have successfully applied for the job: ${job.title} at ${job.company}.\n\nThank you for using our portal!`,
                // HTML content...
                `<div style="font-family: Arial, sans-serif; background: #f6f8fa; padding: 30px;">
                    <div style="max-width: 500px; margin: auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); padding: 30px;">
                        <h2 style="color: #2d7ff9; margin-bottom: 10px;">Job Application Confirmation</h2>
                        <p style="font-size: 16px; color: #333;">Dear <b>${req.user.name}</b>,</p>
                        <p style="font-size: 16px; color: #333;">
                            You have <b>successfully applied</b> for the job:
                            <span style="color: #2d7ff9;">${job.title}</span> at <b>${job.company}</b>.
                        </p>
                        <div style="margin: 24px 0; border-top: 1px solid #eee;"></div>
                        <p style="font-size: 15px; color: #555;">
                            Thank you for using our portal!<br>
                            <span style="color: #2d7ff9;">Best wishes,</span><br>
                            <b>Your Job Portal Team</b>
                        </p>
                    </div>
                </div>`
            );
        } catch (emailError) {
            console.log('Email sending failed (non-critical):', emailError.message);
        }

        return res.status(201).json({ status: true, message: 'Job registered successfully. Confirmation email sent.', data: application });
    } catch (error) {
        console.error('Error registering for job:', error);
        return res.status(500).json({ status: false, message: 'Internal server error' });
    }
});

router.get('/user/applications', isUser, async (req, res) => {
    try {
        const applications = await Application.find({ userId: req.user._id }).populate('jobId');
        return res.status(200).json({ status: true, data: applications });
    } catch (error) {
        console.error('Error fetching user applications:', error);
        return res.status(500).json({ status: false, message: 'Internal server error' });
    }
});

// Get all jobs for users
router.get('/user/jobs', async (req, res) => {
    try {
        const jobs = await Job.find({}); // You can filter as needed
        res.status(200).json({ status: true, jobs });
    } catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
});

router.post('/user/upload-resume', isUser, (req, res) => {
    upload.single('resume')(req, res, async function (err) {
        try {
            if (err) {
                return res.status(400).json({ status: false, message: err.message });
            }
            if (!req.file) {
                return res.status(400).json({ status: false, message: 'Resume PDF is required' });
            }

            // Optionally save resume path to user profile:
            // await login.findByIdAndUpdate(req.user._id, { resume: req.file.path });

            // Return path relative to the static uploads directory
            const relativePath = `uploads/resumes/${req.file.filename}`;

            return res.status(200).json({
                status: true,
                message: 'Resume uploaded successfully.',
                resumePath: relativePath
            });
        } catch (error) {
            console.error('Error uploading resume:', error);
            return res.status(500).json({ status: false, message: 'Internal server error' });
        }
    });
});

module.exports = router;