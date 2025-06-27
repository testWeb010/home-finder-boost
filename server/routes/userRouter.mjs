import express from "express";
import { getDb } from "../db/conn.mjs";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
const router = express.Router();

const ObjectId = mongoose.Types.ObjectId;

// get user by id
router.get("/get-user-by-id/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const db = getDb().connection;
    let user = await db.collection("users").findOne(
      { _id : new ObjectId(id) },
      {
        projection: { password: 0, accountType: 0 },
      }
    );
    if (!user) {
      return res.json({ status: "ERROR", message: "User not found" });
    }

    const CurrUser = await db.collection("users").findOne({ username: req.user.username });

    const data = user;

    let isUser = false;

    if (CurrUser && CurrUser._id == id) {
      console.log(CurrUser._id, id);
      isUser = true;
      if (isUser) {
        data.posts = await db.collection("postads").find({ user: new ObjectId(id) }).toArray();
        data.membership = await db.collection("memberships").findOne({ _id: new ObjectId(data.membership) }, { projection: { planName: 1 } });
      }
    }

    return res.status(200).json({ status: "OK", data, isUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "An error occurred" });
  }
});

router.get("/", async (req, res) => {
  try {
    const db = getDb().connection;

    const user = await db.collection("users").findOne(
      { username: req.user.username },
      {
        projection: {}, // Exclude sensitive fields
      }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ user });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "An error occurred" });
  }
});

router.post("/change-password", async (req, res) => {
  try {
    const db = getDb().connection;

    const CurrUser = await db
      .collection("users")
      .findOne({ username: req.user.username });

    if (!CurrUser) {
      return res.status(401).json({ message: "Unauthorized access" });
    }

    if (CurrUser.accountType === "google") {
      return res
        .status(404)
        .json({ message: "You can not set password for account Type Google" });
    }

    const { oldPassword, newPassword, confirmPassword } = req.body;

    const isMatch = await bcrypt.compare(oldPassword, CurrUser.password);
    if (!isMatch) {
      return res.status(404).json({ message: "Old password was incorrect" });
    }

    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ message: "Password and confirm password does not match" });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await db
      .collection("users")
      .updateOne(
        { username: req.user.username },
        { $set: { password: hashedPassword } }
      );

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "An error occurred" });
  }
});


router.post("/check-username", async (req, res) => {
  try {
    const db = getDb().connection;

    const CurrUser = await db.collection("users").findOne({ username: req.user.username });

    if (!CurrUser) {
      return res.status(401).json({ message: "Unauthorized access" });
    }
    
    const { username } = req.body;

    const checkusername = await db.collection("users").findOne({ username: username });

    if (checkusername) {
      return res.status(200).json({ status: "OK", available: false });
    }

    return res.status(200).json({ status: "OK", available: true });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "An error occurred" });
  }
});

export default router;
