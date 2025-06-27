import express from "express";
import mongoose from "mongoose";
import { getDb } from "../db/conn.mjs";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";

const ObjectId = mongoose.Types.ObjectId;

const router = express.Router();

///////////////function for deleting data from cloudinary//////////////////////

const deleteCloudinaryMedia = async (media) => {
  let allMediaDeleted = true;
  let deletionResults = [];

  if (media && Object.keys(media).length > 0) {
    const mediaEntries = Object.entries(media);

    for (const [key, mediaUrl] of mediaEntries) {
      try {
        const publicId = mediaUrl.split("/").slice(-2).join("/").split(".")[0];
        const resourceType = mediaUrl.includes("/video/upload/")
          ? "video"
          : "image";

        const result = await cloudinary.uploader.destroy(publicId, {
          resource_type: resourceType,
        });

        if (result.result === "not found") {
          deletionResults.push({ media: key, status: "Media not found" });
          allMediaDeleted = false;
        } else {
          deletionResults.push({ media: key, status: "Deleted successfully" });
        }
      } catch (err) {
        console.error(`Failed to delete media file (${key}): ${mediaUrl}`, err);
        deletionResults.push({ media: key, status: `Error: ${err.message}` });
        allMediaDeleted = false;
      }
    }
  }
  return { allMediaDeleted, deletionResults };
};

///////////////////////////////////////////////////////////////////////////////

