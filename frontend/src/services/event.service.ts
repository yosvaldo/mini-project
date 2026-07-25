import { api } from "../utils/api";

export interface EventItem {
  id: string;
  organizer_id: string;
  name: string;
  price: number | string;
  type: string;
  date: string;
  location: string;
  description?: string;
  available_seats?: number;
  created_at?: string;
  user?: {
    name?: string;
    email?: string;
  };
  imageUrl?: string;
}

export const eventService = {
  async getAllEvents() {
    const response = await api.get("/events");
    return response.data;
  },

  async getEventById(id: string) {
    const response = await api.get(`/events/${id}`);
    return response.data;
  },
};