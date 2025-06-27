import "dotenv/config";
import jwt, { decode } from "jsonwebtoken";
import express from "express";
import { getDb } from "../db/conn.mjs";
const router = express.Router();




export default router;