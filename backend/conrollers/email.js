const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();
const {google} = require('googleapis');
const OAuth2 = google.auth.OAuth2;
const oauth2Client = new OAuth2(
    process.env.ClientID,
    process.env.client_secret,
    process.env.redirect_url
);
oauth2Client.setCredentials({
  refresh_token: process.env.refresh_token // Refresh Token from Google Developer Console
});
const accessToken = oauth2Client.getAccessToken();

async function sendTextEmail(to, subject, text, html,attachments = []) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: process.env.emailid, // Your Gmail address
            clientId: process.env.ClientID,
            clientSecret: process.env.client_secret,
            refreshToken: process.env.refresh_token,
            accessToken: accessToken
        },
        tls: {
            rejectUnauthorized: false // Allow self-signed certificates
        }
    });
    var mailOptions = {
        from: process.env.emailid,
        to: to,
        subject: subject,
        text: text,
        html: html,
        attachments: attachments 
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(error);
        } else {
            console.log('Email sent:', info.response);
        }
    });
}

module.exports.sendTextEmail = sendTextEmail;

