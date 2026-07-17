import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import CheckoutPage from "../pages/checkout/CheckoutPage";
import DashboardOverview from "../pages/dashboard/DashboardOverview";
import DashboardEvents from "../pages/dashboard/DashboardEvents";
import DashboardTransactions from "../pages/dashboard/DashboardTransactions";
import NotFoundPage from "../pages/errors/NotFoundPage";
import { guestMiddleware, customerMiddleware, organizerMiddleware } from "./middlewares/auth.middleware";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        middleware: [guestMiddleware],
        children: [
          { path: "login", element: <LoginPage /> },
          { path: "register", element: <RegisterPage /> },
        ],
      },
      {
        middleware: [customerMiddleware],
        children: [
          { path: "checkout/:eventId", element: <CheckoutPage /> },
        ],
      },
      {
        path: "dashboard",
        middleware: [organizerMiddleware],
        children: [
          { index: true, element: <DashboardOverview /> },
          { path: "events", element: <DashboardEvents /> },
          { path: "transactions", element: <DashboardTransactions /> },
        ],
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);

export default router;