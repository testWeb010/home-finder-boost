import express from "express";
import PostAdd from "../models/postAd.mjs";
import { getDb } from "../db/conn.mjs";
import mongoose from "mongoose";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";
import requireAuth from "../middlewares/requireAuth.mjs";

const ObjectId = mongoose.Types.ObjectId;

const router = express.Router();

const gender = ["male", "female", "other", "any"];
const property = ["apartment", "pg", "singleroom"];

// Helper functions to validate data types
function isBoolean(data) {
  return typeof data === "boolean";
}

function isNumber(data) {
  const num = Number(data);

  if (!isNaN(num) && typeof num === "number") {
    return true;
  }

  return false;
}

function isString(data) {
  return typeof data === "string";
}

////////////////function for delete post data from cloudinary ////////////////

export const deletePostById = async (db, postId, CurrUser) => {
  // Validate that the postId is a valid ObjectId
  if (!mongoose.Types.ObjectId.isValid(postId)) {
    return { status: 400, message: "Invalid post ID." };
  }

  const post = await db
    .collection("postads")
    .findOne({ _id: new ObjectId(postId) });

  if (!post) {
    return { status: 404, message: "Post not found." };
  }

  if (!CurrUser || CurrUser.role !== "Admin") {
    if (CurrUser._id.toString() !== post.user.toString()) {
      return { status: 401, message: "Unauthorized Access." };
    }
  }

  let allMediaDeleted = true;
  let deletionResults = [];

  if (post.media && Object.keys(post.media).length > 0) {
    const mediaEntries = Object.entries(post.media);

    for (const [key, mediaUrl] of mediaEntries) {
      try {
        if (mediaUrl) {
          const publicId = mediaUrl
            .split("/")
            .slice(-2)
            .join("/")
            .split(".")[0];

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
            deletionResults.push({
              media: key,
              status: "Deleted successfully",
            });
          }
        }
      } catch (err) {
        console.error(`Failed to delete media file (${key}): ${mediaUrl}`, err);
        deletionResults.push({ media: key, status: `Error: ${err.message}` });
        allMediaDeleted = false;
      }
    }
  }

  // Delete the post from the database
  await db.collection("postads").deleteOne({ _id: new ObjectId(postId) });

  if (allMediaDeleted) {
    return {
      status: 200,
      message: "Post and all associated media deleted successfully",
      deletionResults,
    };
  } else {
    return {
      status: 404,
      message: "Post deleted, but some media files were not found",
      deletionResults,
    };
  }
};

// Delete old post while adding new one
const getPublicId = (mediaUrl) => {
  const segments = mediaUrl.split("/");
  const fileName = segments.pop();
  const publicId = segments.pop() + "/" + fileName.split(".")[0];
  return publicId;
};

const deleteOldMedia = async (mediaUrl) => {
  const publicId = getPublicId(mediaUrl);
  const resourceType = mediaUrl.includes("/video/upload/") ? "video" : "image";

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    if (result.result === "not found") {
      console.warn(
        `Media not found on Cloudinary Updated new media: ${mediaUrl}`
      );
    } else if (result.result !== "ok") {
      console.error(`Failed to delete media: ${mediaUrl}`);
    } else {
      console.log(
        `Successfully deleted old media and updated new post: ${mediaUrl}`
      );
    }
  } catch (error) {
    console.error(`Error deleting media at ${mediaUrl}:`, error);
  }
};

/////////////////////////////////////////////////////////

// ---------------------------------------------------------------------------//
// Set up Multer storage and file handling
// cloudinary configuration

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// multer configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "mediaFiles",
    resource_type: "auto",
    chunk_size: 6000000,
    transformation: [
      {
        quality: "auto:low",
        width: 1280, // Reduce resolution width for faster upload
        height: 720, // Reduce resolution height for faster upload
        bitrate: "500k",
      },
    ],
  },
});

const upload = multer({ storage });

//----------------------------------------------------------------------------//

