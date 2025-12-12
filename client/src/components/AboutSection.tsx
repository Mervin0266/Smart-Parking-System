import { FaCheckCircle, FaShieldAlt, FaAward } from "react-icons/fa";

const AboutSection = () => {
  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            About <span className="text-[#0C4D8B]">Christ Parking System</span>
          </h2>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Your trusted parking partner at CHRIST University, committed to
            providing safe, convenient, and affordable parking solutions for
            students, staff, and visitors.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image Side */}
          <div className="relative">
            <div className="bg-linear-to-br from-[#0C4D8B] to-[#074a7d] rounded-2xl p-8 text-white">
              <h3 className="text-3xl font-bold mb-6">Why Choose Us?</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <FaCheckCircle
                    className="text-amber-400 mt-1 shrink-0"
                    size={24}
                  />
                  <div>
                    <h4 className="font-semibold text-lg mb-1">
                      Prime Location
                    </h4>
                    <p className="text-white/80">
                      Strategically located across all CHRIST University
                      campuses for easy access
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FaShieldAlt
                    className="text-amber-400 mt-1 shrink-0"
                    size={24}
                  />
                  <div>
                    <h4 className="font-semibold text-lg mb-1">
                      24/7 Security
                    </h4>
                    <p className="text-white/80">
                      Round-the-clock CCTV monitoring and trained security
                      personnel
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FaAward className="text-amber-400 mt-1 shrink-0" size={24} />
                  <div>
                    <h4 className="font-semibold text-lg mb-1">
                      Trusted Service
                    </h4>
                    <p className="text-white/80">
                      Serving the university community with excellence since
                      2020
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Text Side */}
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Our Mission
              </h3>
              <p className="text-gray-600 leading-relaxed">
                To provide seamless, secure, and sustainable parking solutions
                that enhance the daily experience of the CHRIST University
                community. We strive to eliminate parking hassles and contribute
                to a smoother campus life for everyone.
              </p>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Our Vision
              </h3>
              <p className="text-gray-600 leading-relaxed">
                To be the leading smart parking solution provider in educational
                institutions, setting new standards for convenience, safety, and
                environmental responsibility.
              </p>
            </div>

            {/* <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="bg-gray-50 p-6 rounded-xl text-center">
                <p className="text-4xl font-bold text-[#0C4D8B] mb-2">5000+</p>
                <p className="text-gray-600 font-medium">Happy Users</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-xl text-center">
                <p className="text-4xl font-bold text-[#0C4D8B] mb-2">99.9%</p>
                <p className="text-gray-600 font-medium">Uptime</p>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
