import {
  // FaClock,
  FaShieldAlt,
  FaMobileAlt,
  // FaMoneyBillWave,
  FaCar,
  // FaMapMarkedAlt,
} from "react-icons/fa";

const ServicesSection = () => {
  const services = [
    // {
    //   icon: <FaClock size={40} />,
    //   title: "24/7 Access",
    //   description:
    //     "Park anytime with our round-the-clock parking facility access",
    //   color: "from-blue-500 to-cyan-500",
    // },
    {
      icon: <FaShieldAlt size={40} />,
      title: "Secure Parking",
      description:
        "CCTV surveillance and security guards ensure your vehicle's safety",
      color: "from-green-500 to-emerald-500",
    },
    {
      icon: <FaMobileAlt size={40} />,
      title: "Mobile Booking",
      description: "Book and manage your parking slots through our mobile app",
      color: "from-purple-500 to-pink-500",
    },
    // {
    //   icon: <FaMoneyBillWave size={40} />,
    //   title: "Flexible Pricing",
    //   description: "Choose from hourly, daily, or monthly parking plans",
    //   color: "from-amber-500 to-orange-500",
    // },
    {
      icon: <FaCar size={40} />,
      title: "All Vehicle Types",
      description: "Dedicated spaces for cars, bikes, scooters, and SUVs",
      color: "from-red-500 to-rose-500",
    },
    // {
    //   icon: <FaMapMarkedAlt size={40} />,
    //   title: "Multiple Locations",
    //   description: "Available across all 38 CHRIST University campuses",
    //   color: "from-indigo-500 to-blue-500",
    // },
  ];

  return (
    <section id="services" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Our <span className="text-[#0C4D8B]">Services</span>
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Comprehensive parking solutions tailored to meet your needs
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, idx) => (
            <div
              key={idx}
              className="group bg-white rounded-2xl p-8 shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
            >
              {/* Icon */}
              <div
                className={`inline-flex p-4 rounded-xl bg-linear-to-br ${service.color} text-white mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500`}
              >
                {service.icon}
              </div>

              {/* Title */}
              <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-[#0C4D8B] transition-colors duration-300">
                {service.title}
              </h3>

              {/* Description */}
              <p className="text-gray-600 leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