router.post("/addpost", requireAuth, async (req, res) => {
  try {
    const db = getDb().connection;
    const {
      city,
      pincode,
      totalRooms,
      totalRent,
      electricityIncluded,
      kitchen,
      washroom,
      canSmoke,
      isIndependent,
      capacity,
      preferedGender,
      propertyType,
      propertyName,
      aboutRoommate,
      needRoommate,
      mobile,
      location,
      securityMoney,
    } = req.body;

    // Validate required fields and data types
    if (!city || !isString(city)) {
      return res.status(400).json({ message: "City is required." });
    }
    if (!pincode || !isNumber(pincode)) {
      return res.status(400).json({ message: "Pincode is required." });
    }
    if (!propertyName || !isString(propertyName)) {
      return res.status(400).json({ message: "Property name is required." });
    }
    if (needRoommate && !aboutRoommate) {
      return res.status(400).json({ message: "About Roommate is required." });
    }

    if (propertyType !== property[2] && !totalRooms) {
      if (!isNumber(totalRooms)) {
        return res
          .status(400)
          .json({ message: "Total rooms must be a number." });
      }
      return res.status(400).json({ message: "Total rooms are required." });
    }
    if (!mobile || !isNumber(mobile) || mobile.length !== 10) {
      return res
        .status(400)
        .json({ message: "Valid Mobile number is required." });
    }
    if (!isBoolean(needRoommate)) {
      return res.status(400).json({ message: "Need Roommate is required." });
    }
    if (!totalRent) {
      return res.status(400).json({ message: "Total rent is required." });
    } else if (!isNumber(totalRent)) {
      return res.status(400).json({ message: "Total rent must be a number." });
    }
    if (!securityMoney) {
      return res.status(400).json({ message: "Total rent is required." });
    } else if (!isNumber(securityMoney)) {
      return res.status(400).json({ message: "Total rent must be a number." });
    }
    if (electricityIncluded === undefined || !isBoolean(electricityIncluded)) {
      return res
        .status(400)
        .json({ message: "Electricity inclusion is required." });
    }
    if (
      !kitchen ||
      kitchen.isShared === undefined ||
      kitchen.isKitchen === undefined ||
      !isBoolean(kitchen.isShared) ||
      !isBoolean(kitchen.isKitchen)
    ) {
      return res.status(400).json({ message: "Kitchen details are required." });
    }
    if (
      !washroom ||
      washroom.isShared === undefined ||
      washroom.isWashroom === undefined ||
      !isBoolean(washroom.isShared) ||
      !isBoolean(washroom.isWashroom)
    ) {
      return res
        .status(400)
        .json({ message: "Washroom details are required." });
    }
    if (canSmoke === undefined || !isBoolean(canSmoke)) {
      return res
        .status(400)
        .json({ message: "Smoking preference is required." });
    }
    if (isIndependent === undefined || !isBoolean(isIndependent)) {
      return res
        .status(400)
        .json({ message: "Independence status is required." });
    }
    if (!capacity) {
      return res.status(400).json({ message: "Capacity is required." });
    } else if (!isNumber(capacity)) {
      return res
        .status(400)
        .json({ message: "Total capacity must be a number." });
    }
    if (!preferedGender || !gender.includes(preferedGender)) {
      return res.status(400).json({
        message:
          "Preferred gender is required and must be one of the following: male, female, other, any.",
      });
    }
    if (!propertyType || !property.includes(propertyType)) {
      return res.status(400).json({
        message:
          "Property type is required and must be one of the following: apartment, pg, singleroom.",
      });
    }

    // Find the user by username
    const user = await db
      .collection("users")
      .findOne({ username: req.user.username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Create a new PostAdd document
    const newPost = new PostAdd({
      user: user._id,
      city: city.toLowerCase(),
      pincode,
      totalRooms,
      totalRent,
      electricityIncluded,
      kitchen: [kitchen.isKitchen, kitchen.isShared],
      washroom: [washroom.isWashroom, washroom.isShared],
      canSmoke,
      isIndependent,
      capacity,
      needRoommate,
      aboutRoommate,
      securityMoney,
      propertyName,
      mobile,
      location: {
        longitude: location.longitude,
        latitude: location.latitude,
      },
      extra: [
        req.body.extra.RoWater,
        req.body.extra.AC,
        req.body.extra.nonAC,
        req.body.extra.availFoodService,
      ],
      preferedGender,
      propertyType,
      description: req.body.description
        ? req.body.description.toLowerCase()
        : null,
      images: [],
      video: "",
    });

    // Save the post to the database
    await newPost.save();

    // Respond with the newly created post
    return res
      .status(201)
      .json({ message: "Post added successfully", post: newPost });
  } catch (error) {
    console.error("Error adding post:", error);
    return res.status(500).json({
      message: "An error occurred while adding the post",
      error: error.message,
    });
  }
});

router.get("/getpost", requireAuth, async (req, res) => {
  try {
    const db = getDb().connection;

    const posts = await db
      .collection("postads")
      .find(
        { isActive: true },
        { projection: { _id: 0, location: 0, mobile: 0, updatedAt: 0 } }
      )
      .toArray();

    return res.status(200).json({ posts });
  } catch (error) {
    console.error("Error retrieving active posts:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while retrieving posts" });
  }
});

router.get("/get-post-by-id/:id", requireAuth, async (req, res) => {
  try {
    const db = getDb().connection;
    const postId = req.params.id;

    // Validate that the ID is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Invalid post ID." });
    }

    // Find the post by ID
    const post = await db
      .collection("postads")
      .findOne(
        { _id: new ObjectId(postId) },
        { projection: { _id: 0, location: 0, mobile: 0, updatedAt: 0 } }
      );
    // Check if the post was found
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    const CurrUser = await db
      .collection("users")
      .findOne({ username: req.user.username });

    if (!CurrUser) {
      return res.status(401).json({ message: "Unauthorized Access" });
    }

    if (CurrUser._id.toString() !== post.user.toString()) {
      // increment clicks
      await db
        .collection("postads")
        .updateOne({ _id: new ObjectId(postId) }, { $inc: { clicks: 1 } });
    }

    // Check if post exists and has a user field
    if (post && post.user) {
      // console.log(post.user);
      // Fetch user data (photo, name)
      const userData = await db.collection("users").findOne(
        { _id: post.user },
        { projection: { photo: 1, name: 1 } } // Fetch only photo and name
      );

      // If userData exists, merge it into the post
      if (userData) {
        post.user = {
          _id: userData._id, // Maintain the user ID
          photo: userData.photo,
          name: userData.name,
        };
      } else {
        post.user = null; // In case the user is not found
      }
    }

    return res.status(200).json({ post });
  } catch (error) {
    console.error("Error retrieving post:", error);
    return res.status(500).json({
      message: "An error occurred while retrieving the post.",
      error: error.message,
    });
  }
});

