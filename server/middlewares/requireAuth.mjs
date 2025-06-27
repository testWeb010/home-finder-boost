import "dotenv/config";
import jwt, { decode } from "jsonwebtoken";
import express from "express";
import { getDb } from "../db/conn.mjs";
const router = express.Router();

router.use(async (req, res, next) => {
  const db = getDb().connection;
  const bearer = req.headers["authorization"];
  if (!bearer) {
    return res.status(401).send("Unauthorized access - no token provided");
  }
  
  const token = bearer.split(" ")[1];
  if (!token) {
    return res.status(401).send("Unauthorized access");
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(401).send("Unauthorized access - Invalid token");
    }
    const user = await db
    .collection("users")
    .findOne({ username: decoded.username });

    if (!user) {
      return res.status(401).send("Unauthorized access - User not found");
    }

    if (!user.isVerified) {
      return res.status(401).send("Unauthorized access");
    }

    req.user = decoded;
    next();
  });
});

export default router;
