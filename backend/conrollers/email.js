const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();
const {google} = require('googleapis');

// OAuth2 configuration
const OAuth2 = google.auth.OAuth2;

async function sendTextEmail(to, subject, text, html, attachments = []) {
    try {
        console.log('Attempting to send email to:', to);
        console.log('Email subject:', subject);
        
        // Create OAuth2 client
        const oauth2Client = new OAuth2(
            process.env.ClientID,
            process.env.client_secret,
            process.env.redirect_url
        );
        
        // Set refresh token
        oauth2Client.setCredentials({
            refresh_token: process.env.refresh_token
        });
        
        // Get fresh access token
        const accessTokenResponse = await oauth2Client.getAccessToken();
        const accessToken = accessTokenResponse.token;
        
        console.log('Access token obtained successfully');
        
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: process.env.emailid,
                clientId: process.env.ClientID,
                clientSecret: process.env.client_secret,
                refreshToken: process.env.refresh_token,
                accessToken: accessToken
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
        console.log('✅ Email sent successfully:', info.response);
        return { success: true, info };
    } catch (error) {
        console.error('❌ Email sending failed:', error.message);
        console.error('Full error:', error);
        throw error;
    }
}

module.exports.sendTextEmail = sendTextEmail;

