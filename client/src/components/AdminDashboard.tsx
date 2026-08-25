/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import christLogo from "../assets/ChristLogo.png";
import Snackbar, { type SnackbarCloseReason } from "@mui/material/Snackbar";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

// Types matching database schema
interface Vehicle {
  vehicle_id: number;
  number_plate: string;
  vehicle_type: string;
  owner_type: string;
  owner_id: number | null;
  parking_payment?: ParkingPayment;
  slot_assignment?: SlotAssignment;
}

interface ParkingSlot {
  slot_id: number;
  slot_name: string;
  slot_type: string;
  is_occupied: boolean;
}

interface SlotAssignment {
  assignment_id: number;
  vehicle_id: number;
  slot_id: number;
  parking_slot?: ParkingSlot;
  vehicle?: Vehicle;
}

interface ParkingPayment {
  payment_id: number;
  vehicle_id: number;
  amount: number | null;
  start_date: string;
  end_date: string;
  status: string;
}

interface ParkingLog {
  log_id: number;
  vehicle_id: number;
  slot_id: number;
  entry_time: string;
  exit_time: string | null;
  notes: string | null;
  vehicle?: Vehicle;
  parking_slot?: ParkingSlot;
}

interface DashboardStats {
  totalSlots: number;
  occupiedSlots: number;
  availableSlots: number;
  totalVehicles: number;
  activePayments: number;
  todayEntries: number;
  activeParking: number;
}

interface Student {
  register_number: number;
  name: string;
  email: string;
  phone: string;
  department: string;
  license_number: string;
}

interface Faculty {
  faculty_id: number;
  name: string;
  email: string;
  phone: string;
  department: string;
  license_number: string;
}

