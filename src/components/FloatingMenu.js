import { useState } from "react";
import { Link } from "react-router-dom";

export default function FloatingMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* FAB button */}
      <button
        onClick={() => setOpen(true)}
        className="w-14 h-14 rounded-full bg-indigo-600 text-white text-2xl flex items-center justify-center shadow-lg hover:bg-indigo-700 transition"
      >
        ☰
      </button>

      {/* Modal overlay */}
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg w-96 p-6">
            <h2 className="text-lg font-semibold mb-4">Choose a Page</h2>
            <div className="grid grid-cols-1 gap-3">
              <Link
                to="/"
                className="block px-4 py-2 text-center rounded-lg border hover:bg-gray-100"
                onClick={() => setOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/home"
                className="block px-4 py-2 text-center rounded-lg border hover:bg-gray-100"
                onClick={() => setOpen(false)}
              >
                Home*
              </Link>
              <Link
                to="/profile"
                className="block px-4 py-2 text-center rounded-lg border hover:bg-gray-100"
                onClick={() => setOpen(false)}
              >
                Profile*
              </Link>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="mt-6 w-full px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
