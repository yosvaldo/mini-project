import useAuthStore from "@/stores/authStore";
import { redirect, type MiddlewareFunction } from "react-router-dom";

export const guestMiddleware: MiddlewareFunction = async (_, next) => {
  const { user } = useAuthStore.getState();

  if (user) {
    throw redirect("/");
  }

  return next();
};

export const customerMiddleware: MiddlewareFunction = async (_, next) => {
  const { user } = useAuthStore.getState();

  if (!user) {
    throw redirect("/login");
  }

  if (user.role !== "CUSTOMER") {
    throw redirect("/");
  }

  return next();
};

export const organizerMiddleware: MiddlewareFunction = async (_, next) => {
  const { user } = useAuthStore.getState();

  if (!user) {
    throw redirect("/login");
  }

  if (user.role !== "ORGANIZER") {
    throw redirect("/");
  }

  return next();
};