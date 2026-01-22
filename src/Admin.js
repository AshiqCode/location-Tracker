import React, { useState, useEffect } from "react";
import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, onValue, remove } from "firebase/database";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import {
  MapPin,
  Trash2,
  Globe,
  Monitor,
  Smartphone,
  X,
  Loader2,
} from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default Leaflet marker icons in React
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// 1. Firebase Config
const firebaseConfig = {
  databaseURL: "https://network-cecda-default-rtdb.firebaseio.com/",
};

if (!getApps().length) {
  initializeApp(firebaseConfig);
}
const db = getDatabase();

// Helper to update map view when coordinates change
function ChangeView({ center }) {
  const map = useMap();
  map.setView(center, 15);
  return null;
}

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isMapOpen, setIsMapOpen] = useState(false);

  useEffect(() => {
    const usersRef = ref(db, "tracked_users");
    return onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const formattedData = Object.entries(data)
          .map(([id, values]) => ({ id, ...values }))
          .reverse();
        setUsers(formattedData);
      } else {
        setUsers([]);
      }
      setLoading(false);
    });
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Permanently delete this record?")) {
      await remove(ref(db, `tracked_users/${id}`));
    }
  };

  const openMap = (lat, lng) => {
    setSelectedLocation({ lat, lng });
    setIsMapOpen(true);
  };

  const getDeviceIcon = (info) => {
    if (!info) return <Globe className="w-4 h-4" />;
    if (info.includes("Android") || info.includes("iPhone"))
      return <Smartphone className="w-4 h-4" />;
    return <Monitor className="w-4 h-4" />;
  };

  const formatDeviceName = (info) => {
    if (!info) return "Unknown";
    if (info.includes("Android")) return "Android";
    if (info.includes("iPhone")) return "iPhone";
    if (info.includes("Windows")) return "PC (Win)";
    if (info.includes("Mac")) return "Mac";
    return "Other";
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 z-20 shadow-sm shrink-0">
        <div className="px-4 h-16 md:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <MapPin size={20} />
            </div>
            <h1 className="font-bold text-lg text-slate-800">Tracking Admin</h1>
          </div>
          <div className="text-xs text-slate-400">
            Status: <span className="text-green-600 font-medium">● Live</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-hidden flex flex-col">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Tracked Users</h2>
            <p className="text-slate-500 text-sm">Real-time location feed.</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium shadow-sm">
            Records:{" "}
            <span className="text-indigo-600 font-bold ml-1">
              {users.length}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 overflow-hidden flex flex-col">
          <div className="overflow-auto flex-1">
            <table className="w-full text-left text-sm text-slate-600 min-w-[700px]">
              <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 sticky top-0 z-10 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Time Detected</th>
                  <th className="px-6 py-4">Coordinates</th>
                  <th className="px-6 py-4">Device</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-20 text-center text-slate-400"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin text-indigo-500" />
                        Connecting to satellite feed...
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-20 text-center text-slate-400 italic"
                    >
                      No records found.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-slate-50 transition group"
                    >
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>{" "}
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {new Date(user.time).toLocaleString([], {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">
                        {user.lat?.toFixed(4)}, {user.lng?.toFixed(4)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-slate-700 font-medium">
                          {getDeviceIcon(user.device_info)}
                          {formatDeviceName(user.device_info)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openMap(user.lat, user.lng)}
                            className="px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-semibold transition border border-indigo-200 flex items-center gap-1"
                          >
                            <Globe size={14} /> Map
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className="p-2 text-red-400 hover:text-red-600 transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Map Modal */}
      {isMapOpen && selectedLocation && (
        <div className="fixed inset-0 bg-slate-900/80 z-50 flex items-center justify-center backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl rounded-xl overflow-hidden">
            <div className="h-14 border-b border-slate-200 flex items-center justify-between px-6 bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <MapPin className="text-indigo-500" size={20} /> Location Viewer
              </h3>
              <button
                onClick={() => setIsMapOpen(false)}
                className="text-slate-400 hover:text-red-500 transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 bg-slate-100 relative z-0">
              <MapContainer
                center={[selectedLocation.lat, selectedLocation.lng]}
                zoom={15}
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker
                  position={[selectedLocation.lat, selectedLocation.lng]}
                />
                <ChangeView
                  center={[selectedLocation.lat, selectedLocation.lng]}
                />
              </MapContainer>
            </div>

            <div className="p-4 border-t border-slate-200 bg-white flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="bg-slate-50 px-3 py-2 rounded border border-slate-100 font-mono text-xs text-slate-600">
                COORDS: {selectedLocation.lat.toFixed(6)},{" "}
                {selectedLocation.lng.toFixed(6)}
              </div>
              <a
                href={`https://www.google.com/maps?q=${selectedLocation.lat},${selectedLocation.lng}`}
                target="_blank"
                rel="noreferrer"
                className="py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition text-center shadow-lg shadow-indigo-100"
              >
                Open in Google Maps
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
