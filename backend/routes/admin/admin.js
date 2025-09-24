const express = require('express');
const router = express.Router();
const jsonwebtoken = require('jsonwebtoken');
const bycryptjs = require('bcryptjs');
const { login } = require('../../models/login');
const { token } = require('../../models/token');
const { isAdmin, isEmployer, isUser } = require('../../middleware/middleware');
const path = require('path');
const Job = require('../../models/job');
const Application = require('../../models/application');
const PdfPrinter = require('pdfmake');
const { sendTextEmail } = require('../../conrollers/email');


router.post('/admin/register', async (req, res) => {
    try {
        // Check if any admin already exists
        const adminCount = await login.countDocuments({ role: 'admin', status: true });
        if (adminCount > 0) {
            return res.status(403).json({ status: false, message: 'Admin already registered. Only one admin allowed.' });
        }

        const { email, password, name, phone, role } = req.body;
        if (!email || !password || !name || !phone || !role) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const existingAdmin = await login.findOne({ email: email, status: true });
        if (existingAdmin) {
            return res.status(400).json({ status: false, message: 'Admin already exists' });
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
                return res.status(400).json({ status: false, message: 'Admin already exists' });
            }
        }
        const newAdmin = new login({
            email,
            password: hashedPassword,
            name,
            phone,
            role,
            status: true
        });
        await newAdmin.save();
        res.status(201).json({ status: true, message: 'Admin registered successfully', data: newAdmin });
    } catch (error) {
        console.error('Error registering admin:', error);
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
});

router.post('/admin/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ status: false, message: 'Email and password are required' });
        }

        const admin = await login.findOne({ email: email, status: true });
        if (!admin) {
            return res.status(404).json({ status: false, message: 'Admin not found' });
        }

        const isPasswordValid = await bycryptjs.compare(password, admin.password);
        if (!isPasswordValid) {
            return res.status(401).json({ status: false, message: 'Invalid password' });
        }

        const jwtToken = jsonwebtoken.sign(
            { 
                userId: admin._id,
                role: admin.role 
            },
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '1h' }
        );

        // Save the token in the token collection
        await token.create({ token: jwtToken, userId: admin._id });

        res.status(200).json({
            status: true,
            message: 'Login successful',
            data: {
                userId: admin._id,
                name: admin.name,
                email: admin.email,
                phone: admin.phone,
                role: admin.role,
                token: jwtToken
            }
        });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
});

router.get('/admin/employer-records', isAdmin, async (req, res) => {
    try {
        // Fetch employers
        const employers = await login.find({ role: 'employer', status: true }, { password: 0, __v: 0 });
        // Fetch jobs
        const jobs = await Job.find().populate('postedBy', '-password -__v');

        // Prepare employer table
        const employerTable = [
            [
                { text: 'Name', bold: true },
                { text: 'Email', bold: true },
                { text: 'Phone', bold: true }
            ]
        ];
        employers.forEach(emp => {
            employerTable.push([
                emp.name || '',
                emp.email || '',
                emp.phone ? emp.phone.toString() : ''
            ]);
        });

        // Prepare jobs table
        const jobsTable = [
            [
                { text: 'Title', bold: true },
                { text: 'Description', bold: true },
                { text: 'Posted By', bold: true },
                { text: 'Company', bold: true },
                { text: 'Location', bold: true }
            ]
        ];
        jobs.forEach(job => {
            jobsTable.push([
                job.title || '',
                job.description || '',
                job.postedBy ? job.postedBy.name || job.postedBy.email || '' : '',
                job.company || '',
                job.location || ''
            ]);
        });

        // PDF definitions
        const docDefinitionEmployers = {
            content: [
                { text: 'Employers List', style: 'header', alignment: 'center' },
                { text: '\n' },
                {
                    table: {
                        headerRows: 1,
                        widths: ['*', '*', '*'],
                        body: employerTable
                    },
                    layout: {
                        fillColor: function (rowIndex) {
                            return rowIndex === 0 ? '#eeeeee' : null;
                        }
                    }
                }
            ],
            styles: {
                header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] }
            },
            defaultStyle: { font: 'Helvetica' }
        };

        const docDefinitionJobs = {
            content: [
                { text: 'Jobs List', style: 'header', alignment: 'center' },
                { text: '\n' },
                {
                    table: {
                        headerRows: 1,
                        widths: ['*', '*', '*', '*', '*'],
                        body: jobsTable
                    },
                    layout: {
                        fillColor: function (rowIndex) {
                            return rowIndex === 0 ? '#eeeeee' : null;
                        }
                    }
                }
            ],
            styles: {
                header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] }
            },
            defaultStyle: { font: 'Helvetica' }
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

        // Generate both PDFs in memory
        const getPdfBuffer = docDef => new Promise(resolve => {
            const chunks = [];
            const pdfDoc = printer.createPdfKitDocument(docDef);
            pdfDoc.on('data', chunk => chunks.push(chunk));
            pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
            pdfDoc.end();
        });

        const [employersPdf, jobsPdf] = await Promise.all([
            getPdfBuffer(docDefinitionEmployers),
            getPdfBuffer(docDefinitionJobs)
        ]);

        // Email sending
        try {
            const adminUser = await login.findOne({ role: 'admin' });
            if (adminUser && adminUser.email) {
                await sendTextEmail(
                    adminUser.email,
                    'Employers & Jobs List PDF',
                    'Please find attached the latest employers and jobs lists.',
                    null,
                    [
                        {
                            filename: 'employers_list.pdf',
                            content: employersPdf,
                            contentType: 'application/pdf'
                        },
                        {
                            filename: 'jobs_list.pdf',
                            content: jobsPdf,
                            contentType: 'application/pdf'
                        }
                    ]
                );
                // Respond with JSON after email is sent, including both lists
                return res.status(200).json({
                    status: true,
                    message: 'Employers and jobs list PDFs sent to admin email.',
                    employers,
                    jobs
                });
            } else {
                return res.status(500).json({
                    status: false,
                    message: 'Admin email not found.'
                });
            }
        } catch (err) {
            console.error('Error sending email:', err);
            return res.status(500).json({
                status: false,
                message: 'Failed to send email to admin.'
            });
        }
    } catch (error) {
        console.error('Error generating employers/jobs PDF:', error);
        res.status(500).json({
            status: false,
            message: 'Internal server error'
        });
    }
});


