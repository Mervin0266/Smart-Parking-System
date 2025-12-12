import React from "react";

const FooterSection: React.FC = () => {
  return (
    <footer className="border-t border-zinc-300 bg-linear-to-b from-[#74543D] to-[#5d4431]">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* University Contact Information */}
          <div className="space-y-4 text-white">
            <div className="mb-6">
              <h3 className="text-2xl font-bold tracking-wide">CHRIST</h3>
              <h4 className="text-xl font-semibold text-white">
                (Deemed to be University)
              </h4>
            </div>
            <div className="space-y-2 text-sm leading-relaxed text-zinc-200">
              <p className="flex items-start gap-2">
                <span className="font-semibold">Address:</span>
                <span>
                  Dharmaram College Post, Hosur Road, Bengaluru - 560029,
                  Karnataka, India
                </span>
              </p>
              <p>
                <span className="font-semibold">Tel:</span> +91 80 4012 9100 /
                9600
              </p>
              <p>
                <span className="font-semibold">Fax:</span> +91 80 4012 9000
              </p>
              <p>
                <span className="font-semibold">Email:</span>{" "}
                <a
                  href="mailto:mail@christuniversity.in"
                  className="text-zinc-200 hover:text-zinc-400 transition-colors underline"
                >
                  mail@christuniversity.in
                </a>
              </p>
              <p>
                <span className="font-semibold">Web:</span>{" "}
                <a
                  href="https://www.christuniversity.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-200 hover:text-zinc-400 transition-colors underline"
                >
                  www.christuniversity.in
                </a>
              </p>
            </div>
          </div>

          {/* Vision & Mission */}
          <div className="space-y-6 text-white">
            <div>
              <h3 className="mb-2 text-xl font-bold text-zinc-200">Vision</h3>
              <p className="text-sm leading-relaxed text-zinc-200">
                EXCELLENCE AND SERVICE
              </p>
            </div>
            <div>
              <h3 className="mb-2 text-xl font-bold text-zinc-200">Mission</h3>
              <p className="text-sm leading-relaxed text-zinc-200">
                CHRIST (Deemed to be University) is a nurturing ground for an
                individual's holistic development to make effective contribution
                to the society in a dynamic environment.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#5d4431] bg-[#886E53] font-semibold text-center py-4">
        <div className="mx-auto justify-between gap-4 px-2 sm:px-4 lg:px-6">
          <p className="text-md text-zinc-200">
            Copyright © CHRIST (Deemed to be University) {new Date().getFullYear()}. All rights reserved.
          </p>
          
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
