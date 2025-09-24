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
const Application = require('../../models/application');
const PdfPrinter = require('pdfmake');

router.post('/employer/register', async (req, res) => {
    try {   
        const { email, password, name, phone, role  } = req.body;
        if (!email || !password || !name || !phone || !role) {
            return res.status(400).json({ message: 'All fields are required' });
        }
        
        const existingEmployer = await login.findOne({ email: email, status: true });
        if (existingEmployer) {
            return res.status(400).json({status:false, message: 'Employer already exists' });
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
        
        const existingPhone = await login.findOne({ phone: phone, status: true });
        if (existingPhone) {
            return res.status(400).json({ message: 'Phone number already exists' });
        }
        const existingUser = await login.findOne({ $or: [{ email }, { phone }] });

        if (existingUser) {
            if (existingUser.status === true) {
                return res.status(400).json({ status: false, message: 'Employer already exists' });
            }
            // Update unverified user data
            existingUser.email = email;
            existingUser.password = hashedPassword;
            existingUser.name = name;
            existingUser.phone = phone;
            existingUser.role = role;
            await existingUser.save();
            var newUser = existingUser;
        } else {
            // Create a new user
            var newUser = new login({
                email,
                password: hashedPassword,
                name,
                phone,
                role,
                status: false // Initially set status to false until email is verified
            });
            await newUser.save();
        }
        // Create OTP for email verification
        const otpcode = Randomstring.generate({
            length: 6,
            charset: 'numeric'
        });
        const expiresat = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes
        await Otp.findOneAndUpdate(
            { email: newUser.email },
            { otp: otpcode, expiresat },
            { upsert: true, new: true }
        );
        await sendTextEmail(email, 'Email Verification', `Your OTP is: ${otpcode}`);

        res.status(201).json({
            status: true,
            message: 'Employer registered successfully. Please verify your email with the OTP sent to your email address.',
        });
    } catch (error) {
        console.error('Error during registration:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
router.post('/employer/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await login.findOne({ email: email, status: true });
        if (!user) {
            return res.status(401).json({ status: false, message: 'Invalid email or password' });
        }

        const isPasswordValid = await bycryptjs.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ status: false, message: 'Invalid email or password' });
        }

        const jwt = jsonwebtoken.sign(
            { 
                userId: user._id,
                 role: user.role 
            },
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '1h' }
        );
        
        // Save the token in the token collection
        const newToken = new token({
            loginid: user._id,
            token: jwt,
        });
        await newToken.save();
        
        res.status(200).json({
            status:true,
            message:'Login successful',
            token: jwt // Return the generated token
        });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
});
router.post('/employer/verify-email', async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ status: false, message: 'Email and OTP are required' });
        }

        // Find OTP record
        const otpRecord = await Otp.findOne({ email: email, otp: otp });
        if (!otpRecord) {
            return res.status(400).json({ status: false, message: 'Invalid OTP' });
        }

        if (otpRecord.expiresat < new Date()) {
            return res.status(400).json({ status: false, message: 'OTP has expired' });
        }

        // Find the user
        const user = await login.findOne({ email: email });
        if (!user) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }

        // Set status to true (verified)
        user.status = true;
        await user.save();

        // Delete OTP record
        await Otp.deleteOne({ email: email });

        res.status(200).json({
            status: true,
            message: 'Email verified successfully',
            user
        });
    } catch (error) {
        console.error('Error during email verification:', error);
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
});

router.get('/employer/profile', isEmployer, async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }
        res.status(200).json({
            status: true,
            message: 'Profile fetched successfully',
            user
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
});

