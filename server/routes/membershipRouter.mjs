import express from "express";
import { getDb } from "../db/conn.mjs";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const db = getDb().connection;

    const memberships = await db.collection("memberships").find().toArray();
    return res.status(200).json({ memberships });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "An error occurred" });
  }
});

export default router;
