import React from "react";

const FamousCompanies = () => {
  const companies = [
    { name: "Rapido", logo: "https://api.iconify.design/logos/rapido.svg" },
    { name: "SmartCoin", logo: "https://api.iconify.design/logos/bitcoin.svg" },
    { name: "LendingKart", logo: "https://api.iconify.design/logos/stripe.svg" },
    { name: "Apple", logo: "https://api.iconify.design/logos/apple.svg" },
    { name: "Uber", logo: "https://api.iconify.design/logos/uber.svg" },
    { name: "Meesho", logo: "https://api.iconify.design/logos/meesho.svg" },
    { name: "Upstox", logo: "https://api.iconify.design/logos/tradingview.svg" },
    { name: "Flipkart", logo: "https://api.iconify.design/logos/flipkart.svg" },
    { name: "Paytm", logo: "https://api.iconify.design/logos/paytm.svg" },

    // 🔥 New Popular Companies
    { name: "Google", logo: "https://api.iconify.design/logos/google.svg" },
    { name: "Amazon", logo: "https://api.iconify.design/logos/amazon.svg" },
    { name: "Microsoft", logo: "https://api.iconify.design/logos/microsoft.svg" },
    { name: "Zoho", logo: "https://api.iconify.design/logos/zoho.svg" },
    { name: "Infosys", logo: "https://api.iconify.design/logos/infosys.svg" },
    { name: "TCS", logo: "https://api.iconify.design/logos/tata.svg" },
    { name: "Swiggy", logo: "https://api.iconify.design/logos/swiggy.svg" },
    { name: "Zomato", logo: "https://api.iconify.design/logos/zomato.svg" },
  ];

  // Duplicate for smooth infinite scroll
  const scrollingCompanies = [...companies, ...companies];

  return (
    <section className="w-full bg-white py-14 overflow-hidden">
      {/* Heading */}
      <h2 className="text-center text-2xl md:text-3xl font-semibold text-gray-900 mb-12 px-4">
        More than 50k recruiters from leading tech companies are hiring
      </h2>

      {/* Marquee */}
      <div className="relative w-full overflow-hidden group">
        <div className="flex items-center gap-16 animate-marquee w-max">
          {scrollingCompanies.map((company, index) => (
            <div
              key={index}
              className="flex items-center justify-center min-w-[140px]"
            >
              <img
                src={company.logo}
                alt={company.name}
                className="h-8 md:h-10 object-contain transition duration-300"

                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.parentElement.innerHTML = `
                    <span class='text-sm font-semibold text-gray-600'>
                      ${company.name}
                    </span>
                  `;
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Animation CSS */}
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-marquee {
          animation: marquee 25s linear infinite;
        }

        .group:hover .animate-marquee {
          animation-play-state: paused;
        }

        @media (max-width: 768px) {
          .animate-marquee {
            animation-duration: 18s;
          }
        }
      `}</style>
    </section>
  );
};

export default FamousCompanies;