// get popular posts
router.get("/get-popular-posts", async (req, res) => {
  try {
    const db = getDb().connection;

    const posts = await db
      .collection("postads")
      .find(
        { isVerified: true },
        {
          projection: {
            location: 0,
            mobile: 0,
            updatedAt: 0,
          },
        }
      )
      .sort({ clicks: -1 })
      .limit(10)
      .toArray();

    return res.status(200).json({ posts });
  } catch (error) {
    console.error("Error retrieving popular posts:", error);
    return res.status(500).json({
      message: "An error occurred while retrieving popular posts",
      error: error.message,
    });
  }
});

router.get("/get-post-by-user/:userId", requireAuth, async (req, res) => {
  try {
    const db = getDb().connection;
    const userId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID." });
    }

    const objectId = new mongoose.Types.ObjectId(userId);

    console.log(objectId);

    const posts = await db
      .collection("postads")
      .find({ user: objectId })
      .toArray();

    console.log(posts);

    if (!posts || posts.length === 0) {
      return res.status(404).json({ message: "No posts found for this user." });
    }

    return res.status(200).json({ posts });
  } catch (error) {
    console.error("Error retrieving posts for user:", error);
    return res.status(500).json({
      message: "An error occurred while retrieving the posts for the user.",
      error: error.message,
    });
  }
});