router.get("/get-stats", async (req, res) => {
  try {
    const db = getDb().connection;
    const CurrUser = await db
      .collection("users")
      .findOne({ username: req.user.username });
    if (CurrUser.role !== "admin"  && CurrUser.role !== "mainAdmin") {
      return res
        .status(401)
        .json({ message: "Unauthorized access. You are not an Admin." });
    }
    const usersCount = await db.collection("users").countDocuments();
    const postsCount = await db.collection("postads").countDocuments();
    const ordersCount = await db.collection("orders").countDocuments();
    return res.status(200).json({ usersCount, postsCount, ordersCount });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});


router.get("/get-all-user", async (req, res) => {
  try {
    const db = getDb().connection;

    const CurrUser = await db
      .collection("users")
      .findOne({ username: req.user.username });

    if (CurrUser.role !== "admin" && CurrUser.role !== "mainAdmin") {
      return res
        .status(401)
        .json({ message: "Unauthorized access You are not Admin" });
    }

    const Allusers = await db.collection("users")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return res.status(200).json({ Allusers });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/get-all-membership-users", async (req, res) => {
  try {
    const db = getDb().connection;

    const CurrUser = await db
      .collection("users")
      .findOne({ username: req.user.username });

    if (CurrUser.role !== "admin"  && CurrUser.role !== "mainAdmin") {
      return res
        .status(401)
        .json({ message: "Unauthorized access You are not Admin" });
    }

    const membershipUsers = await db
      .collection("users")
      .find({ membership: { $exists: true, $ne: null } })
      .toArray();

    if (membershipUsers.length === 0) {
      return res
        .status(404)
        .json({ message: "No users with a membership plan found." });
    }

    return res.status(200).json({ users: membershipUsers });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/get-all-memberships", async (req, res) => {
  try {
    const db = getDb().connection;

    const CurrUser = await db
      .collection("users")
      .findOne({ username: req.user.username });

    if (CurrUser.role !== "admin"  && CurrUser.role !== "mainAdmin") {
      return res
        .status(401)
        .json({ message: "Unauthorized access You are not Admin" });
    }

    const memberships = await db.collection("memberships").find({}).toArray();

    if (memberships.length === 0) {
      return res
        .status(404)
        .json({ message: "No users with a membership plan found." });
    }

    return res.status(200).json({ memberships: memberships });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/delete-user-by-id/:userId", async (req, res) => {
  try {
    const db = getDb().connection;
    const userId = req.params.userId;

    const CurrUser = await db
      .collection("users")
      .findOne({ username: req.user.username });

    if (CurrUser.role !== "admin"  && CurrUser.role !== "mainAdmin") {
      return res
        .status(401)
        .json({ message: "Unauthorized access. You are not Admin." });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    const objectId = new mongoose.Types.ObjectId(userId);

    const posts = await db
      .collection("postads")
      .find({ user: objectId })
      .toArray();

    if (posts.length === 0) {
      const deleteResult = await db.collection("users").deleteOne({ _id: objectId });
      if (deleteResult.deletedCount === 0) {
        return res.status(404).json({ message: "User not found." });
      }
      return res.status(200).json({ message: "No posts found for this user. User account successfully deleted." });
    }
    

    let allMediaDeleted = true;
    let deletionResults = [];

    for (const post of posts) {
      const {
        allMediaDeleted: mediaDeletedForPost,
        deletionResults: resultsForPost,
      } = await deleteCloudinaryMedia(post.media);

      deletionResults.push({ postId: post._id, resultsForPost });
      allMediaDeleted = allMediaDeleted && mediaDeletedForPost;

      await db.collection("postads").deleteOne({ _id: post._id });
    }

    const userResult = await db
      .collection("users")
      .deleteOne({ _id: objectId });

    if (userResult.deletedCount === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    if (allMediaDeleted) {
      return res.status(200).json({
        message: `User and all associated posts and media files deleted successfully.`,
        deletionResults,
      });
    } else {
      return res.status(207).json({
        message:
          "User and posts deleted, but some media files were not found or could not be deleted.",
        deletionResults,
      });
    }
  } catch (error) {
    console.error("Error deleting user and posts:", error);
    return res.status(500).json({
      message: "An error occurred while deleting the user and posts.",
      error: error.message,
    });
  }
});

router.put("/update-post/:postId", async (req, res) => {
  try {
    const db = getDb().connection;

    const CurrUser = await db
      .collection("users")
      .findOne({ username: req.user.username });

    if (CurrUser.role !== "admin"  && CurrUser.role !== "mainAdmin") {
      return res
        .status(401)
        .json({ message: "Unauthorized access. You are not an Admin." });
    }

    const postId = req.params.postId;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Invalid post ID." });
    }

    const post = await db
      .collection("postads")
      .findOne({ _id: new ObjectId(postId) });

    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    const { isVerified } = req.body;

    if (typeof isVerified !== "undefined") {
      post.isVerified = isVerified;
    }

    const updateResult = await db.collection("postads").findOneAndUpdate(
      { _id: new ObjectId(postId) },
      {
        $set: post,
      }
    );

    if (updateResult.modifiedCount === 0) {
      return res
        .status(404)
        .json({ message: "Post not found or no changes made." });
    }

    return res.status(200).json({ message: "Post updated successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/update-user-by-id/:id", async (req, res) => {
  try {
    const db = getDb().connection;

    const CurrUser = await db
      .collection("users")
      .findOne({ username: req.user.username });

    if (CurrUser.role !== "admin"  && CurrUser.role !== "mainAdmin") {
      return res
        .status(401)
        .json({ message: "Unauthorized access. You are not an Admin." });
    }

    const userId = req.params.id;

    const { name, role, accountStatus, isVerified } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const updateData = {};

    updateData._id = new ObjectId(userId);

    if (name) {
      updateData.name = name;
    }

    if (role) {
      updateData.role = role;
    }

    if (accountStatus) {
      updateData.accountStatus = accountStatus;
    }

    if (typeof isVerified !== "undefined") {
      updateData.isVerified = isVerified;
    }

    const updateResult = await db.collection("users").findOneAndUpdate(
      { _id: updateData._id },
      {
        $set: updateData,
      }
    );

    if (updateResult.modifiedCount === 0) {
      return res
        .status(404)
        .json({ message: "User not found or no changes made." });
    }

    return res
      .status(200)
      .json({ message: "User details updated successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/get-all-posts", async (req, res) => {
  try {
    const db = getDb().connection;
    const CurrUser = await db
      .collection("users")
      .findOne({ username: req.user.username });

    if (CurrUser.role !== "admin"  && CurrUser.role !== "mainAdmin") {
      return res
        .status(401)
        .json({ message: "Unauthorized access. You are not an Admin." });
    }

    const posts = await db.collection("postads").find({}).sort({ createdAt: -1 }).toArray();
    
    if (!posts) {
      return res.status(404).json({ message: "No posts found " });
    }

    for (const post of posts) {
      const userData = await db.collection("users").findOne(
        { _id: post.user },
        { projection: { photo: 1, username: 1 } } // Fetch only photo and name
      );

      // If userData exists, merge it into the post
      if (userData) {
        post.user = {
          _id: userData._id, // Maintain the user ID
          photo: userData.photo,
          username: userData.username,
        };
      } else {
        post.user = null; // In case the user is not found
      }
    }

    return res.status(200).json({ posts });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/get-post-by-user-id/:userId", async (req, res) => {
  try {
    const db = getDb().connection;
    const userId = req.params.userId;

    const CurrUser = await db
      .collection("users")
      .findOne({ username: req.user.username });

    if (CurrUser.role !== "admin"  && CurrUser.role !== "mainAdmin") {
      return res
        .status(401)
        .json({ message: "Unauthorized access. You are not an Admin." });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    const objectId = new mongoose.Types.ObjectId(userId);

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const userExists = await db
      .collection("users")
      .findOne({ _id: new ObjectId(userId) });

    if (!userExists) {
      return res.status(404).json({ message: "User not found." });
    }

    const posts = await db
      .collection("postads")
      .find({ user: objectId })
      .toArray();

    if (posts.length === 0) {
      return res.status(404).json({ message: "No posts found for this user." });
    }

    return res.status(200).json({ posts });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/delete-post-by-id/:postId", async (req, res) => {
  try {
    const db = getDb().connection;
    const postId = req.params.postId;

    const CurrUser = await db
      .collection("users")
      .findOne({ username: req.user.username });

    if (CurrUser.role !== "admin"  && CurrUser.role !== "mainAdmin") {
      return res
        .status(401)
        .json({ message: "Unauthorized access. You are not an Admin." });
    }

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Invalid post ID." });
    }

    const post = await db
      .collection("postads")
      .findOne({ _id: new ObjectId(postId) });

    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    const { allMediaDeleted, deletionResults } = await deleteCloudinaryMedia(
      post.media
    );

    await db.collection("postads").deleteOne({ _id: new ObjectId(postId) });

    if (allMediaDeleted) {
      return res.status(200).json({
        message: "Post and all associated media deleted successfully",
        deletionResults,
      });
    } else {
      return res.status(207).json({
        message:
          "Post deleted, but some media files were not found or could not be deleted",
        deletionResults,
      });
    }
  } catch (error) {
    console.error("Error deleting post and media:", error);
    return res.status(500).json({
      message: "An error occurred while deleting the post and media.",
      error: error.message,
    });
  }
});

router.get("/get-all-pending-posts", async (req, res) => {
  try {
    const db = getDb().connection;

    const CurrUser = await db
      .collection("users")
      .findOne({ username: req.user.username });

    if (CurrUser.role !== "user") {
      return res
        .status(401)
        .json({ message: "Unauthorized access. You are not an Admin." });
    }

    const posts = await db
      .collection("postads")
      .find({ media: null })
      .toArray();

    if (posts.length === 0) {
      return res.status(404).json({ message: "No posts found." });
    }

    return res.status(200).json({ posts });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/update-memberships/:membershipId", async (req, res) => {
  try {
    const db = getDb().connection;

    const CurrUser = await db
      .collection("users")
      .findOne({ username: req.user.username });

    if (CurrUser.role !== "admin"  && CurrUser.role !== "mainAdmin") {
      return res
        .status(401)
        .json({ message: "Unauthorized access. You are not an Admin." });
    }

    const { membershipId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(membershipId)) {
      return res.status(400).json({ message: "Invalid membership ID." });
    }

    const { durationInDays, features, originalPrice, discountedPrice } =
      req.body;

    const updateFields = {};

    //if (planName) updateFields.planName = planName;
    // if (durationInDays) updateFields.durationInDays = durationInDays;
    // if (features) updateFields.features = features;
    if (originalPrice) updateFields.originalPrice = originalPrice;
    if (discountedPrice) updateFields.discountedPrice = discountedPrice;

    if (Object.keys(updateFields).length === 0) {
      return res
        .status(400)
        .json({ message: "No valid fields provided to update." });
    }

    const result = await db
      .collection("memberships")
      .updateOne({ _id: new ObjectId(membershipId) }, { $set: updateFields });

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Membership not found." });
    }

    return res
      .status(200)
      .json({ message: "Membership updated successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/get-all-contacts", async (req, res) => {
  try {
    const db = getDb().connection;

    const CurrUser = await db
      .collection("users")
      .findOne({ username: req.user.username });

    if (CurrUser.role !== "admin"  && CurrUser.role !== "mainAdmin") {
      return res
        .status(401)
        .json({ message: "Unauthorized access. You are not an Admin." });
    }

    const contacts = await db.collection("contactUs").find({}).toArray();

    if (!contacts) {
      return res.status(404).json({ message: "No contacts found" });
    }

    return res.status(200).json({ contacts });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/get-all-orders", async (req, res) => {
  try {
    const db = getDb().connection;

    const CurrUser = await db
      .collection("users")
      .findOne({ username: req.user.username });

    if (CurrUser.role !== "admin"  && CurrUser.role !== "mainAdmin") {
      return res
        .status(401)
        .json({ message: "Unauthorized access. You are not an Admin." });
    }

    const orders = await db.collection("orders").find({}).sort({ time: -1 }).toArray();

    const orderDetails = await Promise.all(
      orders.map(async (order) => {
        const [user, plan] = await Promise.all([
          db
            .collection("users")
            .findOne(
              { _id: new ObjectId(order.user) },
              { projection: { username: 1 } }
            ),
          db
            .collection("memberships")
            .findOne(
              { _id: new ObjectId(order.planid) },
              { projection: { planName: 1 } }
            ),
        ]);

        order.user = user;
        order.plan = plan;
        delete order.planid;

        return order;
      })
    );

    return res.status(200).json({ orders: orderDetails });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/get-all-admins", async (req, res) => {
  try {
    const db = getDb().connection;

    const CurrUser = await db
      .collection("users")
      .findOne({ username: req.user.username });

    if (CurrUser.role !== "admin"  && CurrUser.role !== "mainAdmin") {
      return res
        .status(401)
        .json({ message: "Unauthorized access. You are not an Admin." });
    }

    const admins = await db
      .collection("users")
      .find({ role: "admin" })
      .sort({ createdAt: -1 })
      .toArray();

    if (admins.length === 0) {
      return res.status(404).json({ message: "No Admins found" });
    }

    return res.status(200).json({ admins });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/remove-admin-role", async (req, res) => {
  try {
    const db = getDb().connection;

    const CurrUser = await db
      .collection("users")
      .findOne({ username: req.user.username });

    if (CurrUser.role !== "mainAdmin") {
      return res.status(401).json({
        message:
          "Forbidden: You do not have permission to access this resource.",
      });
    }

    const posts = await db
      .collection("postads")
      .find({ postedBy: req.user.username })
      .toArray();

    if (posts.length > 0) {
      await db
        .collection("users")
        .updateOne({ username: req.user.username }, { $set: { role: "user" } });
      return res
        .status(200)
        .json({ message: "Admin role removed. User role assigned." });
    } else {
      await db
        .collection("users")
        .updateOne(
          { username: req.user.username },
          { $set: { role: "user", AdminRoleRemoved: true } }
        );
      return res.status(200).json({
        message: "No Post Found Admin role removed. User Role assigned",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/recent-admin-activities", async (req, res) => {
  try {
    const db = getDb().connection;

    const CurrUser = await db
      .collection("users")
      .findOne({ username: req.user.username });

    if (CurrUser.role !== "mainAdmin") {
      return res.status(403).json({
        message:
          "Forbidden: You do not have permission to access this resource.",
      });
    }

    const admins = await db
      .collection("users")
      .find({ role: "admin" })
      .toArray();

    const activities = [];
    for (const admin of admins) {
      const adminActivities = await db
        .collection("activities")
        .find({ userId: admin._id })
        .sort({ timestamp: -1 })
        .limit(10)
        .toArray();

      activities.push({ admin: admin.username, activities: adminActivities });
    }

    return res.status(200).json({ activities });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