router.get('/admin/user-list', isAdmin, async (req, res) => {
    try {
        const users = await login.find({ role: 'user', status: true }, { password: 0, __v: 0 });
        if (users.length === 0) {
            return res.status(404).json({ status: false, message: 'No users found' });
        }
        res.status(200).json({
            status: true,
            data: users
        });
    } catch (error) {
        console.error('Error fetching user list:', error);
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
});


router.get('/admin/user-list-pdf', isAdmin, async (req, res) => {
    try {
        const users = await login.find({ role: 'user', status: true }, { password: 0, __v: 0 });
        if (users.length === 0) {
            return res.status(404).json({ status: false, message: 'No users found' });
        }

        // Prepare table data for PDF
        const userTable = [
            [
                { text: 'Name', bold: true },
                { text: 'Email', bold: true },
                { text: 'Phone', bold: true }
            ]
        ];
        users.forEach(user => {
            userTable.push([
                user.name || '',
                user.email || '',
                user.phone ? user.phone.toString() : ''
            ]);
        });

        // PDF document definition
        const docDefinition = {
            content: [
                { text: 'Users List', style: 'header', alignment: 'center' },
                { text: '\n' },
                {
                    table: {
                        headerRows: 1,
                        widths: ['*', '*', '*'],
                        body: userTable
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

        const PdfPrinter = require('pdfmake');
        const printer = new PdfPrinter(fonts);

        // Generate PDF in memory
        const getPdfBuffer = docDef => new Promise(resolve => {
            const chunks = [];
            const pdfDoc = printer.createPdfKitDocument(docDef);
            pdfDoc.on('data', chunk => chunks.push(chunk));
            pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
            pdfDoc.end();
        });

        const usersPdf = await getPdfBuffer(docDefinition);

        // Email sending
        try {
            const adminUser = await login.findOne({ role: 'admin' });
            if (adminUser && adminUser.email) {
                await sendTextEmail(
                    adminUser.email,
                    'Users List PDF',
                    'Please find attached the latest users list.',
                    null,
                    [
                        {
                            filename: 'users_list.pdf',
                            content: usersPdf,
                            contentType: 'application/pdf'
                        }
                    ]
                );
                return res.status(200).json({
                    status: true,
                    message: 'Users list PDF sent to admin email.',
                    users
                });
            } else {
                return res.status(500).json({
                    status: false,
                    message: 'Admin email not found.'
                });
            }
        } catch (err) {
            console.error('Error sending email:', err);
            return res.status(500).json({
                status: false,
                message: 'Failed to send email to admin.'
            });
        }
    } catch (error) {
        console.error('Error generating users PDF:', error);
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
});

router.delete('/admin/delete-employer/:id', isAdmin, async (req, res) => {
    try {
        const employerId = req.params.id;

        // Check if employer exists
        const employer = await login.findOne({ _id: employerId, role: 'employer' });
        if (!employer) {
            return res.status(404).json({ status: false, message: 'Employer not found' });
        }

        // Delete all jobs posted by this employer
        await Job.deleteMany({ postedBy: employerId });

        // Delete the employer
        await login.deleteOne({ _id: employerId });

        res.status(200).json({
            status: true,
            message: 'Employer and all their jobs deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting employer and jobs:', error);
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
});

router.delete('/admin/delete-user/:id', isAdmin, async (req, res) => {
    try {
        const userId = req.params.id;
        // Check if user exists
        const user = await login.findOne({ _id: userId, role: 'user' });
        if (!user) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }
        // Delete all applications made by this user
        await Application.deleteMany({ userId: userId });

        // Delete the user
        await login.deleteOne({ _id: userId });

        res.status(200).json({  
            status: true,
            message: 'User and all their applications deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting user and applications:', error);
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
});

router.post('/admin/logout', isAdmin, async (req, res) => {
    try {
        const user = req.user;
        if (!user) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }

        const jwtToken = req.headers["token"];
        await token.deleteOne({ token: jwtToken });

        res.status(200).json({
            status: true,
            message: 'Logout successful'
        });
    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
});


router.get('/admin/employer-list', isAdmin, async (req, res) => {
    try {
        const employers = await login.find({ role: 'employer', status: true }, { password: 0, __v: 0 });
        res.status(200).json({
            status: true,
            data: employers
        });
    } catch (error) {
        console.error('Error fetching employer list:', error);
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
});


router.get('/admin/employer-list-pdf', isAdmin, async (req, res) => {
    try {
        // Fetch employers
        const employers = await login.find(
            { role: 'employer', status: true },
            { password: 0, __v: 0 }
        );

        // Prepare employer table for PDF
        const employerTable = [
            [
                { text: 'Name', bold: true },
                { text: 'Email', bold: true },
                { text: 'Phone', bold: true }
            ]
        ];
        employers.forEach(emp => {
            employerTable.push([
                emp.name || '',
                emp.email || '',
                emp.phone ? emp.phone.toString() : ''
            ]);
        });

        // PDF definition
        const docDefinitionEmployers = {
            content: [
                { text: 'Employers List', style: 'header', alignment: 'center' },
                { text: '\n' },
                {
                    table: {
                        headerRows: 1,
                        widths: ['*', '*', '*'],
                        body: employerTable
                    },
                    layout: {
                        fillColor: function (rowIndex) {
                            return rowIndex === 0 ? '#eeeeee' : null;
                        }
                    }
                }
            ],
            styles: {
                header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] }
            },
            defaultStyle: { font: 'Helvetica' }
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
        const PdfPrinter = require('pdfmake');
        const printer = new PdfPrinter(fonts);

        // Generate PDF in memory
        const getPdfBuffer = docDef => new Promise(resolve => {
            const chunks = [];
            const pdfDoc = printer.createPdfKitDocument(docDef);
            pdfDoc.on('data', chunk => chunks.push(chunk));
            pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
            pdfDoc.end();
        });

        const employersPdf = await getPdfBuffer(docDefinitionEmployers);

        // Email sending
        try {
            const adminUser = await login.findOne({ role: 'admin' });
            if (adminUser && adminUser.email) {
                await sendTextEmail(
                    adminUser.email,
                    'Employers List PDF',
                    'Please find attached the latest employers list.',
                    null,
                    [
                        {
                            filename: 'employers_list.pdf',
                            content: employersPdf,
                            contentType: 'application/pdf'
                        }
                    ]
                );
                return res.status(200).json({
                    status: true,
                    message: 'Employers list PDF sent to admin email.',
                    employers
                });
            } else {
                return res.status(500).json({
                    status: false,
                    message: 'Admin email not found.'
                });
            }
        } catch (err) {
            console.error('Error sending email:', err);
            return res.status(500).json({
                status: false,
                message: 'Failed to send email to admin.'
            });
        }
    } catch (error) {
        console.error('Error generating employers PDF:', error);
        res.status(500).json({
            status: false,
            message: 'Internal server error'
        });
    }
});

router.get('/admin/job-list', isAdmin, async (req, res) => {
    try {
        // Populate postedBy with employer info
        const jobs = await Job.find().populate('postedBy', 'name email _id');
        res.status(200).json({
            status: true,
            data: jobs
        });
    } catch (error) {
        console.error('Error fetching job list:', error);
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
});

module.exports = router;