router.put('/employer/update', isEmployer, async (req, res) => {
    try {
        const user = req.user;
        const { name, phone } = req.body;

        if (!name || !phone) {
            return res.status(400).json({ status: false, message: 'Name and phone are required' });
        }

        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(phone)) {
            return res.status(400).json({ status: false, message: 'Phone number must be a 10-digit number starting with 6, 7, 8, or 9' });
        }

        user.name = name;
        user.phone = phone;

        await user.save();

        res.status(200).json({
            status: true,
            message: 'Profile updated successfully',
            user
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
});

router.delete('/employer/delete', isEmployer, async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }

        user.status = false; // Soft delete
        await user.save();

        res.status(200).json({
            status: true,
            message: 'Profile deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting profile:', error);
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
});

router.post('/employer/logout', isEmployer, async (req, res) => {
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

router.post('/employer/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ status: false, message: 'Email is required' });
        }

        const user = await login.findOne({ email: email, status: true });
        if (!user) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }

        const otpcode = Randomstring.generate({
            length: 6,
            charset: 'numeric'
        });
        const expiresat = new Date(Date.now() + 5 * 60 * 1000); // OTP expires in 5 minutes
        await Otp.findOneAndUpdate(
            { email: user.email },
            { otp: otpcode, expiresat },
            { upsert: true, new: true }
        );
        await sendTextEmail(email, 'Password Reset OTP', `Your OTP for password reset is: ${otpcode}`);

        res.status(200).json({
            status: true,
            message: 'OTP sent to your email for password reset'
        });
    } catch (error) {
        console.error('Error during forgot password:', error);
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
});

router.post('/employer/reset-password', async (req, res) => {
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

        const user = await login.findOne({ email: email });
        if (!user) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }

        user.password = await bycryptjs.hash(newPassword, 10);
        await user.save();

        // Delete OTP record
        await Otp.deleteOne({ email: email });

        res.status(200).json({
            status: true,
            message: 'Password reset successfully'
        });
    } catch (error) {
        console.error('Error during password reset:', error);
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
});

router.post('/employer/job-post', isEmployer, async (req, res) => {
    try {
        const user = req.user;
        const { title, description, company, location, salary, jobType } = req.body;

        if (!title || !description || !location || !company || !salary || !jobType) {
            return res.status(400).json({ status: false, message: 'All fields are required' });
        }

        // Assuming you have the employer's user object in req.user (from authentication middleware)
    const job = new Job({
        title: req.body.title,
        description: req.body.description,
        company: req.body.company,
        location: req.body.location,
        salary: req.body.salary,
        jobType: req.body.jobType,
        postedBy: req.user._id,
        role: "employer" // Add role to the job object
    });
    await job.save();

    await sendTextEmail(
    user.email,
    'Job Posted Successfully',
    `Your job titled "${job.title}" has been posted successfully.`,
    `
    <div style="font-family: Arial, sans-serif; background: #f6f8fa; padding: 30px;">
      <div style="max-width: 520px; margin: auto; background: #fff; border-radius: 10px; box-shadow: 0 2px 12px rgba(0,0,0,0.07); padding: 32px;">
        <h2 style="color: #2d7ff9; margin-bottom: 18px;">Job Posted Successfully!</h2>
        <p style="font-size: 16px; color: #333;">
          Hello <b>${user.name}</b>,<br>
          Your job titled <b style="color: #2d7ff9;">"${job.title}"</b> has been posted successfully.
        </p>
        <div style="margin: 24px 0; border-top: 1px solid #eee;"></div>
        <table style="width:100%; font-size:15px; color:#444; border-collapse:collapse;">
          <tr>
            <td style="padding:8px 0;"><b>Title:</b></td>
            <td style="padding:8px 0;">${job.title}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;"><b>Description:</b></td>
            <td style="padding:8px 0;">${job.description}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;"><b>Company:</b></td>
            <td style="padding:8px 0;">${job.company}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;"><b>Location:</b></td>
            <td style="padding:8px 0;">${job.location}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;"><b>Salary:</b></td>
            <td style="padding:8px 0;">${job.salary}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;"><b>Job Type:</b></td>
            <td style="padding:8px 0;">${job.jobType}</td>
          </tr>
        </table>
        <div style="margin: 24px 0; border-top: 1px solid #eee;"></div>
        <p style="font-size: 15px; color: #555;">
          Thank you for using our portal!<br>
          <span style="color: #2d7ff9;">Best wishes,</span><br>
          <b>Your Job Portal Team</b>
        </p>
      </div>
    </div>
    `
);

        res.status(201).json({
            status: true,
            message: 'Job posted successfully',
            job: job // Return the created job object
        });
    } catch (error) {
        console.error('Error posting job:', error);
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
});

router.get('/employer/job-list', isEmployer, async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }

        const jobs = await Job.find({ postedBy: user._id }).populate('postedBy', 'name email phone');

        res.status(200).json({
            status: true,
            message: 'Job list fetched successfully',
            jobs
        });
    } catch (error) {
        console.error('Error fetching job list:', error);
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
});

