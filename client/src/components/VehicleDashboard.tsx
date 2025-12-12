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

const saveVehicles = (vehicles: Vehicle[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicles));
};

const VehicleDashboard = () => {
  const [email, setEmail] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [statusText, setStatusText] = useState("Checking your account...");
  const [clock, setClock] = useState("");
  const [showModal, setShowModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    ownerName: "",
    ownerPhone: "",
    plate: "",
    model: "",
    color: "",
    type: "Car",
  });

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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.ownerName ||
      !formData.ownerPhone ||
      !formData.plate ||
      !formData.model ||
      !formData.color
    ) {
      alert("Please fill in all fields.");
      return;
    }

    const allVehicles = loadVehicles();

    // Check if vehicle number already exists
    if (
      allVehicles.some(
        (v) => v.plate.toLowerCase() === formData.plate.toLowerCase()
      )
    ) {
      alert("A vehicle with this number is already registered.");
      return;
    }

    const newVehicle: Vehicle = {
      ownerEmail: email || "",
      ownerName: formData.ownerName,
      ownerPhone: formData.ownerPhone,
      plate: formData.plate.toUpperCase(),
      model: formData.model,
      color: formData.color,
      type: formData.type,
      entry: new Date().toLocaleString("en-IN"),
      status: "OUT",
    };

    const updatedVehicles = [...allVehicles, newVehicle];
    saveVehicles(updatedVehicles);

    // Update UI
    setVehicles((prev) => [...prev, newVehicle]);

    // Reset form and close modal
    setFormData({
      ownerName: "",
      ownerPhone: "",
      plate: "",
      model: "",
      color: "",
      type: "Car",
    });
    setShowModal(false);
    alert("Vehicle registered successfully!");
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
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-[#003366]">
              Your Vehicle Details
            </h1>
            <button
              onClick={() => setShowModal(true)}
              className="bg-[#00509E] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#003d7a] transition-colors"
            >
              + Add Vehicle
            </button>
          </div>

          <div className="inline-block bg-[#f1f5ff] border-l-4 border-[#00509E] text-[#003366] px-4 py-3 rounded-xl mb-6 font-medium text-sm sm:text-base">
            <span
              dangerouslySetInnerHTML={{
                __html: email
                  ? statusText.replace(email, `<b>${email}</b>`)
                  : statusText,
              }}
            />
          </div>

          {vehicles.length > 0 && (
            <div className="overflow-auto">
              <table className="w-full border-collapse rounded-xl overflow-hidden shadow-md text-sm">
                <thead>
                  <tr className="bg-[#eaf2ff] text-[#003366]">
                    <th className="px-3 py-2 text-left">Plate</th>
                    <th className="px-3 py-2 text-left">Model</th>
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
                      <td className="px-3 py-2">{v.plate}</td>
                      <td className="px-3 py-2">{v.model}</td>
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

      {/* Add Vehicle Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-xl font-bold text-[#003366]">
                Register New Vehicle
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-full hover:bg-slate-200 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-slate-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Owner Details Section */}
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="text-sm font-semibold text-[#003366] mb-3">
                  Owner Details
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Owner Name *
                    </label>
                    <input
                      type="text"
                      name="ownerName"
                      value={formData.ownerName}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00509E] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="ownerPhone"
                      value={formData.ownerPhone}
                      onChange={handleInputChange}
                      placeholder="Enter phone number"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00509E] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Vehicle Details Section */}
              <div className="bg-slate-50 p-4 rounded-lg">
                <h4 className="text-sm font-semibold text-[#003366] mb-3">
                  Vehicle Details
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Vehicle Number *
                    </label>
                    <input
                      type="text"
                      name="plate"
                      value={formData.plate}
                      onChange={handleInputChange}
                      placeholder="e.g., KA01AB1234"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00509E] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Vehicle Model *
                    </label>
                    <input
                      type="text"
                      name="model"
                      value={formData.model}
                      onChange={handleInputChange}
                      placeholder="e.g., Honda City"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00509E] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Vehicle Color *
                    </label>
                    <input
                      type="text"
                      name="color"
                      value={formData.color}
                      onChange={handleInputChange}
                      placeholder="e.g., Silver"
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00509E] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Vehicle Type *
                    </label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#00509E] focus:border-transparent"
                    >
                      <option value="Car">Car</option>
                      <option value="Bike">Bike</option>
                      <option value="Scooter">Scooter</option>
                      <option value="SUV">SUV</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-slate-200 text-slate-700 py-2.5 px-4 rounded-lg font-semibold hover:bg-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#00509E] text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-[#003d7a] transition-colors"
                >
                  Register Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VehicleDashboard;
