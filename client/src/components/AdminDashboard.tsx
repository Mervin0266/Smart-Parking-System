/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import christLogo from "../assets/ChristLogo.png";
import Snackbar, { type SnackbarCloseReason } from "@mui/material/Snackbar";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";

// Define the structure of a vehicle object
interface Vehicle {
  id: number;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  licenseNumber?: string; // Added licenseNumber
  ownerType: string;
  // Specific fields (optional based on type)
  registerNumber?: string;
  department?: string;
  employeeId?: string;
  purpose?: string;

  vehicleNumber: string;
  vehicleModel: string;
  vehicleColor: string;
  vehicleType: string;
  entryTime: string;
  exitTime: string | null;
  status: "Inside" | "Exited";
}

const STORAGE_KEY = "christ_admin_vehicles";

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [activeSection, setActiveSection] = useState<
    "vehicles" | "add" | "remove" | "today"
  >("vehicles");
  const [camOpen, setCamOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Form Step State (1 = Owner Details, 2 = Specific & Vehicle Details)
  const [formStep, setFormStep] = useState(1);

  // Snackbar State
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // State for add vehicle form
  const [formData, setFormData] = useState({
    ownerName: "",
    ownerEmail: "",
    ownerPhone: "",
    licenseNumber: "", // Added to state
    ownerType: "", // Default empty to force selection

    // Specific fields
    registerNumber: "",
    department: "",
    employeeId: "",
    purpose: "",

    vehicleNumber: "",
    vehicleModel: "",
    vehicleColor: "",
    vehicleType: "Car",
  });

  const [removePlate, setRemovePlate] = useState("");

  // State for search and filter
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Inside" | "Exited">(
    "All"
  );

  // Add this function near the top of the component, after state declarations
  const fetchAllVehicles = async () => {
    try {
      const [studentsRes, facultyRes, visitorsRes] = await Promise.all([
        fetch("http://localhost:5000/api/students"),
        fetch("http://localhost:5000/api/faculty"),
        fetch("http://localhost:5000/api/visitors"),
      ]);

      const students = await studentsRes.json();
      const faculty = await facultyRes.json();
      const visitors = await visitorsRes.json();

      // Transform database records to Vehicle format
      const allVehicles: Vehicle[] = [
        ...students.map((s: any) => ({
          id: s.Register_Number,
          ownerName: s.Name,
          ownerEmail: s.Email || "",
          ownerPhone: s.Phone_Number || "",
          licenseNumber: s.License_Number || "",
          ownerType: "student",
          registerNumber: s.Register_Number.toString(),
          department: s.Department || "",
          vehicleNumber: s.License_Number || "N/A",
          vehicleModel: "N/A",
          vehicleColor: "N/A",
          vehicleType: "Car",
          entryTime: new Date().toISOString(),
          exitTime: null,
          status: "Inside" as const,
        })),
        ...faculty.map((f: any) => ({
          id: f.Register_Number,
          ownerName: f.Name,
          ownerEmail: f.Email,
          ownerPhone: f.Phone_Number,
          licenseNumber: f.License_Number || "",
          ownerType: "faculty",
          employeeId: f.Register_Number.toString(),
          department: f.Department || "",
          vehicleNumber: f.License_Number || "N/A",
          vehicleModel: "N/A",
          vehicleColor: "N/A",
          vehicleType: f.Category_ || "Car",
          entryTime: new Date().toISOString(),
          exitTime: null,
          status: "Inside" as const,
        })),
        ...visitors.map((v: any) => ({
          id: Date.now() + Math.random(),
          ownerName: v.Name,
          ownerEmail: v.Email || "",
          ownerPhone: v.Phone_Number,
          licenseNumber: "",
          ownerType: "visitor",
          purpose: v.Purpose || "",
          vehicleNumber: "Visitor",
          vehicleModel: "N/A",
          vehicleColor: "N/A",
          vehicleType: "Car",
          entryTime: new Date().toISOString(),
          exitTime: null,
          status: "Inside" as const,
        })),
      ];

      setVehicles(allVehicles);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allVehicles));
    } catch (error) {
      console.error("Failed to fetch vehicles from database:", error);
      // Fallback to localStorage
      const storedVehicles = localStorage.getItem(STORAGE_KEY);
      if (storedVehicles) {
        setVehicles(JSON.parse(storedVehicles));
      }
    }
  };

  // Replace the existing useEffect with this:
  useEffect(() => {
    fetchAllVehicles();
  }, []);

  // Effect for the live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Handlers
  const handleBack = () => navigate("/admin-login");
  const handleRefresh = () => {
    fetchAllVehicles();
    showSnackbar("Data refreshed from database");
  };
  const openCamModal = () => setCamOpen(true);
  const closeCamModal = () => setCamOpen(false);
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  // Snackbar Handlers
  const handleCloseSnackbar = (
    _event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarOpen(true);
  };

  const snackbarAction = (
    <React.Fragment>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleCloseSnackbar}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Form Navigation Handlers
  const handleNextStep = () => {
    // Validate Step 1
    if (
      !formData.ownerName ||
      !formData.ownerEmail ||
      !formData.ownerPhone ||
      !formData.ownerType
    ) {
      showSnackbar("Please fill in all owner details and select a type.");
      return;
    }
    setFormStep(2);
  };

  const handlePrevStep = () => {
    setFormStep(1);
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate Specific Fields based on Owner Type
    if (formData.ownerType === "student") {
      if (
        !formData.registerNumber ||
        !formData.department ||
        !formData.licenseNumber
      ) {
        showSnackbar(
          "Please fill in Register Number, License Number, and Department."
        );
        return;
      }
    } else if (formData.ownerType === "faculty") {
      if (
        !formData.employeeId ||
        !formData.department ||
        !formData.licenseNumber
      ) {
        showSnackbar(
          "Please fill in Employee ID, License Number, and Department."
        );
        return;
      }
    } else if (formData.ownerType === "visitor") {
      if (!formData.purpose) {
        showSnackbar("Please specify the Purpose of Visit.");
        return;
      }
    }

    // Validate Vehicle Details
    if (
      !formData.vehicleNumber ||
      !formData.vehicleModel ||
      !formData.vehicleColor
    ) {
      showSnackbar("Please fill in all vehicle details.");
      return;
    }

    // Check if vehicle number already exists
    if (
      vehicles.some(
        (v) =>
          v.vehicleNumber.toLowerCase() === formData.vehicleNumber.toLowerCase()
      )
    ) {
      showSnackbar("A vehicle with this number is already registered.");
      return;
    }

    try {
      // Determine which API endpoint to call based on ownerType
      let apiEndpoint = "";
      let requestBody: any = {};

      if (formData.ownerType === "student") {
        apiEndpoint = "http://localhost:5000/api/students";
        requestBody = {
          register_number: parseInt(formData.registerNumber),
          name: formData.ownerName,
          email: formData.ownerEmail.toLowerCase(),
          phone: formData.ownerPhone,
          department: formData.department,
          license_number: formData.licenseNumber,
        };
      } else if (formData.ownerType === "faculty") {
        apiEndpoint = "http://localhost:5000/api/faculty";
        requestBody = {
          faculty_id: parseInt(formData.employeeId),
          name: formData.ownerName,
          email: formData.ownerEmail.toLowerCase(),
          phone: formData.ownerPhone,
          department: formData.department,
          license_number: formData.licenseNumber,
        };
      } else if (formData.ownerType === "visitor") {
        apiEndpoint = "http://localhost:5000/api/visitors";
        requestBody = {
          name: formData.ownerName,
          phone: formData.ownerPhone,
          purpose: formData.purpose,
          vehicle_number: formData.vehicleNumber.toUpperCase(),
        };
      }

      // Send data to backend
      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("Failed to add to database");
      }

      const result = await response.json();
      console.log("Database response:", result);

      // Also keep in localStorage for UI
      const newVehicle: Vehicle = {
        id: Date.now(),
        ownerName: formData.ownerName,
        ownerEmail: formData.ownerEmail.toLowerCase(),
        ownerPhone: formData.ownerPhone,
        licenseNumber: formData.licenseNumber,
        ownerType: formData.ownerType,

        ...(formData.ownerType === "student" && {
          registerNumber: formData.registerNumber,
          department: formData.department,
        }),
        ...(formData.ownerType === "faculty" && {
          employeeId: formData.employeeId,
          department: formData.department,
        }),
        ...(formData.ownerType === "visitor" && {
          purpose: formData.purpose,
        }),

        vehicleNumber: formData.vehicleNumber.toUpperCase(),
        vehicleModel: formData.vehicleModel,
        vehicleColor: formData.vehicleColor,
        vehicleType: formData.vehicleType,
        entryTime: new Date().toISOString(),
        exitTime: null,
        status: "Inside",
      };

      const updatedVehicles = [...vehicles, newVehicle];
      setVehicles(updatedVehicles);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedVehicles));

      // Reset form
      setFormData({
        ownerName: "",
        ownerEmail: "",
        ownerPhone: "",
        licenseNumber: "",
        ownerType: "",
        registerNumber: "",
        department: "",
        employeeId: "",
        purpose: "",
        vehicleNumber: "",
        vehicleModel: "",
        vehicleColor: "",
        vehicleType: "Car",
      });

      setFormStep(1);
      setShowAddModal(false);
      showSnackbar("Vehicle added successfully to database!");
      setActiveSection("vehicles");
    } catch (error) {
      console.error("Error adding vehicle:", error);
      showSnackbar("Failed to add vehicle to database. Please try again.");
    }
  };

  const handleRemoveVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    const vehicleToRemove = vehicles.find(
      (v) =>
        v.vehicleNumber === removePlate.toUpperCase() && v.status === "Inside"
    );
    if (!vehicleToRemove) {
      showSnackbar("Vehicle not found or has already exited.");
      return;
    }
    const updatedVehicles = vehicles.map((v) =>
      v.id === vehicleToRemove.id
        ? ({
            ...v,
            exitTime: new Date().toISOString(),
            status: "Exited",
          } as Vehicle)
        : v
    );
    setVehicles(updatedVehicles);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedVehicles));
    setRemovePlate("");
    showSnackbar("Vehicle marked as exited.");
    setActiveSection("vehicles");
  };

  const handleMarkExit = (id: number) => {
    const updatedVehicles = vehicles.map((v) =>
      v.id === id
        ? ({
            ...v,
            exitTime: new Date().toISOString(),
            status: "Exited",
          } as Vehicle)
        : v
    );
    setVehicles(updatedVehicles);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedVehicles));
    showSnackbar("Vehicle marked as exited.");
  };

  // Filtering logic
  const filteredVehicles = vehicles
    .filter((v) => statusFilter === "All" || v.status === statusFilter)
    .filter(
      (v) =>
        v.ownerName.toLowerCase().includes(search.toLowerCase()) ||
        v.vehicleNumber.toLowerCase().includes(search.toLowerCase()) ||
        v.vehicleModel?.toLowerCase().includes(search.toLowerCase())
    );

  const todayVehicles = vehicles.filter((v) => {
    const entryDate = new Date(v.entryTime).toLocaleDateString();
    const todayDate = new Date().toLocaleDateString();
    return entryDate === todayDate;
  });

  // KPI calculations
  const totalSlots = 500;
  const occupiedSlots = vehicles.filter((v) => v.status === "Inside").length;
  const availableSlots = totalSlots - occupiedSlots;
  const entriesToday = todayVehicles.length;

  const renderSection = () => {
    switch (activeSection) {
      case "add":
        return (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-slate-700">
                Add New Vehicle
              </h3>
              <button
                onClick={() => {
                  setFormStep(1);
                  setShowAddModal(true);
                }}
                className="bg-[#0A4C87] text-white px-6 py-2.5 rounded-md hover:bg-[#083a5e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0A4C87] font-semibold"
              >
                + Add Vehicle
              </button>
            </div>
            <p className="text-slate-600">
              Click the "Add Vehicle" button to register a new vehicle with
              complete owner and vehicle details.
            </p>
          </div>
        );
      case "remove":
        return (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold text-slate-700 mb-4">
              Mark Vehicle as Exited
            </h3>
            <form onSubmit={handleRemoveVehicle}>
              <div className="mb-4">
                <label
                  htmlFor="removeVehicleNumber"
                  className="block text-sm font-medium text-slate-600 mb-1"
                >
                  Vehicle Number
                </label>
                <input
                  type="text"
                  id="removeVehicleNumber"
                  value={removePlate}
                  onChange={(e) => setRemovePlate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-[#0A4C87] text-white py-2 px-4 rounded-md hover:bg-[#083a5e] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0A4C87]"
              >
                Mark Exit
              </button>
            </form>
          </div>
        );
      case "today":
        return (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold text-slate-700 mb-4">
              Vehicles Entered Today
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-500">
                <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      Owner Name
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Vehicle No.
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Model
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Entry Time
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {todayVehicles.map((v) => (
                    <tr
                      key={v.id}
                      className="bg-white border-b hover:bg-slate-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        {v.ownerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap capitalize">
                        {v.ownerType || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {v.vehicleNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {v.vehicleModel || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(v.entryTime).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            v.status === "Inside"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
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
          </div>
        );
      default:
        return (
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
              <input
                type="text"
                placeholder="Search by Owner, Vehicle No., or Model"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full md:w-1/3 px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <div className="flex items-center gap-2 w-full md:w-auto">
                <label className="text-sm font-medium text-slate-600 whitespace-nowrap">
                  Status:
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full md:w-auto px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="All">All</option>
                  <option value="Inside">Inside</option>
                  <option value="Exited">Exited</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-500">
                <thead className="text-xs text-slate-700 uppercase bg-slate-100">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      Owner Name
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Vehicle No.
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Model
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Entry Time
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Exit Time
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredVehicles.map((v) => (
                    <tr
                      key={v.id}
                      className="bg-white border-b hover:bg-slate-50"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        {v.ownerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap capitalize">
                        {v.ownerType || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {v.vehicleNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {v.vehicleModel || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(v.entryTime).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {v.exitTime
                          ? new Date(v.exitTime).toLocaleString()
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            v.status === "Inside"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {v.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {v.status === "Inside" && (
                          <button
                            onClick={() => handleMarkExit(v.id)}
                            className="font-medium text-indigo-600 hover:underline"
                          >
                            Mark Exit
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
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
        <NavLink sectionName="vehicles">Vehicle Details</NavLink>
        <NavLink sectionName="add">Add Vehicle</NavLink>
        <NavLink sectionName="remove">Remove Vehicle</NavLink>
        <NavLink sectionName="today">Entered Today</NavLink>
      </ul>
    </>
  );

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
                onClick={openCamModal}
                className="text-sm font-medium text-slate-600 hover:text-indigo-600"
              >
                Live Cam
              </button>
              <button
                onClick={handleRefresh}
                className="text-sm font-medium text-slate-600 hover:text-indigo-600 hidden sm:block"
              >
                Export
              </button>
              <button
                onClick={handleRefresh}
                className="text-sm font-medium text-slate-600 hover:text-indigo-600 hidden sm:block"
              >
                Sync
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

      {/* Main Content Area with Sidebar */}
      <div className="flex">
        {/* Mobile Sidebar Drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="fixed inset-y-0 left-0 w-64 bg-white shadow-2xl p-4 z-50 transform transition-transform duration-300">
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <div className="flex items-center gap-2">
                  <img src={christLogo} className="h-6 w-auto" alt="Logo" />
                  <span className="font-semibold text-slate-700">Menu</span>
                </div>
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
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-sm cursor-pointer transition-transform duration-300 hover:scale-105 hover:shadow-lg">
              <h4 className="text-sm font-medium text-slate-500 uppercase">
                Total Slots
              </h4>
              <p className="mt-1 text-3xl font-semibold text-slate-800">
                {totalSlots}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm cursor-pointer transition-transform duration-300 hover:scale-105 hover:shadow-lg">
              <h4 className="text-sm font-medium text-slate-500 uppercase">
                Occupied Slots
              </h4>
              <p className="mt-1 text-3xl font-semibold text-slate-800">
                {occupiedSlots}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm cursor-pointer transition-transform duration-300 hover:scale-105 hover:shadow-lg">
              <h4 className="text-sm font-medium text-slate-500 uppercase">
                Available Slots
              </h4>
              <p className="mt-1 text-3xl font-semibold text-green-600">
                {availableSlots}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm cursor-pointer transition-transform duration-300 hover:scale-105 hover:shadow-lg">
              <h4 className="text-sm font-medium text-slate-500 uppercase">
                Entries Today
              </h4>
              <p className="mt-1 text-3xl font-semibold text-slate-800">
                {entriesToday}
              </p>
            </div>
          </div>

          {/* Dynamic Section */}
          {renderSection()}
        </main>
      </div>

      {/* Add Vehicle Modal (Multi-step) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="text-xl font-bold text-[#003366]">
                {formStep === 1
                  ? "Step 1: Owner Details"
                  : "Step 2: Specific & Vehicle Details"}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
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

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
              <div
                className="bg-[#0A4C87] h-2.5 rounded-full transition-all duration-300 ease-in-out"
                style={{ width: formStep === 1 ? "50%" : "100%" }}
              ></div>
            </div>

            <form onSubmit={handleAddVehicle} className="space-y-4">
              {/* Step 1: Owner Details */}
              {formStep === 1 && (
                <div className="bg-slate-50 p-4 rounded-lg animate-fadeIn">
                  <h4 className="text-sm font-semibold text-[#003366] mb-3">
                    Owner Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Owner Name *
                      </label>
                      <input
                        type="text"
                        name="ownerName"
                        value={formData.ownerName}
                        onChange={handleInputChange}
                        placeholder="Enter full name"
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0A4C87] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="ownerEmail"
                        value={formData.ownerEmail}
                        onChange={handleInputChange}
                        placeholder="Enter email"
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0A4C87] focus:border-transparent"
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
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0A4C87] focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Owner Type *
                      </label>
                      <select
                        name="ownerType"
                        value={formData.ownerType}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0A4C87] focus:border-transparent"
                      >
                        <option value="" disabled>
                          Select Type
                        </option>
                        <option value="student">Student</option>
                        <option value="faculty">Faculty</option>
                        <option value="visitor">Visitor</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Specific & Vehicle Details */}
              {formStep === 2 && (
                <div className="space-y-4 animate-fadeIn">
                  {/* Dynamic Section based on Owner Type */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <h4 className="text-sm font-semibold text-[#003366] mb-3 capitalize">
                      {formData.ownerType} Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {formData.ownerType === "student" && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Register Number *
                            </label>
                            <input
                              type="text"
                              name="registerNumber"
                              value={formData.registerNumber}
                              onChange={handleInputChange}
                              placeholder="e.g., 2347115"
                              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0A4C87] focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              License Number *
                            </label>
                            <input
                              type="text"
                              name="licenseNumber"
                              value={formData.licenseNumber}
                              onChange={handleInputChange}
                              placeholder="Enter license number"
                              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0A4C87] focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Department/Class *
                            </label>
                            <input
                              type="text"
                              name="department"
                              value={formData.department}
                              onChange={handleInputChange}
                              placeholder="e.g., MCA"
                              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0A4C87] focus:border-transparent"
                            />
                          </div>
                        </>
                      )}

                      {formData.ownerType === "faculty" && (
                        <>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Employee ID *
                            </label>
                            <input
                              type="text"
                              name="employeeId"
                              value={formData.employeeId}
                              onChange={handleInputChange}
                              placeholder="e.g., EMP101"
                              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0A4C87] focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              License Number *
                            </label>
                            <input
                              type="text"
                              name="licenseNumber"
                              value={formData.licenseNumber}
                              onChange={handleInputChange}
                              placeholder="Enter license number"
                              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0A4C87] focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                              Department *
                            </label>
                            <input
                              type="text"
                              name="department"
                              value={formData.department}
                              onChange={handleInputChange}
                              placeholder="e.g., Computer Science"
                              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0A4C87] focus:border-transparent"
                            />
                          </div>
                        </>
                      )}

                      {formData.ownerType === "visitor" && (
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-slate-700 mb-1">
                            Purpose of Visit *
                          </label>
                          <input
                            type="text"
                            name="purpose"
                            value={formData.purpose}
                            onChange={handleInputChange}
                            placeholder="e.g., Meeting with Principal"
                            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0A4C87] focus:border-transparent"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Common Vehicle Details Section */}
                  <div className="bg-slate-50 p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-[#003366] mb-3">
                      Vehicle Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Vehicle Number *
                        </label>
                        <input
                          type="text"
                          name="vehicleNumber"
                          value={formData.vehicleNumber}
                          onChange={handleInputChange}
                          placeholder="e.g., KA01AB1234"
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0A4C87] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Vehicle Model *
                        </label>
                        <input
                          type="text"
                          name="vehicleModel"
                          value={formData.vehicleModel}
                          onChange={handleInputChange}
                          placeholder="e.g., Honda City"
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0A4C87] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Vehicle Color *
                        </label>
                        <input
                          type="text"
                          name="vehicleColor"
                          value={formData.vehicleColor}
                          onChange={handleInputChange}
                          placeholder="e.g., Silver"
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0A4C87] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Vehicle Type *
                        </label>
                        <select
                          name="vehicleType"
                          value={formData.vehicleType}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0A4C87] focus:border-transparent"
                        >
                          <option value="Car">Car</option>
                          <option value="Bike">Bike</option>
                          <option value="Scooter">Scooter</option>
                          <option value="SUV">SUV</option>
                          <option value="Van">Van</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-3 pt-4">
                {formStep === 1 ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 bg-slate-200 text-slate-700 py-2.5 px-4 rounded-lg font-semibold hover:bg-slate-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="flex-1 bg-[#0A4C87] text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-[#083a5e] transition-colors"
                    >
                      Next
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="flex-1 bg-slate-200 text-slate-700 py-2.5 px-4 rounded-lg font-semibold hover:bg-slate-300 transition-colors"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-[#0A4C87] text-white py-2.5 px-4 rounded-lg font-semibold hover:bg-[#083a5e] transition-colors"
                    >
                      Register Vehicle
                    </button>
                  </>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Cam Modal */}
      {camOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div className="bg-white rounded-lg shadow-xl p-4 w-full max-w-2xl">
            <div className="flex justify-between items-center border-b pb-2 mb-4">
              <h3 className="text-lg font-semibold text-slate-700">
                Live Camera Feed
              </h3>
              <button
                onClick={closeCamModal}
                className="p-2 rounded-full hover:bg-slate-200"
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
            <div className="bg-black aspect-video flex items-center justify-center">
              <p className="text-white">Live feed placeholder</p>
            </div>
          </div>
        </div>
      )}

      {/* Snackbar Component */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={5000}
        onClose={handleCloseSnackbar}
        message={snackbarMessage}
        action={snackbarAction}
      />
    </div>
  );
};

export default AdminDashboard;
