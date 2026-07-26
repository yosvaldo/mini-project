import type { NextFunction, Request, Response } from "express";

import AppError from "../errors/app.error.js";
import eventRepository from "../repositories/event.repository.js";
import { responseBuilder } from "../utils/response-builder.util.js";
import { createEventSchema, updateEventSchema } from "../validators/event.validator.js";

class EventController {
    getAll = async (
        _: Request,
        res: Response,
        next: NextFunction,
    ) => {
        try {
            const events = await eventRepository.findMany();

            return res.send(
                responseBuilder(
                    200,
                    "Events fetched successfully.",
                    events,
                ),
            );
        } catch (error) {
            next(error);
        }
    };

    getById = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        try {
            const event = await eventRepository.find({
                id: req.params.id as string,
            });

            if (!event) {
                throw new AppError("Event not found.", 404);
            }

            return res.send(
                responseBuilder(
                    200,
                    "Event fetched successfully.",
                    event,
                ),
            );
        } catch (error) {
            next(error);
        }
    };

    create = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        try {
            if (!req.user) {
                throw new AppError("User not authenticated.", 401);
            }

            const body = await createEventSchema.parseAsync(req.body);

            const event = await eventRepository.create({
                organizerId: req.user.id,

                ...body,
            });

            return res.status(201).send(
                responseBuilder(
                    201,
                    "Event created successfully.",
                    event,
                ),
            );
        } catch (error) {
            next(error);
        }
    };

    update = async (
        req: Request,
        res: Response,
        next: NextFunction,
    ) => {
        try {
            if (!req.user) {
                throw new AppError("User not authenticated.", 401);
            }

            const body = await updateEventSchema.parseAsync(req.body);

            const event = await eventRepository.find({
                id: req.params.id as string,
            });

            if (!event) {
                throw new AppError("Event not found.", 404);
            }

            if (event.organizerId !== req.user.id) {
                throw new AppError(
                    "You are not allowed to update this event.",
                    403,
                );
            }

            const updatedEvent = await eventRepository.update(
                event.id,
                   body,
            );

            return res.send(
                responseBuilder(
                    200,
                    "Event updated successfully.",
                    updatedEvent,
                ),
            );
        } catch (error) {
            next(error);
        }
    };
}

export default new EventController();