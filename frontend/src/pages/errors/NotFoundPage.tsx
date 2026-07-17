import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-6 text-center text-white">
      <h1 className="text-9xl font-black text-slate-800">404</h1>
      <p className="mt-4 text-2xl font-bold">Page Not Found</p>
      <Link to="/" className="mt-6 rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
        Go Back Home
      </Link>
    </div>
  );
}