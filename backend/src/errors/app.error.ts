class AppError extends Error {
    status: number;
    object?: unknown;

    constructor(
        message = "Internal Server Error",
        status = 500,
        object?: unknown,
    ) {
        super(message);

        this.status = status;
        this.object = object;

        Object.setPrototypeOf(this, AppError.prototype);
    }
}

export default AppError;