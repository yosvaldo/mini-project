import type { Request } from "express";
import multer, { type FileFilterCallback, type Multer } from "multer";
import AppError from "../errors/app.error.js";

const buildUploader = (
	allowedMimeTypes: string[],
	maxFileSizeInMB: number = 5,
) => {
	const fileFilter = (
		_req: Request,
		file: Express.Multer.File,
		cb: FileFilterCallback,
	) => {
		if (!allowedMimeTypes.includes(file.mimetype)) {
			return cb(
				new AppError(
					`Invalid file type. Allowed types: ${allowedMimeTypes.join(", ")}`,
					400,
				),
			);
		} else {
			cb(null, true);
		}
	};

	const ONE_MB = 1024 ** 2;
	const limits = { fileSize: maxFileSizeInMB * ONE_MB };
	return multer({ fileFilter, limits }) as Multer;
};

export default buildUploader;