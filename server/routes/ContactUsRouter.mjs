import express from "express";
import { getDb } from "../db/conn.mjs";
import validator from "validator";

const router = express.Router();

router.post("/contact-us", async (req, res) => {
    try {
        const db = getDb().connection;
        const { userName, emailId, subject, message } = req.body;
        
        const requiredFields = { userName, emailId, subject, message };
        for (const [field, value] of Object.entries(requiredFields)) {
            if (!value) return res.status(400).json({ success: false, message: `${field.charAt(0).toUpperCase() + field.slice(1)} is required.` });
        }

        if (!validator.isEmail(emailId)) {
            return res.status(400).json({ success: false, message: "Invalid email format." });
        }
        
        const contactInfo = { userName, emailId, subject, message, submittedAt: new Date() };
        const result = await db.collection("contactUs").insertOne(contactInfo);
        
        return res.status(result.acknowledged ? 200 : 500).json({ 
            success: result.acknowledged, 
            message: result.acknowledged ? "Message sent successfully." : "Failed to submit message." 
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error." });
    }
});


router.post("/Subscribers", async (req, res) => {
    try {
        const db = getDb().connection;
    
        const { emailId } = req.body;
    
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
        if (!emailId.trim()) {
            return res.status(400).json({ message: "Enter the Email ID" });
        } else if (!emailRegex.test(emailId)) {
            return res.status(400).json({ message: "Invalid email format." });
        }
    
        const existingSubscriber = await db.collection("Subscribers").findOne({ emailId: emailId });
    
        if (existingSubscriber) {
            return res.status(200).json({ message: "You are already subscribed." });
        }
    
        const EmailSubscriber = {
            emailId,
            submittedAt: new Date(),
        };
    
        const save = await db.collection("Subscribers").insertOne(EmailSubscriber);
    
        if (save.acknowledged) {
            return res.status(200).json({ message: "Thank you for subscribing Us." });
        } else {
            return res.status(500).json({ message: "Something went wrong. Please try again later." });
        }
        } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error." });
        }
    });


export default router;
