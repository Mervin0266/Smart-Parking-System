import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import gateBg from "../assets/gate.webp";

type VehicleStatus = "IN" | "OUT";

interface Vehicle {
  ownerEmail: string;
  ownerName: string;
  ownerPhone: string;
  plate: string;
  model: string;
  color: string;
  type: string;
  entry: string;
  status: VehicleStatus;
}

const STORAGE_KEY = "christ_admin_vehicles";

const loadVehicles = (): Vehicle[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Vehicle[];
  } catch {
    return [];
  }
};

const VehicleDashboard = () => {
  const [email, setEmail] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [statusText, setStatusText] = useState("Checking your account...");
  const [clock, setClock] = useState("");

  const navigate = useNavigate();

  // Load email and data
  useEffect(() => {
    const storedEmail =
      localStorage.getItem("loggedInEmail")?.toLowerCase() || null;
    setEmail(storedEmail);

    const all = loadVehicles();
    if (storedEmail) {
      const mine = all.filter((v) => v.ownerEmail === storedEmail);
      setVehicles(mine);
      if (mine.length) {
        setStatusText(
          `${storedEmail} has ${mine.length} registered vehicle(s).`
        );
      } else {
        setStatusText(`No vehicles found for ${storedEmail}.`);
      }
    } else {
      setStatusText("No email found. Please log in again.");
    }
  }, []);

  // Live clock
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const opts: Intl.DateTimeFormatOptions = {
        weekday: "short",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      };
      setClock(now.toLocaleString("en-IN", opts));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const handleBack = () => {
    localStorage.removeItem("loggedInEmail");
    navigate("/vehicle-owner-login");
  };

  return (
    <div className="min-h-screen flex flex-col text-slate-900 relative overflow-x-hidden">
      {/* Background */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.35), rgba(255,255,255,0.35)), url(${gateBg})`,
          filter: "brightness(0.95)",
        }}
      />

      {/* Topbar */}
      <div className="relative bg-linear-to-r from-[#003366] to-[#00509E] text-white text-center font-semibold py-2.5 text-xs sm:text-sm tracking-[0.03em]">
        CHRIST (Deemed to be University) | Kengeri Campus | Kanmanike |
        Bangalore - 560074
        <div className="absolute right-4 top-1.5">
          <button
            onClick={handleBack}
            className="border-2 border-white bg-transparent text-white rounded-lg px-3 py-1 text-xs font-semibold hover:bg-white/10 transition-colors"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Center card */}
      <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-5">
        <div className="w-full max-w-3xl bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl px-6 py-7 text-center">
          <h1 className="text-xl sm:text-2xl font-bold text-[#003366] mb-4">
            Your Vehicle Details
          </h1>

          <div className="inline-block bg-[#f1f5ff] border-l-4 border-[#00509E] text-[#003366] px-4 py-3 rounded-xl mb-6 font-medium text-sm sm:text-base">
            <span
              dangerouslySetInnerHTML={{
                __html: email
                  ? statusText.replace(email, `<b>${email}</b>`)
                  : statusText,
              }}
            />
          </div>

          {vehicles.length > 0 ? (
            <div className="overflow-auto">
              <table className="w-full border-collapse rounded-xl overflow-hidden shadow-md text-sm">
                <thead>
                  <tr className="bg-[#eaf2ff] text-[#003366]">
                    <th className="px-3 py-2 text-left">Owner Name</th>
                    <th className="px-3 py-2 text-left">Phone</th>
                    <th className="px-3 py-2 text-left">Plate</th>
                    <th className="px-3 py-2 text-left">Model</th>
                    <th className="px-3 py-2 text-left">Color</th>
                    <th className="px-3 py-2 text-left">Type</th>
                    <th className="px-3 py-2 text-left">Entry Time</th>
                    <th className="px-3 py-2 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((v, idx) => (
                    <tr
                      key={v.plate + v.entry + idx}
                      className="odd:bg-white even:bg-[#f9fbff]"
                    >
                      <td className="px-3 py-2">{v.ownerName}</td>
                      <td className="px-3 py-2">{v.ownerPhone}</td>
                      <td className="px-3 py-2">{v.plate}</td>
                      <td className="px-3 py-2">{v.model}</td>
                      <td className="px-3 py-2">{v.color}</td>
                      <td className="px-3 py-2">{v.type}</td>
                      <td className="px-3 py-2">{v.entry}</td>
                      <td className="px-3 py-2">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                            v.status === "IN"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-rose-100 text-rose-700"
                          }`}
                        >
                          {v.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-slate-500 py-8">
              <p>No vehicles registered yet.</p>
              <p className="text-sm mt-2">
                Contact the admin to register your vehicle.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t-4 border-[#00509E] shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-2 flex items-center justify-between text-xs sm:text-sm font-semibold">
          <span>
            © {new Date().getFullYear()} CHRIST (Deemed to be University) |
            Vehicle Owner Dashboard
          </span>
          <span className="text-[#00509E] font-semibold">{clock}</span>
        </div>
      </footer>
    </div>
  );
};

export default VehicleDashboard;
