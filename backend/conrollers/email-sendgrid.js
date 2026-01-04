const nodemailer = require('nodemailer');
require('dotenv').config();

// SendGrid configuration (works reliably on Render)
async function sendTextEmail(to, subject, text, html, attachments = []) {
    try {
        console.log('Sending email via SendGrid to:', to);
        
        const transporter = nodemailer.createTransport({
            host: 'smtp.sendgrid.net',
            port: 587,
            secure: false,
            auth: {
                user: 'apikey',
                pass: process.env.SENDGRID_API_KEY
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
        console.log('✅ Email sent via SendGrid:', info.messageId);
        return { success: true, info };
    } catch (error) {
        console.error('❌ SendGrid email failed:', error.message);
        return { success: false, error: error.message };
    }
}

module.exports.sendTextEmail = sendTextEmail;
