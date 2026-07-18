import buildUploader from "../factories/build-uploader.factory.js";

export const imageUploader = (limit: number = 1.5) => {
	return buildUploader(
		["image/png", "image/jpeg", "image/webp", "image/gif"],
		limit,
	);
};