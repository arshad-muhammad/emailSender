require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");

const app = express();

/* ✅ CORS MUST COME FIRST */
app.use(cors({
  origin: "*",              // allow all origins (for testing)
  methods: ["POST", "GET", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

/* ✅ Handle preflight requests */
app.options("*", cors());

/* Middleware */
app.use(express.json());

app.post("/send-email", async (req, res) => {
  const { to, subject, text, html } = req.body;

  if (!to || !subject || !text) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  try {
    await transporter.sendMail({
      from: `"Email Service" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html
    });

    res.json({ message: "Email sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Email failed" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on", PORT);
});
