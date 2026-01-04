const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

async function sendTextEmail(to, subject, text, html, attachments = []) {
    try {
        console.log('Attempting to send email to:', to);
        console.log('Email subject:', subject);
        
        // Use App Password (more reliable on cloud hosting than OAuth)
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.emailid,
                pass: process.env.EMAIL_APP_PASSWORD
            },
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 10000
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
        console.log('✅ Email sent successfully:', info.response);
        return { success: true, info };
    } catch (error) {
        console.error('❌ Email sending failed:', error.message);
        console.error('Error code:', error.code);
        return { success: false, error: error.message };
    }
}

module.exports.sendTextEmail = sendTextEmail;

