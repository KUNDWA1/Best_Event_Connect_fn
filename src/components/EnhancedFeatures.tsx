import {
  Smartphone,
  Store,
  CreditCard,
  BarChart3,
  MessageCircle,
  DollarSign,
  QrCode,
  Star,
} from "lucide-react";
import { useTranslation } from "react-i18next";

export default function EnhancedFeatures() {
  const { t } = useTranslation();
  const features = [
    {
      Icon: Smartphone,
      title: t('features.responsiveDesign'),
      desc: t('features.responsiveDesignDesc'),
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      Icon: Store,
      title: t('features.vendorMarketplace'),
      desc: t('features.vendorMarketplaceDesc'),
      gradient: "from-purple-500 to-pink-500",
    },
    {
      Icon: CreditCard,
      title: t('features.securePaymentsAlt'),
      desc: t('features.securePaymentsAltDesc'),
      gradient: "from-green-500 to-emerald-500",
    },
    {
      Icon: BarChart3,
      title: t('features.eventDashboard'),
      desc: t('features.eventDashboardDesc'),
      gradient: "from-orange-500 to-red-500",
    },
    {
      Icon: MessageCircle,
      title: t('features.directMessaging'),
      desc: t('features.directMessagingDesc'),
      gradient: "from-indigo-500 to-purple-500",
    },
    {
      Icon: DollarSign,
      title: t('features.budgetPlanner'),
      desc: t('features.budgetPlannerDesc'),
      gradient: "from-yellow-500 to-orange-500",
    },
    {
      Icon: QrCode,
      title: t('features.qrCheckIn'),
      desc: t('features.qrCheckInDesc'),
      gradient: "from-teal-500 to-cyan-500",
    },
    {
      Icon: Star,
      title: t('features.reviewsRatings'),
      desc: t('features.reviewsRatingsDesc'),
      gradient: "from-pink-500 to-rose-500",
    },
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 dark:from-gray-800 to-white dark:to-gray-900 relative overflow-hidden">
      <div className="absolute top-20 right-0 w-72 h-72 bg-purple-200 dark:bg-purple-900 rounded-full filter blur-3xl opacity-20"></div>
      <div className="absolute bottom-20 left-0 w-72 h-72 bg-blue-200 dark:bg-blue-900 rounded-full filter blur-3xl opacity-20"></div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-block mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold">
              ✨ {t('features.platformTitle')}
            </span>
          </div>
          <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {t('features.title')}
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {t('features.platformSubtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => (
            <div
              key={i}
              className="group relative bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 dark:border-gray-700"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-2xl opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
              ></div>

              <div className="relative z-10">
                <div
                  className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg`}
                >
                  <feature.Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm">
                  {feature.desc}
                </p>
              </div>

              <div
                className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${feature.gradient} rounded-b-2xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500`}
              ></div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <a
            href="/get-started"
            className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-300 shadow-xl"
          >
            {t('features.getStartedToday')} →
          </a>
        </div>
      </div>
    </section>
  );
}
