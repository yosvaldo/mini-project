import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

export default function NotFoundPage() {
  return (
    <>
      <Helmet>
        <title>404 Page Discovered | Eventura</title>
        <meta name="description" content="The requested route parameters or link destination do not match existing system records." />
      </Helmet>

      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 p-6 text-center text-white">
        <h1 className="text-9xl font-black text-slate-800">404</h1>
        <p className="mt-4 text-2xl font-bold">Page Not Found</p>
        <Link to="/" className="mt-6 rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
          Go Back Home
        </Link>
      </div>
    </>
  );
}