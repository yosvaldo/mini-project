import { Router } from "express";
import { imageUploader } from "../middlewares/uploader.middleware.js";
import cloudinaryStorageController from "../controllers/cloudinary-storage.controller.js";

const cloudinaryStorageResource = Router();

cloudinaryStorageResource.post(
    "/images",
    imageUploader().single("image"),
    cloudinaryStorageController.uploadImage,
);

export default cloudinaryStorageResource;