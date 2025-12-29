require("dotenv").config();
const express = require("express");
const cors = require("cors");
const SibApiV3Sdk = require("sib-api-v3-sdk");

const app = express();

/* CORS */
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

/* -------------------------------
   Brevo API setup
-------------------------------- */
const client = SibApiV3Sdk.ApiClient.instance;
const apiKey = client.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY;

const transactionalApi = new SibApiV3Sdk.TransactionalEmailsApi();

/* -------------------------------
   Send email endpoint
-------------------------------- */
app.post("/send-email", async (req, res) => {
  const { to, subject, text, html } = req.body;

  if (!to || !subject || (!text && !html)) {
    return res.status(400).json({
      error: "Missing required fields: to, subject, text or html"
    });
  }

  const sendSmtpEmail = {
    to: [{ email: to }],
    subject,
    textContent: text,
    htmlContent: html,
    sender: {
      name: process.env.SENDER_NAME || "Email Service",
      email: process.env.SENDER_EMAIL
    }
  };

  try {
    const result = await transactionalApi.sendTransacEmail(sendSmtpEmail);

    return res.json({
      message: "Email sent successfully",
      messageId: result.messageId
    });

  } catch (error) {
    console.error("Brevo API error:", error);
    return res.status(500).json({
      error: "Failed to send email"
    });
  }
});

/* Health check */
app.get("/", (req, res) => {
  res.send("Email API is running (Brevo API)");
});

/* Server */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
