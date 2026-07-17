export const responseBuilder = (
	status: number,
	message: string,
	data: any,
	meta?: {
		currentPage?: number;
		limit?: number;
		totalPages?: number;
		totalItems?: number;
	},
) => {
	return { status, message, data, ...(meta && { meta }) };
};