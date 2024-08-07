const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const nodemailer = require("nodemailer");
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
const dbURI =
  "mongodb+srv://Arun:273404@cluster1.iy62lq4.mongodb.net/portfolio_message";
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true });

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {
  console.log("Connected to MongoDB");
});

// Contact Schema
const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
});

const Contact = mongoose.model("Contact", contactSchema);

// Set up Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "arun273404@gmail.com", // Your email address
    pass: "your-email-password", // Your email password (use environment variables for security)
  },
});

// Function to send email
const sendEmail = async (contact) => {
  const mailOptions = {
    from: contact.email, // Email address from the form
    to: "arun273404@gmail.com", // Your email address
    subject: `Contact Message from ${contact.name}`,
    text: `Message from: ${contact.name}\nEmail: ${contact.email}\n\nMessage:\n${contact.message}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

// Routes
app.get("/", (req, res) => {
  res.send("Welcome to the API");
});

app.post("/contact", async (req, res) => {
  const { name, email, message } = req.body;
  console.log(req.body);

  if (!name || !email || !message) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const newContact = new Contact({ name, email, message });

  try {
    await newContact.save();
    await sendEmail({ name, email, message }); // Send email after saving contact
    res.status(200).json({ message: "Message sent successfully!" });
  } catch (error) {
    console.error("Error saving contact or sending email:", error);
    res.status(500).json({ message: "Failed to send message." });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
