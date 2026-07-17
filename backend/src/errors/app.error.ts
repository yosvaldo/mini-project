class AppError extends Error {
	status?: number | undefined;
	object?: unknown;
	constructor(message?: string, status?: number | undefined, object?: unknown) {
		super(message);
		this.status = status;
		this.object = object;
	}
}

export default AppError;