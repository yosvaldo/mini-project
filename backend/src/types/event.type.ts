export interface CreateEventData {
    organizerId: string;

    name: string;
    description: string;
    location: string;

    date: Date;

    price: number;
    seats: number;

    imageUrl?: string;
}

export interface UpdateEventData {
    name?: string;
    description?: string;
    location?: string;

    date?: Date;

    price?: number;
    seats?: number;

    imageUrl?: string;
}