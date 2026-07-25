import { create } from "zustand";
import { eventService, type EventItem } from "../services/event.service";

interface RawEventResponse {
  id: string;
  organizer_id?: string;
  name?: string;
  title?: string;
  price?: number | string;
  ticketPrice?: number | string;
  type?: string;
  category?: string;
  date?: string;
  startDate?: string;
  location?: string;
  venue?: string;
  city?: string;
  description?: string;
  available_seats?: number;
  created_at?: string;
  user?: { name?: string; email?: string };
  organizer?: { name?: string };
  organizerName?: string;
  imageUrl?: string;
  image?: string;
  banner?: string;
}

interface EventState {
  events: EventItem[];
  loading: boolean;
  error: string | null;
  fetchEvents: () => Promise<void>;
}

export const useEventStore = create<EventState>((set) => ({
  events: [],
  loading: false,
  error: null,

  fetchEvents: async () => {
    set({ loading: true, error: null });
    try {
      const response = await eventService.getAllEvents();
      
      const rawEvents: RawEventResponse[] = Array.isArray(response)
        ? response
        : response?.data || response?.events || [];

      set({ events: rawEvents as EventItem[], loading: false });
    } catch (err: unknown) {
      console.error("Zustand fetchEvents error:", err);
      const errorObject = err as { response?: { data?: { message?: string } }; message?: string };
      const message =
        errorObject?.response?.data?.message || errorObject?.message || "Failed to load events";
      set({ error: message, loading: false });
    }
  },
}));