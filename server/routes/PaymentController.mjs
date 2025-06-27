import express, { response } from "express";
import cors from "cors";
import crypto from "crypto";
import { Cashfree } from "cashfree-pg";
import { error } from "console";
import { getDb } from "../db/conn.mjs";
import { ObjectId } from "mongodb";
import Order from "../models/order.mjs";

const router = express.Router();

function generateOrderId() {
    const uniqueId = crypto.randomBytes(16).toString("hex");

    const hash = crypto.createHash("sha256");
    hash.update(uniqueId);

    const orderId = hash.digest("hex");

    return orderId.substr(0, 12);
}

Cashfree.XClientId = process.env.CASHFREE_CLIENT_ID;
Cashfree.XClientSecret = process.env.CASHFREE_CLIENT_SECRET;
Cashfree.XEnvironment = Cashfree.Environment.PRODUCTION;

router.post("/pay", async (req, res) => {
    try {
        const { name, mobile, membershipId } = req.body;

        const orderId = await generateOrderId();
        const db = getDb().connection;

        const CurrUser = await db
        .collection("users")
        .findOne({ username: req.user.username });

        if (!CurrUser) {
        return res.status(404).json({ message: "User not found" });
        }

        const membership = await db
        .collection("memberships")
        .findOne({ _id: new ObjectId(membershipId) });

        if (!membership) {
        return res.status(404).json({ message: "membership not found" });
        }

        let request = {
        order_amount: membership.discountedPrice,
        order_currency: "INR",
        order_id: orderId,
        customer_details: {
            customer_id: CurrUser._id.toString(),
            customer_phone: mobile,
            customer_name: name,
            customer_email: CurrUser.email,
            planid: membership._id.toString(),
        },
        order_meta: {
            return_url: `https://www.cashfree.com/devstudio/preview/pg/web/checkout?order_id=${orderId}`,
            notify_url: `https://thehomedaze.com/checkout/webhook`,
        },payment_methods: {
            upi: {
                enabled: true,
                options: {
                    qr: true,  // This enables QR code for desktop
                    intent: true,
                    collect: true // This enables UPI collect
                }
            }
        }
        }; 

        Cashfree.PGCreateOrder("2023-08-01", request)
        .then(async (response) => {
            res.json({
            order_id: orderId, 
            payment_session_id: response.data.payment_session_id,
            });
        })
        .catch((error) => {
            console.error(error.response?.data?.message || error.message);
            res.status(500).json({ error: error.message });
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

router.post("/verify", async (req, res) => {
    try {
        const db = getDb().connection;
        const { orderId, request } = req.body; 

        const CurrUser = await db
        .collection("users")
        .findOne({ username: req.user.username });

        if (!CurrUser) {
        return res.status(404).json({ message: "User not found" });
        }

        if (!orderId) {
        return res.status(400).json({ message: "Order ID is required" });
        }

        Cashfree.PGOrderFetchPayments("2023-08-01", orderId)
        .then(async (response) => {
            if (response && response.data) {
            const resData = response.data[0];

            // Check payment status
            if (resData && resData.payment_status === "SUCCESS") {
                // Update order to success
                await db.collection("orders").insertOne(
                { 
                    planid: new ObjectId(request.membershipId),
                    user: CurrUser._id,
                    orderId: orderId,
                    PlanName: request.membershipName,
                    Name: request.name,
                    Mobile: request.mobile,
                    Amount: resData.order_amount,
                    Mode : resData.payment_method,
                    Status : resData.payment_status,
                    txnId: resData.cf_payment_id,
                    bankReference: resData.bank_reference,
                    time : resData.payment_time,
                    success: true,
                },
                );

                await db
                .collection("users")
                .findOneAndUpdate(
                    { username: req.user.username },
                    { $set: { membership: request.membershipId } }
                );

                res.json(response.data);
            } else {
                res.status(400).json({ message: "Payment failed or was canceled" });
            }
            } else {
            res.status(500).json({ message: "Unexpected response format from Cashfree" });
            }
        })
        .catch((error) => {
            console.error(
            "Error response:",
            error?.response?.data?.message || error.message || error
            );
            res.status(500).json({
            message: "An error occurred while fetching payment details",
            });
        });
    } catch (error) {
        console.log("Server error:", error);
        res.status(500).json({ message: "Server error" });
    }
});



router.get("/change-plan/:planId", async (req, res) => {
    try {
        const db = getDb().connection;
        const planId = req.params.planId;

        console.log("Requested Plan ID:", planId);

        const CurrUser = await db
            .collection("users")
            .findOne({ username: req.user.username });

        if (!CurrUser) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if user has an existing membership plan
        const membershipId = CurrUser.membership ? new ObjectId(CurrUser.membership) : null;
        const planObjectId = ObjectId.isValid(planId) ? new ObjectId(planId) : planId;

        // Retrieve new plan details
        const newPlan = await db.collection("memberships").findOne(
            { _id: planObjectId },
            { projection: { PlanName: 1, discountedPrice: 1 } }
        );

        if (!newPlan) {
            return res.status(404).json({ message: "Requested plan not found" });
        }

        // If the user has no existing plan, return the full price of the new plan
        if (!membershipId) {
            return res.status(200).json({ NewDiscountedPrice: newPlan.discountedPrice });
        }

        // Retrieve current (old) plan details if user has an existing membership
        const oldPlan = await db.collection("memberships").findOne(
            { _id: membershipId },
            { projection: { PlanName: 1, discountedPrice: 1 } }
        );

        if (!oldPlan) {
            return res.status(404).json({ message: "Current plan not found" });
        }

        let priceAdjustment;

        if (oldPlan.discountedPrice > newPlan.discountedPrice) {
            // Downgrading to a lower-priced plan: return the full price of the new plan
            priceAdjustment = newPlan.discountedPrice;
        } else {
            // Upgrading to a higher-priced plan: return the price difference
            priceAdjustment = newPlan.discountedPrice - oldPlan.discountedPrice;
        }

        res.status(200).json({ NewDiscountedPrice: priceAdjustment });

    } catch (error) {
        console.log("Server error:", error);
        res.status(500).json({ message: "Server error" });
    }
});


export default router;