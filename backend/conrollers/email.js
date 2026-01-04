const {google} = require('googleapis');
const dotenv = require('dotenv');
dotenv.config();

// Using Gmail API directly (works on Render - no SMTP blocking)
async function sendTextEmail(to, subject, text, html, attachments = []) {
    try {
        console.log('Attempting to send email to:', to);
        console.log('Using Gmail API (not SMTP)');
        
        // Create OAuth2 client
        const OAuth2 = google.auth.OAuth2;
        const oauth2Client = new OAuth2(
            process.env.ClientID,
            process.env.client_secret,
            process.env.redirect_url
        );
        
        oauth2Client.setCredentials({
            refresh_token: process.env.refresh_token
        });
        
        const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
        
        // Create email in RFC 2822 format
        const emailContent = html || text;
        const message = [
            `From: ${process.env.emailid}`,
            `To: ${to}`,
            `Subject: ${subject}`,
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset=utf-8',
            '',
            emailContent
        ].join('\n');
        
        // Encode email in base64
        const encodedMessage = Buffer.from(message)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
        
        // Send email using Gmail API
        const result = await gmail.users.messages.send({
            userId: 'me',
            requestBody: {
                raw: encodedMessage
            }
        });
        
        console.log('✅ Email sent via Gmail API:', result.data.id);
        return { success: true, messageId: result.data.id };
    } catch (error) {
        console.error('❌ Email sending failed:', error.message);
        console.error('Error details:', error.response?.data || error);
        return { success: false, error: error.message };
    }
}

module.exports.sendTextEmail = sendTextEmail;

