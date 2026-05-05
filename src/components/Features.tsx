import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Features() {
  const { t } = useTranslation();
  const features = [
    {
      icon: (
        <svg
          className="w-12 h-12 sm:w-16 sm:h-16"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      ),
      title: t('features.vendorDirectory'),
      desc: t('features.vendorDirectoryDesc'),
      gradient: "from-blue-500 to-cyan-500",
      bgGradient: "from-blue-50 to-cyan-50",
      image:
        "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=400&fit=crop",
    },
    {
      icon: (
        <svg
          className="w-12 h-12 sm:w-16 sm:h-16"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      ),
      title: t('features.securePayments'),
      desc: t('features.securePaymentsDesc'),
      gradient: "from-green-500 to-emerald-500",
      bgGradient: "from-green-50 to-emerald-50",
      image:
        "https://blockchaintechs.io/wp-content/uploads/2025/11/p2p_escrow_banner.webp",
    },
    {
      icon: (
        <svg
          className="w-12 h-12 sm:w-16 sm:h-16"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      title: t('features.vendorDirectory'),
      desc: t('features.vendorDirectoryDesc'),
      gradient: "from-purple-500 to-pink-500",
      bgGradient: "from-purple-50 to-pink-50",
      image:
        "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=400&fit=crop",
    },
    {
      icon: (
        <svg
          className="w-12 h-12 sm:w-16 sm:h-16"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
      ),
      title: t('features.realTimeChat'),
      desc: t('features.realTimeChatDesc'),
      gradient: "from-orange-500 to-red-500",
      bgGradient: "from-orange-50 to-red-50",
      image:
        "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=400&fit=crop",
    },
  ];

  return (
    <section className="py-12 sm:py-16 lg:py-24 bg-gradient-to-b from-white dark:from-gray-900 to-gray-50 dark:to-gray-800 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <div className="inline-block mb-4">
            <span className="bg-accent text-neutral px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-semibold">
              ✨ {t('features.whyChooseUs')}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-primary dark:text-white">
            {t('features.title')}
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto px-4">
            {t('features.subtitle')}
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-12">
          {features.map((f, i) => (
            <div
              key={i}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border border-gray-100 dark:border-gray-700 overflow-hidden"
            >
              {/* Feature Image */}
              <div className="relative h-40 sm:h-48 overflow-hidden bg-gradient-to-br ${f.bgGradient}">
                <img
                  src={f.image}
                  alt={f.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent"></div>
              </div>

              {/* Content */}
              <div className="p-6 sm:p-8">
                <div
                  className={`inline-flex p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br ${f.gradient} text-white mb-4 sm:mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg`}
                >
                  {f.icon}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-800 dark:text-white group-hover:text-gray-900 dark:group-hover:text-gray-100">
                  {f.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                  {f.desc}
                </p>
              </div>
              <div
                className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${f.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}
              ></div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-12 sm:mt-16">
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">{t('features.readyToStart')}</p>
          <Link
            to="/get-started"
            className="inline-block bg-gradient-to-r from-primary to-accent text-white px-10 py-4 rounded-full font-bold text-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
          >
            {t('features.startFreeEvent')}
          </Link>
        </div>
      </div>
    </section>
  );
}