router.get("/get-post-by-location/:city?", requireAuth, async (req, res) => {
  try {
    const db = getDb().connection;
    const city = req.params.city?.trim() || "";
    let posts = [];

    // If a city is specified, find all posts with that city and media
    if (city) {
      posts = await db
        .collection("postads")
        .find(
          {
            $and: [
              { media: { $exists: true, $ne: "" } },
              { city: { $regex: city, $options: "i" } },
              { isVerified: true },
              { isActive: true },
            ],
          },
          {
            projection: {
              user: 0,
              location: 0,
              mobile: 0,
              email: 0,
              updatedAt: 0,
            }, // Exclude sensitive fields
          }
        )
        .toArray();
      console.log(posts.city);
    } else {
      // If no city is specified, return all posts with media
      posts = await db
        .collection("postads")
        .find(
          {
            $and: [
              { media: { $exists: true, $ne: "" } },
              { isVerified: true },
              { isActive: true },
            ],
          },
          {
            projection: {
              user: 0,
              location: 0,
              mobile: 0,
              email: 0,
              updatedAt: 0,
            }, // Exclude sensitive fields
          }
        )
        .toArray();
    }

    // Return posts without sensitive details
    return res.status(200).json({ posts });
  } catch (error) {
    console.error("Error retrieving posts:", error);
    return res.status(500).json({
      message: "An error occurred while retrieving posts.",
      error: error.message,
    });
  }
});

router.put("/activate-post/:postid", requireAuth, async (req, res) => {
  try {
    const db = getDb().connection;
    const postId = req.params.postid;

    if (!ObjectId.isValid(postId)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }

    const post = await db
      .collection("postads")
      .findOne({ _id: new ObjectId(postId) });

    const CurrUser = await db
      .collection("users")
      .findOne({ username: req.user.username });

    console.log(post);
    console.log(CurrUser);
    if (!CurrUser || post.user.toString() !== CurrUser._id.toString()) {
      return res.status(401).json({ message: "Unauthorized Access" });
    }

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    let result;
    if (post.isActive) {
      result = await db
        .collection("postads")
        .updateOne(
          { _id: new ObjectId(postId) },
          { $set: { isActive: false } }
        );
    } else {
      result = await db
        .collection("postads")
        .updateOne({ _id: new ObjectId(postId) }, { $set: { isActive: true } });
    }
    if (result.modifiedCount === 0) {
      return res.status(500).json({ message: "Failed to activate post" });
    }

    return res.status(200).json({ message: "Post activated successfully" });
  } catch (error) {
    console.error("Error activating post:", error);
    return res.status(500).json({
      message: "An error occurred while activating the post.",
      error: error.message,
    });
  }
});

