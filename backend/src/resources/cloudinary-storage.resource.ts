import { Router } from "express";
import { imageUploader } from "../middlewares/uploader.middleware.js";
import cloudinaryStorageController from "../controllers/cloudinary-storage.controller.js";

const cloudinaryStorageResource = Router();

cloudinaryStorageResource.post(
    "/avatars",
    imageUploader().single("image"),
    cloudinaryStorageController.uploadAvatar,
);

cloudinaryStorageResource.post(
    "/payment-proofs",
    imageUploader().single("image"),
    cloudinaryStorageController.uploadPaymentProof,
);

export default cloudinaryStorageResource;