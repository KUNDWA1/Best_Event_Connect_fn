import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Music2, ArrowRight } from "lucide-react";

export default function Hero() {
  const { t } = useTranslation();
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Image on Right Side */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/95 to-transparent dark:from-gray-900 dark:via-gray-900/95 dark:to-transparent z-10"></div>
        <img
          src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1920&h=1080&fit=crop"
          alt="Event Background"
          className="absolute right-0 top-0 h-full w-full lg:w-3/5 object-cover"
        />
        {/* Decorative waveform bars */}
        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-around h-64 opacity-10 px-4 z-20">
          {Array.from({ length: 60 }).map((_, i) => (
            <div
              key={i}
              className="bg-white w-1 rounded-t animate-pulse"
              style={{
                height: `${Math.random() * 100 + 20}%`,
                animationDelay: `${i * 0.05}s`,
                animationDuration: `${Math.random() * 1 + 0.5}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Content Container */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="max-w-2xl">
          {/* Content */}
          <div className="text-white text-left space-y-6 animate-fade-in">
            {/* Badge */}
            <div className="mb-2">
              <span className="inline-flex items-center gap-2 text-white text-sm sm:text-base font-medium">
                <Music2 className="w-5 h-5" />
                {t('hero.tagline')}
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight animate-slide-up">
              {t('hero.mainTitle')}
            </h1>

            {/* Description */}
            <p
              className="text-base sm:text-lg lg:text-xl text-gray-200 leading-relaxed max-w-xl animate-slide-up"
              style={{ animationDelay: "0.2s" }}
            >
              {t('hero.description')}
            </p>

            {/* CTA Button */}
            <div
              className="pt-4 animate-scale-in"
              style={{ animationDelay: "0.4s" }}
            >
              <Link
                to="/get-started"
                className="inline-flex items-center gap-2 bg-accent hover:bg-yellow-500 text-neutral px-8 py-4 rounded-lg font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
              >
                {t('hero.cta')}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {/* Stats - moved below CTA */}
            <div
              className="grid grid-cols-3 gap-4 pt-8 animate-fade-in"
              style={{ animationDelay: "0.6s" }}
            >
              <div className="backdrop-blur-sm bg-white/10 p-4 rounded-lg border border-white/20">
                <div className="text-2xl sm:text-3xl font-bold text-accent">
                  500+
                </div>
                <div className="text-xs sm:text-sm text-gray-300 mt-1">
                  {t('hero.verifiedVendors')}
                </div>
              </div>
              <div className="backdrop-blur-sm bg-white/10 p-4 rounded-lg border border-white/20">
                <div className="text-2xl sm:text-3xl font-bold text-accent">
                  1000+
                </div>
                <div className="text-xs sm:text-sm text-gray-300 mt-1">
                  {t('hero.eventsPlanned')}
                </div>
              </div>
              <div className="backdrop-blur-sm bg-white/10 p-4 rounded-lg border border-white/20">
                <div className="text-2xl sm:text-3xl font-bold text-accent">
                  98%
                </div>
                <div className="text-xs sm:text-sm text-gray-300 mt-1">
                  {t('hero.satisfaction')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce hidden sm:block z-20">
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      </div>
    </section>
  );
}