interface Visitor {
  vehicle_number: string;
  name: string;
  phone: string;
  purpose: string;
  id_proof: string;
  created_at: string;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mobileOpen, setMobileOpen] = useState(false);

  // Data states
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [parkingLogs, setParkingLogs] = useState<ParkingLog[]>([]);
  const [activeParkings, setActiveParkings] = useState<ParkingLog[]>([]);
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [payments, setPayments] = useState<ParkingPayment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);

  // UI states
  const [activeSection, setActiveSection] = useState<
    | "dashboard"
    | "vehicles"
    | "slots"
    | "payments"
    | "logs"
    | "entry"
    | "exit"
    | "people"
  >("dashboard");
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState<
    "vehicle" | "slot" | "payment" | "entry"
  >("vehicle");

  // Snackbar State
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Form states
  const [vehicleForm, setVehicleForm] = useState({
    number_plate: "",
    vehicle_type: "car",
    owner_type: "student",
    owner_id: "",
    name: "",
    email: "",
    phone: "",
    department: "",
    license_number: "",
    register_number: "", // for students
    faculty_id: "", // for faculty
    purpose: "", // for visitors
    id_proof: "", // for visitors
  });

  const [slotForm, setSlotForm] = useState({
    slot_name: "",
    slot_type: "PAID",
  });

  const [paymentForm, setPaymentForm] = useState({
    vehicle_id: "",
    amount: "",
    start_date: "",
    end_date: "",
  });

  const [entryForm, setEntryForm] = useState({
    number_plate: "",
    slot_id: "",
    notes: "",
  });

  const [exitPlate, setExitPlate] = useState("");

  // Search state
  const [search, setSearch] = useState("");

  // Fetch all data
  const fetchAllData = useCallback(async () => {
    try {
      const [
        statsRes,
        vehiclesRes,
        logsRes,
        activeRes,
        slotsRes,
        paymentsRes,
        studentsRes,
        facultyRes,
        visitorsRes,
      ] = await Promise.all([
        fetch(`${API_BASE}/dashboard/stats`),
        fetch(`${API_BASE}/vehicles`),
        fetch(`${API_BASE}/logs/today`),
        fetch(`${API_BASE}/logs/active`),
        fetch(`${API_BASE}/slots`),
        fetch(`${API_BASE}/payments`),
        fetch(`${API_BASE}/students`),
        fetch(`${API_BASE}/faculty`),
        fetch(`${API_BASE}/visitors`),
      ]);

      setStats(await statsRes.json());
      setVehicles(await vehiclesRes.json());
      setParkingLogs(await logsRes.json());
      setActiveParkings(await activeRes.json());
      setSlots(await slotsRes.json());
      setPayments(await paymentsRes.json());
      setStudents(await studentsRes.json());
      setFaculty(await facultyRes.json());
      setVisitors(await visitorsRes.json());
    } catch {
      console.error("Failed to fetch data");
      showSnackbar("Failed to fetch data from server");
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Handlers
  const handleBack = () => navigate("/admin-login");
  const handleRefresh = () => {
    fetchAllData();
    showSnackbar("Data refreshed");
  };
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  // Snackbar
  const handleCloseSnackbar = (
    _event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === "clickaway") return;
    setSnackbarOpen(false);
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  // Vehicle handlers
  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/vehicles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          number_plate: vehicleForm.number_plate,
          vehicle_type: vehicleForm.vehicle_type,
          owner_type: vehicleForm.owner_type,
          owner_id: vehicleForm.owner_id || null,
          owner_details: {
            name: vehicleForm.name,
            email: vehicleForm.email,
            phone: vehicleForm.phone,
            department: vehicleForm.department,
            license_number: vehicleForm.license_number,
            register_number:
              vehicleForm.owner_type === "student"
                ? vehicleForm.register_number
                : null,
            faculty_id:
              vehicleForm.owner_type === "faculty"
                ? vehicleForm.faculty_id
                : null,
            purpose:
              vehicleForm.owner_type === "visitor" ? vehicleForm.purpose : null,
            id_proof:
              vehicleForm.owner_type === "visitor"
                ? vehicleForm.id_proof
                : null,
          },
        }),
      });

      if (!response.ok) throw new Error("Failed to add vehicle");

      showSnackbar("Vehicle added successfully");
      setShowAddModal(false);
      setVehicleForm({
        number_plate: "",
        vehicle_type: "car",
        owner_type: "student",
        owner_id: "",
        name: "",
        email: "",
        phone: "",
        department: "",
        license_number: "",
        register_number: "",
        faculty_id: "",
        purpose: "",
        id_proof: "",
      });
      fetchAllData();
    } catch {
      showSnackbar("Failed to add vehicle");
    }
  };

  // Slot handlers
  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/slots`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(slotForm),
      });

      if (!response.ok) throw new Error("Failed to add slot");

      showSnackbar("Parking slot added successfully");
      setShowAddModal(false);
      setSlotForm({ slot_name: "", slot_type: "PAID" });
      fetchAllData();
    } catch {
      showSnackbar("Failed to add parking slot");
    }
  };

  // Payment handlers
  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentForm),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      showSnackbar("Payment created successfully");
      setShowAddModal(false);
      setPaymentForm({
        vehicle_id: "",
        amount: "",
        start_date: "",
        end_date: "",
      });
      fetchAllData();
    } catch (error: any) {
      showSnackbar(error.message || "Failed to create payment");
    }
  };

  // Entry handler
  const handleVehicleEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // First get vehicle by plate
      const vehicleRes = await fetch(
        `${API_BASE}/vehicles/plate/${entryForm.number_plate}`
      );
      if (!vehicleRes.ok) throw new Error("Vehicle not found");
      const vehicle = await vehicleRes.json();

      if (!vehicle) throw new Error("Vehicle not found");

      const response = await fetch(`${API_BASE}/logs/entry`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicle_id: vehicle.vehicle_id,
          slot_id: parseInt(entryForm.slot_id),
          notes: entryForm.notes,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      showSnackbar("Vehicle entry recorded successfully");
      setEntryForm({ number_plate: "", slot_id: "", notes: "" });
      fetchAllData();
    } catch (error: any) {
      showSnackbar(error.message || "Failed to record entry");
    }
  };

  // Exit handler
  const handleVehicleExit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/logs/exit/plate/${exitPlate}`, {
        method: "PATCH",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      showSnackbar("Vehicle exit recorded successfully");
      setExitPlate("");
      fetchAllData();
    } catch (error: any) {
      showSnackbar(error.message || "Failed to record exit");
    }
  };

  // Mark exit from log
  const handleMarkExit = async (logId: number) => {
    try {
      const response = await fetch(`${API_BASE}/logs/exit/${logId}`, {
        method: "PATCH",
      });

      if (!response.ok) throw new Error("Failed to record exit");

      showSnackbar("Vehicle exit recorded");
      fetchAllData();
    } catch {
      showSnackbar("Failed to record exit");
    }
  };

  // Update payment status
  const handleUpdatePaymentStatus = async (
    paymentId: number,
    status: string
  ) => {
    try {
      const response = await fetch(`${API_BASE}/payments/${paymentId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error("Failed to update payment");

      showSnackbar("Payment status updated");
      fetchAllData();
    } catch {
      showSnackbar("Failed to update payment status");
    }
  };

  // Filter vehicles by search
  const filteredVehicles = vehicles.filter(
    (v) =>
      v.number_plate.toLowerCase().includes(search.toLowerCase()) ||
      v.owner_type.toLowerCase().includes(search.toLowerCase())
  );

  // Get owner name
  const getOwnerName = (vehicle: Vehicle) => {
    if (vehicle.owner_type === "student") {
      const student = students.find(
        (s) => s.register_number === vehicle.owner_id
      );
      return student?.name || "Unknown";
    } else if (vehicle.owner_type === "faculty") {
      const fac = faculty.find((f) => f.faculty_id === vehicle.owner_id);
      return fac?.name || "Unknown";
    } else {
      const visitor = visitors.find(
        (v) => v.vehicle_number === vehicle.number_plate
      );
      return visitor?.name || "Visitor";
    }
  };

  // Render sections
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h4 className="text-sm font-medium text-slate-500 uppercase">
            Total Slots
          </h4>
          <p className="mt-1 text-3xl font-semibold text-slate-800">
            {stats?.totalSlots || 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h4 className="text-sm font-medium text-slate-500 uppercase">
            Occupied Slots
          </h4>
          <p className="mt-1 text-3xl font-semibold text-red-600">
            {stats?.occupiedSlots || 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h4 className="text-sm font-medium text-slate-500 uppercase">
            Available Slots
          </h4>
          <p className="mt-1 text-3xl font-semibold text-green-600">
            {stats?.availableSlots || 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h4 className="text-sm font-medium text-slate-500 uppercase">
            Today's Entries
          </h4>
          <p className="mt-1 text-3xl font-semibold text-slate-800">
            {stats?.todayEntries || 0}
          </p>
        </div>
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h4 className="text-sm font-medium text-slate-500 uppercase">
            Total Vehicles
          </h4>
          <p className="mt-1 text-3xl font-semibold text-slate-800">
            {stats?.totalVehicles || 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h4 className="text-sm font-medium text-slate-500 uppercase">
            Active Payments
          </h4>
          <p className="mt-1 text-3xl font-semibold text-blue-600">
            {stats?.activePayments || 0}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h4 className="text-sm font-medium text-slate-500 uppercase">
            Currently Parked
          </h4>
          <p className="mt-1 text-3xl font-semibold text-amber-600">
            {stats?.activeParking || 0}
          </p>
        </div>
      </div>

      {/* Active Parkings */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-slate-700 mb-4">
          Currently Parked Vehicles
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-slate-700 uppercase bg-slate-100">
              <tr>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Slot</th>
                <th className="px-4 py-3">Entry Time</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {activeParkings.map((log) => (
                <tr
                  key={log.log_id}
                  className="bg-white border-b hover:bg-slate-50"
                >
                  <td className="px-4 py-3 font-medium">
                    {log.vehicle?.number_plate}
                  </td>
                  <td className="px-4 py-3 capitalize">
                    {log.vehicle?.vehicle_type}
                  </td>
                  <td className="px-4 py-3 capitalize">
                    {log.vehicle?.owner_type}
                  </td>
                  <td className="px-4 py-3">{log.parking_slot?.slot_name}</td>
                  <td className="px-4 py-3">
                    {new Date(log.entry_time).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleMarkExit(log.log_id)}
                      className="text-indigo-600 hover:underline"
                    >
                      Mark Exit
                    </button>
                  </td>
                </tr>
              ))}
              {activeParkings.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-slate-400"
                  >
                    No vehicles currently parked
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderVehicles = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        <h3 className="text-lg font-semibold text-slate-700">All Vehicles</h3>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search vehicles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-2 border border-slate-300 rounded-md"
          />
          <button
            onClick={() => {
              setModalType("vehicle");
              setShowAddModal(true);
            }}
            className="bg-[#0A4C87] text-white px-4 py-2 rounded-md hover:bg-[#083a5e]"
          >
            + Add Vehicle
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-500">
          <thead className="text-xs text-slate-700 uppercase bg-slate-100">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Number Plate</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Owner Type</th>
              <th className="px-4 py-3">Owner Name</th>
              <th className="px-4 py-3">Payment Status</th>
              <th className="px-4 py-3">Assigned Slot</th>
            </tr>
          </thead>
          <tbody>
            {filteredVehicles.map((v) => (
              <tr
                key={v.vehicle_id}
                className="bg-white border-b hover:bg-slate-50"
              >
                <td className="px-4 py-3">{v.vehicle_id}</td>
                <td className="px-4 py-3 font-medium">{v.number_plate}</td>
                <td className="px-4 py-3 capitalize">{v.vehicle_type}</td>
                <td className="px-4 py-3 capitalize">{v.owner_type}</td>
                <td className="px-4 py-3">{getOwnerName(v)}</td>
                <td className="px-4 py-3">
                  {v.owner_type === "visitor" ? (
                    <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
                      N/A
                    </span>
                  ) : v.parking_payment ? (
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        v.parking_payment.status === "active"
                          ? "bg-green-100 text-green-800"
                          : v.parking_payment.status === "expired"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {v.parking_payment.status}
                    </span>
                  ) : (
                    <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                      No Payment
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {v.slot_assignment?.parking_slot?.slot_name || "Not Assigned"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSlots = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-700">Parking Slots</h3>
        <button
          onClick={() => {
            setModalType("slot");
            setShowAddModal(true);
          }}
          className="bg-[#0A4C87] text-white px-4 py-2 rounded-md hover:bg-[#083a5e]"
        >
          + Add Slot
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
        {slots.map((slot) => (
          <div
            key={slot.slot_id}
            className={`p-3 rounded-lg text-center border-2 ${
              slot.is_occupied
                ? "bg-red-50 border-red-300"
                : "bg-green-50 border-green-300"
            }`}
          >
            <div className="font-semibold text-slate-700">{slot.slot_name}</div>
            <div
              className={`text-xs ${
                slot.slot_type === "PAID" ? "text-blue-600" : "text-purple-600"
              }`}
            >
              {slot.slot_type}
            </div>
            <div
              className={`text-xs mt-1 ${
                slot.is_occupied ? "text-red-600" : "text-green-600"
              }`}
            >
              {slot.is_occupied ? "Occupied" : "Available"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPayments = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-slate-700">
          Parking Payments
        </h3>
        <button
          onClick={() => {
            setModalType("payment");
            setShowAddModal(true);
          }}
          className="bg-[#0A4C87] text-white px-4 py-2 rounded-md hover:bg-[#083a5e]"
        >
          + Add Payment
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-500">
          <thead className="text-xs text-slate-700 uppercase bg-slate-100">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Vehicle</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Start Date</th>
              <th className="px-4 py-3">End Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr
                key={p.payment_id}
                className="bg-white border-b hover:bg-slate-50"
              >
                <td className="px-4 py-3">{p.payment_id}</td>
                <td className="px-4 py-3">
                  {vehicles.find((v) => v.vehicle_id === p.vehicle_id)
                    ?.number_plate || p.vehicle_id}
                </td>
                <td className="px-4 py-3">₹{p.amount || 0}</td>
                <td className="px-4 py-3">
                  {new Date(p.start_date).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  {new Date(p.end_date).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      p.status === "active"
                        ? "bg-green-100 text-green-800"
                        : p.status === "expired"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={p.status}
                    onChange={(e) =>
                      handleUpdatePaymentStatus(p.payment_id, e.target.value)
                    }
                    className="text-xs border rounded px-2 py-1"
                  >
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderLogs = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold text-slate-700 mb-4">
        Today's Parking Logs
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-500">
          <thead className="text-xs text-slate-700 uppercase bg-slate-100">
            <tr>
              <th className="px-4 py-3">Log ID</th>
              <th className="px-4 py-3">Vehicle</th>
              <th className="px-4 py-3">Slot</th>
              <th className="px-4 py-3">Entry Time</th>
              <th className="px-4 py-3">Exit Time</th>
              <th className="px-4 py-3">Notes</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {parkingLogs.map((log) => (
              <tr
                key={log.log_id}
                className="bg-white border-b hover:bg-slate-50"
              >
                <td className="px-4 py-3">{log.log_id}</td>
                <td className="px-4 py-3">{log.vehicle?.number_plate}</td>
                <td className="px-4 py-3">{log.parking_slot?.slot_name}</td>
                <td className="px-4 py-3">
                  {new Date(log.entry_time).toLocaleString()}
                </td>
                <td className="px-4 py-3">
                  {log.exit_time
                    ? new Date(log.exit_time).toLocaleString()
                    : "-"}
                </td>
                <td className="px-4 py-3">{log.notes || "-"}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      log.exit_time
                        ? "bg-gray-100 text-gray-600"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {log.exit_time ? "Exited" : "Parked"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderEntry = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm max-w-xl mx-auto">
      <h3 className="text-lg font-semibold text-slate-700 mb-4">
        Vehicle Entry
      </h3>
      <form onSubmit={handleVehicleEntry} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Vehicle Number
          </label>
          <input
            type="text"
            value={entryForm.number_plate}
            onChange={(e) =>
              setEntryForm({
                ...entryForm,
                number_plate: e.target.value.toUpperCase(),
              })
            }
            placeholder="e.g., KA01AB1234"
            className="w-full px-3 py-2 border border-slate-300 rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Select Slot
          </label>
          <select
            value={entryForm.slot_id}
            onChange={(e) =>
              setEntryForm({ ...entryForm, slot_id: e.target.value })
            }
            className="w-full px-3 py-2 border border-slate-300 rounded-md"
            required
          >
            <option value="">Select a slot</option>
            {slots
              .filter((s) => !s.is_occupied)
              .map((slot) => (
                <option key={slot.slot_id} value={slot.slot_id}>
                  {slot.slot_name} ({slot.slot_type})
                </option>
              ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Notes (Optional)
          </label>
          <input
            type="text"
            value={entryForm.notes}
            onChange={(e) =>
              setEntryForm({ ...entryForm, notes: e.target.value })
            }
            placeholder="Any notes..."
            className="w-full px-3 py-2 border border-slate-300 rounded-md"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2.5 rounded-md hover:bg-green-700"
        >
          Record Entry
        </button>
      </form>
    </div>
  );

  const renderExit = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm max-w-xl mx-auto">
      <h3 className="text-lg font-semibold text-slate-700 mb-4">
        Vehicle Exit
      </h3>
      <form onSubmit={handleVehicleExit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Vehicle Number
          </label>
          <input
            type="text"
            value={exitPlate}
            onChange={(e) => setExitPlate(e.target.value.toUpperCase())}
            placeholder="e.g., KA01AB1234"
            className="w-full px-3 py-2 border border-slate-300 rounded-md"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-red-600 text-white py-2.5 rounded-md hover:bg-red-700"
        >
          Record Exit
        </button>
      </form>
    </div>
  );

  const renderPeople = () => (
    <div className="space-y-6">
      {/* Students */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-slate-700 mb-4">
          Students ({students.length})
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-slate-700 uppercase bg-slate-100">
              <tr>
                <th className="px-4 py-3">Reg No.</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Department</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.register_number} className="bg-white border-b">
                  <td className="px-4 py-3">{s.register_number}</td>
                  <td className="px-4 py-3">{s.name}</td>
                  <td className="px-4 py-3">{s.email}</td>
                  <td className="px-4 py-3">{s.phone}</td>
                  <td className="px-4 py-3">{s.department}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Faculty */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-slate-700 mb-4">
          Faculty ({faculty.length})
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-slate-700 uppercase bg-slate-100">
              <tr>
                <th className="px-4 py-3">Faculty ID</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Department</th>
              </tr>
            </thead>
            <tbody>
              {faculty.map((f) => (
                <tr key={f.faculty_id} className="bg-white border-b">
                  <td className="px-4 py-3">{f.faculty_id}</td>
                  <td className="px-4 py-3">{f.name}</td>
                  <td className="px-4 py-3">{f.email}</td>
                  <td className="px-4 py-3">{f.phone}</td>
                  <td className="px-4 py-3">{f.department}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visitors */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-slate-700 mb-4">
          Visitors ({visitors.length})
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-slate-700 uppercase bg-slate-100">
              <tr>
                <th className="px-4 py-3">Vehicle No.</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Purpose</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {visitors.map((v) => (
                <tr key={v.vehicle_number} className="bg-white border-b">
                  <td className="px-4 py-3">{v.vehicle_number}</td>
                  <td className="px-4 py-3">{v.name}</td>
                  <td className="px-4 py-3">{v.phone}</td>
                  <td className="px-4 py-3">{v.purpose}</td>
                  <td className="px-4 py-3">
                    {new Date(v.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case "dashboard":
        return renderDashboard();
      case "vehicles":
        return renderVehicles();
      case "slots":
        return renderSlots();
      case "payments":
        return renderPayments();
      case "logs":
        return renderLogs();
      case "entry":
        return renderEntry();
      case "exit":
        return renderExit();
      case "people":
        return renderPeople();
      default:
        return renderDashboard();
    }
  };

  const NavLink: React.FC<{
    sectionName: string;
    children: React.ReactNode;
  }> = ({ sectionName, children }) => (
    <li>
      <button
        onClick={() => {
          setActiveSection(sectionName as any);
          setMobileOpen(false);
        }}
        className={`flex items-center w-full p-3 text-slate-900 rounded-lg hover:bg-[#0A4C87] hover:text-white group ${
          activeSection === sectionName ? "bg-[#083a5e] text-white" : ""
        }`}
      >
        <span className="ms-3">{children}</span>
      </button>
    </li>
  );

  const SidebarContent = () => (
    <>
      <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
        Navigation
      </h2>
      <ul className="space-y-2 font-medium">
        <NavLink sectionName="dashboard">Dashboard</NavLink>
        <NavLink sectionName="vehicles">Vehicles</NavLink>
        <NavLink sectionName="slots">Parking Slots</NavLink>
        <NavLink sectionName="payments">Payments</NavLink>
        <NavLink sectionName="logs">Parking Logs</NavLink>
        <NavLink sectionName="entry">Vehicle Entry</NavLink>
        <NavLink sectionName="exit">Vehicle Exit</NavLink>
        <NavLink sectionName="people">People</NavLink>
      </ul>
    </>
  );

  // Modals
  const renderModal = () => {
    if (!showAddModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center border-b pb-3 mb-4">
            <h3 className="text-xl font-bold text-[#003366]">
              {modalType === "vehicle" && "Add Vehicle"}
              {modalType === "slot" && "Add Parking Slot"}
              {modalType === "payment" && "Add Payment"}
            </h3>
            <button
              onClick={() => setShowAddModal(false)}
              className="p-2 rounded-full hover:bg-slate-200"
            >
              <CloseIcon />
            </button>
          </div>

          {modalType === "vehicle" && (
            <form onSubmit={handleAddVehicle} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Number Plate *
                </label>
                <input
                  type="text"
                  value={vehicleForm.number_plate}
                  onChange={(e) =>
                    setVehicleForm({
                      ...vehicleForm,
                      number_plate: e.target.value.toUpperCase(),
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Vehicle Type *
                </label>
                <select
                  value={vehicleForm.vehicle_type}
                  onChange={(e) =>
                    setVehicleForm({
                      ...vehicleForm,
                      vehicle_type: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                >
                  <option value="car">Car</option>
                  <option value="bike">Bike</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Owner Type *
                </label>
                <select
                  value={vehicleForm.owner_type}
                  onChange={(e) =>
                    setVehicleForm({
                      ...vehicleForm,
                      owner_type: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                >
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                  <option value="visitor">Visitor</option>
                </select>
              </div>

              {/* Common Fields */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={vehicleForm.name}
                  onChange={(e) =>
                    setVehicleForm({ ...vehicleForm, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={vehicleForm.phone}
                  onChange={(e) =>
                    setVehicleForm({ ...vehicleForm, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  required
                />
              </div>

              {/* Student-specific Fields */}
              {vehicleForm.owner_type === "student" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Register Number *
                    </label>
                    <input
                      type="number"
                      value={vehicleForm.register_number}
                      onChange={(e) =>
                        setVehicleForm({
                          ...vehicleForm,
                          register_number: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={vehicleForm.email}
                      onChange={(e) =>
                        setVehicleForm({
                          ...vehicleForm,
                          email: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Department *
                    </label>
                    <input
                      type="text"
                      value={vehicleForm.department}
                      onChange={(e) =>
                        setVehicleForm({
                          ...vehicleForm,
                          department: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      License Number *
                    </label>
                    <input
                      type="text"
                      value={vehicleForm.license_number}
                      onChange={(e) =>
                        setVehicleForm({
                          ...vehicleForm,
                          license_number: e.target.value.toUpperCase(),
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      required
                    />
                  </div>
                </>
              )}

              {/* Faculty-specific Fields */}
              {vehicleForm.owner_type === "faculty" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Faculty ID *
                    </label>
                    <input
                      type="number"
                      value={vehicleForm.faculty_id}
                      onChange={(e) =>
                        setVehicleForm({
                          ...vehicleForm,
                          faculty_id: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={vehicleForm.email}
                      onChange={(e) =>
                        setVehicleForm({
                          ...vehicleForm,
                          email: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Department *
                    </label>
                    <input
                      type="text"
                      value={vehicleForm.department}
                      onChange={(e) =>
                        setVehicleForm({
                          ...vehicleForm,
                          department: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      License Number *
                    </label>
                    <input
                      type="text"
                      value={vehicleForm.license_number}
                      onChange={(e) =>
                        setVehicleForm({
                          ...vehicleForm,
                          license_number: e.target.value.toUpperCase(),
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      required
                    />
                  </div>
                </>
              )}

              {/* Visitor-specific Fields */}
              {vehicleForm.owner_type === "visitor" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Purpose of Visit *
                    </label>
                    <input
                      type="text"
                      value={vehicleForm.purpose}
                      onChange={(e) =>
                        setVehicleForm({
                          ...vehicleForm,
                          purpose: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      ID Proof Type *
                    </label>
                    <select
                      value={vehicleForm.id_proof}
                      onChange={(e) =>
                        setVehicleForm({
                          ...vehicleForm,
                          id_proof: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-md"
                      required
                    >
                      <option value="">Select ID Proof</option>
                      <option value="Aadhaar">Aadhaar</option>
                      <option value="Driving License">Driving License</option>
                      <option value="PAN Card">PAN Card</option>
                      <option value="Voter ID">Voter ID</option>
                      <option value="Passport">Passport</option>
                    </select>
                  </div>
                </>
              )}

              <button
                type="submit"
                className="w-full bg-[#0A4C87] text-white py-2.5 rounded-md hover:bg-[#083a5e]"
              >
                Add Vehicle
              </button>
            </form>
          )}

          {modalType === "slot" && (
            <form onSubmit={handleAddSlot} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Slot Name *
                </label>
                <input
                  type="text"
                  value={slotForm.slot_name}
                  onChange={(e) =>
                    setSlotForm({ ...slotForm, slot_name: e.target.value })
                  }
                  placeholder="e.g., A-01"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Slot Type
                </label>
                <select
                  value={slotForm.slot_type}
                  onChange={(e) =>
                    setSlotForm({ ...slotForm, slot_type: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                >
                  <option value="PAID">PAID (Student/Faculty)</option>
                  <option value="VISITOR">VISITOR</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full bg-[#0A4C87] text-white py-2.5 rounded-md hover:bg-[#083a5e]"
              >
                Add Slot
              </button>
            </form>
          )}

          {modalType === "payment" && (
            <form onSubmit={handleAddPayment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Select Vehicle *
                </label>
                <select
                  value={paymentForm.vehicle_id}
                  onChange={(e) =>
                    setPaymentForm({
                      ...paymentForm,
                      vehicle_id: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  required
                >
                  <option value="">Select vehicle</option>
                  {vehicles
                    .filter(
                      (v) => v.owner_type !== "visitor" && !v.parking_payment
                    )
                    .map((v) => (
                      <option key={v.vehicle_id} value={v.vehicle_id}>
                        {v.number_plate} ({v.owner_type})
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Amount (₹)
                </label>
                <input
                  type="number"
                  value={paymentForm.amount}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, amount: e.target.value })
                  }
                  placeholder="e.g., 5000"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={paymentForm.start_date}
                  onChange={(e) =>
                    setPaymentForm({
                      ...paymentForm,
                      start_date: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  End Date *
                </label>
                <input
                  type="date"
                  value={paymentForm.end_date}
                  onChange={(e) =>
                    setPaymentForm({ ...paymentForm, end_date: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#0A4C87] text-white py-2.5 rounded-md hover:bg-[#083a5e]"
              >
                Create Payment
              </button>
            </form>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-40">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              {/* Mobile Menu Button */}
              <button
                onClick={handleDrawerToggle}
                className="p-2 rounded-full hover:bg-slate-200 md:hidden mr-2"
              >
                <MenuIcon className="text-slate-600" />
              </button>

              <button
                onClick={handleBack}
                className="p-2 rounded-full hover:bg-slate-200 hidden sm:block"
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
              <div className="shrink-0 ml-2 sm:ml-4">
                <img
                  className="h-8 w-auto"
                  src={christLogo}
                  alt="Christ University"
                />
              </div>
              <span className="ml-2 sm:ml-4 text-lg font-semibold text-slate-700 truncate">
                Admin Dashboard
              </span>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={handleRefresh}
                className="text-sm font-medium text-slate-600 hover:text-indigo-600"
              >
                Refresh
              </button>
              <div className="text-right hidden xs:block">
                <div className="text-sm font-medium text-slate-800">Admin</div>
                <div className="text-xs text-slate-500">
                  {currentTime.toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex">
        {/* Mobile Sidebar */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="fixed inset-y-0 left-0 w-64 bg-white shadow-2xl p-4 z-50">
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <span className="font-semibold text-slate-700">Menu</span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-1 rounded-full hover:bg-slate-100"
                >
                  <CloseIcon className="text-slate-600" />
                </button>
              </div>
              <SidebarContent />
            </aside>
          </div>
        )}

        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 bg-white border-r border-slate-200 p-4 h-screen sticky top-16">
          <SidebarContent />
        </aside>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full">
          {renderSection()}
        </main>
      </div>

      {/* Modals */}
      {renderModal()}

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
        action={
          <IconButton
            size="small"
            color="inherit"
            onClick={handleCloseSnackbar}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
    </div>
  );
};

export default AdminDashboard;
