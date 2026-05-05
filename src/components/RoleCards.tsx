import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Check, ArrowRight } from "lucide-react";

export default function RoleCards() {
  const { t } = useTranslation();
  const roles = [
    {
      title: t('roles.eventHosts'),
      desc: t('roles.eventHostsDesc'),
      features: [
        t('roles.createListings'),
        t('roles.browseVendors'),
        t('roles.securePayments'),
        t('roles.realTimeCoordination'),
      ],
      gradient: "from-blue-500 to-blue-700",
      image:
        "https://images.unsplash.com/photo-1519671482677-504be0271101?w=500&h=400&fit=crop",
    },
    {
      title: t('roles.vendor'),
      desc: t('roles.vendorDesc'),
      features: [
        t('roles.createProfiles'),
        t('roles.getBooked'),
        t('roles.guaranteedPayments'),
        t('roles.buildReputation'),
      ],
      gradient: "from-purple-500 to-purple-700",
      image:
        "https://images.unsplash.com/photo-1552664730-d307ca884978?w=500&h=400&fit=crop",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 dark:from-gray-800 to-white dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 dark:text-white">{t('roles.title')}</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            {t('roles.hostingOrProviding')}
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
          {roles.map((role, i) => (
            <div key={i} className="relative group">
              <div
                className={`absolute inset-0 bg-gradient-to-br ${role.gradient} rounded-3xl transform group-hover:scale-105 transition-transform duration-300`}
              ></div>
              <div className="relative bg-white dark:bg-gray-800 m-1 rounded-3xl overflow-hidden">
                {/* Content */}
                <div className="p-8">
                  <h3 className="text-3xl font-bold mb-4 dark:text-white">{role.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">{role.desc}</p>
                  <ul className="space-y-3 mb-8">
                    {role.features.map((f, j) => (
                      <li key={j} className="flex items-center text-gray-700 dark:text-gray-300">
                        <Check className="w-5 h-5 text-green-500 mr-3" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Multiple CTAs */}
                  <div className="space-y-3">
                    <Link
                      to="/get-started"
                      className={`flex items-center justify-center w-full bg-gradient-to-r ${role.gradient} text-white py-4 rounded-xl font-bold text-center hover:shadow-xl transition-all duration-300 gap-2`}
                    >
                      {t('roles.getStartedAs')} {role.title}{" "}
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                    <Link
                      to="/get-started"
                      className="block w-full border-2 border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 py-3 rounded-xl font-semibold text-center hover:border-primary dark:hover:border-primary-soft hover:text-primary dark:hover:text-primary-soft transition-all duration-300"
                    >
                      {t('roles.learnMore')}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional CTA Section */}
        <div className="text-center bg-gradient-to-r from-primary to-accent rounded-3xl p-12 text-white mt-16">
          <h3 className="text-3xl font-bold mb-4">{t('roles.stillDeciding')}</h3>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            {t('roles.joinThousands')}
          </p>
          <Link
            to="/get-started"
            className="inline-block bg-white text-primary px-10 py-4 rounded-full font-bold text-lg hover:scale-105 transition-all duration-300 shadow-xl"
          >
            {t('roles.exploreBoth')}
          </Link>
        </div>
      </div>
    </section>
  );
}