router.delete("/delete-post/:postid", requireAuth, async (req, res) => {
  try {
    const db = getDb().connection;
    const postId = req.params.postid;
    const CurrUser = await db
      .collection("users")
      .findOne({ username: req.user.username });

    const result = await deletePostById(db, postId, CurrUser);

    return res.status(result.status).json({
      message: result.message,
      deletionResults: result.deletionResults,
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    return res.status(500).json({
      message: "An error occurred while deleting the post.",
      error: error.message,
    });
  }
});

router.get("/subscription/:postid", requireAuth, async (req, res) => {
  try {
    const db = getDb().connection;

    const CurrUser = await db
      .collection("users")
      .findOne({ username: req.user.username });

    const membership = await db
      .collection("memberships")
      .findOne({ _id: new ObjectId(CurrUser.membership) });

    if (CurrUser.role !== "admin" && !membership) {
      return res.status(401).json({
        message:
          "Unauthorized Access! Subscribe to get the post contact details",
      });
    }

    const post = await db
      .collection("postads")
      .findOne({ _id: new ObjectId(req.params.postid) });

    if (!post) {
      return res.status(404).json({ message: "Post details not found." });
    }

    const postOwner = await db.collection("users").findOne({ _id: post.user });
    if (!postOwner) {
      return res.status(404).json({ message: "Post owner not found." });
    }

    const contactDetails = {
      location: post.location,
      mobile: post.mobile,
      email: postOwner.email,
    };

    if (CurrUser.role === "admin") {
      return res.status(200).json(contactDetails);
    } else {
      const plan = membership.planName.toString();
      const pType = post.propertyType.toString();

      if (plan == "Basic" && pType == "singleroom") {
        return res.status(200).json(contactDetails);
      } else if (plan == "Pro" && (pType == "pg" || pType == "apartment")) {
        return res.status(200).json(contactDetails);
      } else if (plan == "Enterprise") {
        return res.status(200).json(contactDetails);
      } else {
        return res.status(404).json({ subscribed: false });
      }
    }
  } catch (error) {
    return res.status(500).json({
      message: "An error occurred while fetching subscription.",
      error: error.message,
    });
  }
});

router.get("/unique-cities", requireAuth, async (req, res) => {
  try {
    const db = getDb().connection;

    const uniqueCities = await db.collection("postads").distinct("city");

    if (!uniqueCities || uniqueCities.length === 0) {
      return res.status(404).json({ message: "No cities found" });
    }

    return res.status(200).json({ cities: uniqueCities });
  } catch (error) {
    console.error("Error fetching unique cities:", error);
    return res.status(500).json({
      message: "An error occurred while fetching unique cities",
      error: error.message,
    });
  }
});

router.post(
  "/add-media/:postid",
  requireAuth,
  upload.fields([
    { name: "roomInside", maxCount: 1 },
    { name: "roomOutside", maxCount: 1 },
    { name: "kitchen", maxCount: 1 },
    { name: "washroom", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const db = getDb().connection;
      const { postid } = req.params;
      const CurrUser = await db
        .collection("users")
        .findOne({ username: req.user.username });

      const post = await db
        .collection("postads")
        .findOne({ _id: new ObjectId(postid) });

      if (!post) {
        return res.status(404).json({ message: "Post not found." });
      }

      if (CurrUser._id.toString() !== post.user.toString()) {
        return res.status(403).json({ message: "Unauthorized Access." });
      }

      if (post.media && Object.keys(post.media).length > 0) {
        return res.status(400).json({ message: "Media is already present." });
      }

      // Retrieve uploaded files from req.files
      const images = {
        roomInside: req.files?.roomInside?.[0]?.path || null,
        roomOutside: req.files?.roomOutside?.[0]?.path || null,
        kitchen: req.files?.kitchen?.[0]?.path || null,
        washroom: req.files?.washroom?.[0]?.path || null,
      };

      const video = req.files?.video?.[0]?.path || null;

      // Check if required media fields are present
      if (!images.roomOutside || !images.roomInside || !video) {
        return res.status(400).json({
          message: "Room outside, room inside, and video are required.",
        });
      }

      // Validate for kitchen and washroom media if needed
      if (
        (post.kitchen.isKitchen && !kitchen) ||
        (post.washroom.isWashroom && !washroom)
      ) {
        return res
          .status(400)
          .json({ message: "Either washroom or kitchen photo is missing." });
      }

      // Check if files were uploaded
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          message: "No files were uploaded.",
        });
      }

      //  Update the post with the media URLs
      const collection = db.collection("postads");

      // Update the document
      const result = await collection.updateOne(
        { _id: new ObjectId(postid) },
        {
          $set: {
            "media.roomInside": images.roomInside,
            "media.roomOutside": images.roomOutside,
            "media.kitchen": images.kitchen,
            "media.washroom": images.washroom,
            "media.video": video,
          },
        }
      );

      console.log(result);

      if (result.modifiedCount === 0) {
        return res.status(404).json({ message: "Post not found" });
      }

      res.status(200).json({
        message: "Media uploaded successfully",
        // post: updatedPost,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error. Try again later." });
    }
  }
);

router.post(
  "/edit-post/:postId",
  requireAuth,
  upload.fields([
    { name: "roomInside", maxCount: 1 },
    { name: "roomOutside", maxCount: 1 },
    { name: "kitchen", maxCount: 1 },
    { name: "washroom", maxCount: 1 },
    { name: "video", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const db = getDb().connection;
      const postId = req.params.postId;

      // Fetch the current user and post
      const CurrUser = await db
        .collection("users")
        .findOne({ username: req.user.username });

      const post = await db
        .collection("postads")
        .findOne({ _id: new ObjectId(postId) });

      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }

      // Check if user is valid to authorized to edit the post
      if (CurrUser._id.toString() !== post.user.toString()) {
        return res.status(403).json({ message: "Unauthorized access" });
      }

      // Destructure fields from request body
      const {
        city,
        pincode,
        totalRooms,
        totalRent,
        electricityIncluded,
        kitchen,
        washroom,
        canSmoke,
        isIndependent,
        capacity,
        preferedGender,
        propertyType,
        propertyName,
        aboutRoommate,
        needRoommate,
        mobile,
        location,
        securityMoney,
        description,
      } = req.body;

      // Gather uploaded images and video paths
      const images = {
        roomInside: req.files?.roomInside?.[0]?.path,
        roomOutside: req.files?.roomOutside?.[0]?.path,
        kitchen: req.files?.kitchen?.[0]?.path,
        washroom: req.files?.washroom?.[0]?.path,
      };
      const video = req.files?.video?.[0]?.path;

      // Validate required media fields
      if (
        (!images.roomOutside || !images.roomInside || !video) &&
        !post.media
      ) {
        return res.status(400).json({
          message: "Room outside, room inside, and video are required.",
        });
      }

      if (
        (post.kitchen.isKitchen && !images.kitchen) ||
        (post.washroom.isWashroom && !images.washroom)
      ) {
        return res
          .status(400)
          .json({ message: "Either washroom or kitchen photo is missing." });
      }

      // Delete old media if new files are uploaded
      if (post.media) {
        if (images.roomInside) await deleteOldMedia(post.media.roomInside);
        if (images.roomOutside) await deleteOldMedia(post.media.roomOutside);
        if (images.kitchen) await deleteOldMedia(post.media.kitchen);
        if (images.washroom) await deleteOldMedia(post.media.washroom);
        if (video) await deleteOldMedia(post.media.video);
      }

      // Prepare the updated fields for MongoDB
      const updatedFields = {
        city: city ? city.toLowerCase() : post.city,
        pincode: pincode || post.pincode,
        totalRooms: totalRooms || post.totalRooms,
        totalRent: totalRent || post.totalRent,
        electricityIncluded:
          electricityIncluded !== undefined
            ? electricityIncluded
            : post.electricityIncluded,
        kitchen: kitchen || post.kitchen,
        washroom: washroom || post.washroom,
        canSmoke: canSmoke !== undefined ? canSmoke : post.canSmoke,
        isIndependent:
          isIndependent !== undefined ? isIndependent : post.isIndependent,
        capacity: capacity || post.capacity,
        needRoommate:
          needRoommate !== undefined ? needRoommate : post.needRoommate,
        aboutRoommate: aboutRoommate || post.aboutRoommate,
        securityMoney: securityMoney || post.securityMoney,
        propertyName: propertyName || post.propertyName,
        mobile: mobile || post.mobile,
        location: location || post.location,
        preferedGender: preferedGender || post.preferedGender,
        propertyType: propertyType || post.propertyType,
        description: description ? description.toLowerCase() : post.description,
        "media.roomInside": images.roomInside || post.media.roomInside,
        "media.roomOutside": images.roomOutside || post.media.roomOutside,
        "media.kitchen": images.kitchen || post.media.kitchen,
        "media.washroom": images.washroom || post.media.washroom,
        "media.video": video || post.media.video,
      };

      // Update the post document in the database
      const result = await db
        .collection("postads")
        .updateOne({ _id: new ObjectId(postId) }, { $set: updatedFields });

      // Check if the update was successful
      if (result.modifiedCount === 0) {
        return res.status(500).json({ message: "Failed to update post" });
      }

      res.status(200).json({ message: "Post updated successfully", postId });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default router;
