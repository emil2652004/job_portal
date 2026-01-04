const nodemailer = require('nodemailer');
require('dotenv').config();

// Simpler email configuration using Gmail App Password
// To use this: 
// 1. Go to Google Account settings
// 2. Enable 2-Step Verification
// 3. Generate App Password: https://myaccount.google.com/apppasswords
// 4. Add to .env: EMAIL_APP_PASSWORD=your_app_password

async function sendTextEmail(to, subject, text, html, attachments = []) {
    try {
        console.log('Sending email to:', to);
        
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.emailid,
                pass: process.env.EMAIL_APP_PASSWORD // App-specific password
            }
        });

        const mailOptions = {
            from: process.env.emailid,
            to: to,
            subject: subject,
            text: text,
            html: html || text,
            attachments: attachments 
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent:', info.response);
        return { success: true, info };
    } catch (error) {
        console.error('❌ Email error:', error.message);
        throw error;
    }
}

module.exports.sendTextEmail = sendTextEmail;
