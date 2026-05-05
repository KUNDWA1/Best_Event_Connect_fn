import {
  Target,
  Laptop,
  Book,
  Briefcase,
  Sprout,
  Globe,
  CheckCircle,
  Eye,
} from "lucide-react";
import { useTranslation } from "react-i18next";

export default function About() {
  const { t } = useTranslation();
  return (
    <section className="py-12 sm:py-16 lg:py-24 bg-white dark:bg-gray-900 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-64 sm:w-96 h-64 sm:h-96 bg-blue-100 dark:bg-blue-900 rounded-full filter blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-purple-100 dark:bg-purple-900 rounded-full filter blur-3xl opacity-20 translate-x-1/2 translate-y-1/2"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-12 sm:mb-16 lg:mb-20">
          <div className="inline-block mb-4">
            <span className="bg-accent text-neutral px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-semibold flex items-center gap-2 w-fit">
              <Target className="w-4 h-4" /> {t('about.title')}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-primary dark:text-white">
            {t('about.title')}
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed px-4">
            {t('about.description')}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 sm:gap-8 mb-12 sm:mb-16 lg:mb-20">
          <div className="group relative">
            <div className="absolute inset-0 bg-primary dark:bg-primary-soft rounded-2xl sm:rounded-3xl transform rotate-3 group-hover:rotate-6 transition-transform duration-500"></div>
            <div className="relative bg-white dark:bg-gray-800 p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl shadow-xl">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg">
                <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-gray-800 dark:text-white">
                {t('about.mission')}
              </h3>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                {t('about.missionDesc')}
              </p>
            </div>
          </div>

          <div className="group relative">
            <div className="absolute inset-0 bg-primary-soft rounded-2xl sm:rounded-3xl transform -rotate-3 group-hover:-rotate-6 transition-transform duration-500"></div>
            <div className="relative bg-white dark:bg-gray-800 p-6 sm:p-8 lg:p-10 rounded-2xl sm:rounded-3xl shadow-xl">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary-soft rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg">
                <Eye className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-gray-800 dark:text-white">
                {t('about.vision')}
              </h3>
              <p className="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                {t('about.visionDesc')}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-12 sm:mb-16 lg:mb-20">
          <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-3 sm:mb-4 dark:text-white">
            {t('about.keyObjectives')}
          </h3>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-8 sm:mb-12 text-sm sm:text-base lg:text-lg px-4">
            {t('about.roadmap')}
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                Icon: Target,
                title: t('about.professionaliseServices'),
                desc: t('about.professionaliseServicesDesc'),
              },
              {
                Icon: Laptop,
                title: t('about.digitalPlatform'),
                desc: t('about.digitalPlatformDesc'),
              },
              {
                Icon: Book,
                title: t('about.skillsDevelopment'),
                desc: t('about.skillsDevelopmentDesc'),
              },
              {
                Icon: Briefcase,
                title: t('about.createJobs'),
                desc: t('about.createJobsDesc'),
              },
              {
                Icon: Sprout,
                title: t('about.sustainability'),
                desc: t('about.sustainabilityDesc'),
              },
              {
                Icon: Globe,
                title: t('about.accessibility'),
                desc: t('about.accessibilityDesc'),
              },
            ].map((obj, i) => (
              <div
                key={i}
                className="group relative bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100 dark:border-gray-700"
              >
                <div className="text-4xl lg:text-5xl mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-500">
                  <obj.Icon className="w-10 h-10 sm:w-12 sm:h-12 text-primary dark:text-primary-soft" />
                </div>
                <h4 className="font-bold text-lg sm:text-xl mb-2 sm:mb-3 text-gray-800 dark:text-white">
                  {obj.title}
                </h4>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">{obj.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