router.get('/employer/registered-users-for-jobs', isEmployer, async (req, res) => {
    try {
        const employer = req.user;
        if (!employer) {
            return res.status(404).json({ status: false, message: 'Employer not found' });
        }

        // Find all jobs posted by this employer
        const jobs = await Job.find({ postedBy: employer._id }).select('_id title');
        const jobIds = jobs.map(job => job._id);

        // Find all applications for these jobs, populate user and job details
        const applications = await Application.find({ jobId: { $in: jobIds } })
            .populate('userId', 'name email phone')
            .populate('jobId', 'title company location');

        if (applications.length === 0) {
            return res.status(404).json({ status: false, message: 'No users registered for your jobs' });
        }

        // Prepare table data for PDF
        const tableBody = [
            [
                { text: 'User Name', bold: true },
                { text: 'User Email', bold: true },
                { text: 'User Phone', bold: true },
                { text: 'Job Title', bold: true },
                { text: 'Applied At', bold: true }
            ]
        ];
        applications.forEach(app => {
            // Convert appliedAt to IST
            const istOffset = 5.5 * 60 * 60 * 1000;
            const istDate = new Date(app.appliedAt.getTime() + istOffset);
            const appliedAt = istDate.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

            tableBody.push([
                app.userId?.name || '',
                app.userId?.email || '',
                app.userId?.phone || '',
                app.jobId?.title || '',
                appliedAt
            ]);
        });

        // PDF document definition
        const docDefinition = {
            content: [
                { text: 'Registered Users for Your Jobs', style: 'header', alignment: 'center' },
                { text: '\n' },
                {
                    table: {
                        headerRows: 1,
                        widths: ['*', '*', '*', '*', '*', '*'],
                        body: tableBody
                    },
                    layout: {
                        fillColor: function (rowIndex) {
                            return rowIndex === 0 ? '#eeeeee' : null;
                        }
                    }
                }
            ],
            styles: {
                header: {
                    fontSize: 18,
                    bold: true,
                    margin: [0, 0, 0, 10]
                }
            },
            defaultStyle: {
                font: 'Helvetica'
            }
        };

        // Use built-in Helvetica font
        const fonts = {
            Helvetica: {
                normal: 'Helvetica',
                bold: 'Helvetica-Bold',
                italics: 'Helvetica-Oblique',
                bolditalics: 'Helvetica-BoldOblique'
            }
        };

        const printer = new PdfPrinter(fonts);
        const chunks = [];
        const pdfDoc = printer.createPdfKitDocument(docDefinition);

        pdfDoc.on('data', chunk => chunks.push(chunk));
        pdfDoc.on('end', async () => {
            const pdfBuffer = Buffer.concat(chunks);

            // Send PDF to employer's email
            try {
                await sendTextEmail(
                    employer.email,
                    'Registered Users for Your Jobs',
                    'Please find attached the list of users registered for your jobs.',
                    null,
                    [
                        {
                            filename: 'registered_users.pdf',
                            content: pdfBuffer,
                            contentType: 'application/pdf'
                        }
                    ]
                );
            } catch (err) {
                console.error('Error sending email:', err);
            }

            // Respond with JSON in Postman
            const result = applications.map(app => ({
                user: app.userId,
                job: app.jobId,
                status: app.status,
                appliedAt: app.appliedAt
            }));

            res.status(200).json({
                status: true,
                message: 'Registered users for your jobs fetched successfully. PDF sent to your email.',
                data: result
            });
        });

        pdfDoc.end();
    } catch (error) {
        console.error('Error fetching registered users:', error);
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
});

module.exports = router;
