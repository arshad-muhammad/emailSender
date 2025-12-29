require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const app = express();

// Middleware to parse JSON requests
app.use(express.json());

// API endpoint to send an email
app.post('/send-email', async (req, res) => {
    const { to, subject, text, html } = req.body;

    // Ensure the necessary fields are provided
    if (!to || !subject || !text) {
        return res.status(400).json({ error: 'Missing required fields: to, subject, text' });
    }

    // Setup the transporter
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        }
    });

    // Define the email options
    let mailOptions = {
        from: `"Your Name" <${process.env.EMAIL_USER}>`, // sender address
        to: to, // recipient address
        subject: subject, // Subject line
        text: text, // plain text body
        html: html, // HTML body
    };

    try {
        // Send the email
        let info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email: ', error);
        res.status(500).json({ error: 'Failed to send email' });
    }
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Email service running on port ${port}`);
});