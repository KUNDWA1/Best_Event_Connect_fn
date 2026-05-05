import { useTranslation } from "react-i18next";
import { X, Star, Briefcase, MapPin, CheckCircle, Award } from "lucide-react";

interface VendorProfileModalProps {
  vendor: {
    name: string;
    service: string;
    rating: number;
    minPrice: number;
    maxPrice: number;
    location: string;
    verified: boolean;
    experience: number;
    completedEvents: number;
    bio?: string;
    services?: string[];
    portfolioImages?: string[];
    certifications?: string[];
    awards?: string[];
    packages?: Array<{
      id: string;
      title: string;
      category: string;
      description: string;
      minPrice: number;
      maxPrice: number;
    }>;
  };
  onClose: () => void;
  onBookNow: () => void;
  onBookPackage?: (pkg: {
    id: string;
    title: string;
    category: string;
    description: string;
    minPrice: number;
    maxPrice: number;
  }) => void;
  onSendMessage: () => void;
}

export default function VendorProfileModal({
  vendor,
  onClose,
  onBookNow,
  onBookPackage,
  onSendMessage,
}: VendorProfileModalProps) {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-primary via-neutral to-primary-soft text-white p-6 rounded-t-xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold">
              {vendor.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold">{vendor.name}</h2>
                {vendor.verified && (
                  <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> {t("event.verified")}
                  </span>
                )}
              </div>
              <p className="text-blue-100">{vendor.service}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 w-10 h-10 rounded-full flex items-center justify-center transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-yellow-50 dark:bg-yellow-900/30 p-4 rounded-lg text-center">
              <div className="flex items-center justify-center gap-1 text-yellow-600 dark:text-yellow-400 mb-1">
                <Star className="w-5 h-5 fill-current" />
                <span className="text-2xl font-bold">{vendor.rating}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {t("vendorProfile.rating")}
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg text-center">
              <div className="flex items-center justify-center gap-1 text-primary mb-1">
                <Briefcase className="w-5 h-5" />
                <span className="text-2xl font-bold">{vendor.experience}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {t("vendorProfile.experience")}
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg text-center">
              <div className="flex items-center justify-center gap-1 text-green-600 dark:text-green-400 mb-1">
                <Award className="w-5 h-5" />
                <span className="text-2xl font-bold">
                  {vendor.completedEvents}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {t("vendorProfile.completedEvents")}
              </p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/30 p-4 rounded-lg text-center">
              <div className="flex items-center justify-center gap-1 text-primary-soft mb-1">
                <MapPin className="w-5 h-5" />
              </div>
              <p className="text-sm font-semibold text-gray-800 dark:text-white">
                {vendor.location}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-300">
                {t("vendorProfile.location")}
              </p>
            </div>
          </div>

          {/* About Section */}
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">
              {t("vendorProfile.about")}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {vendor.bio ||
                `Professional ${vendor.service.toLowerCase()} service provider with ${vendor.experience} years of experience. Successfully completed ${vendor.completedEvents} events with an average rating of ${vendor.rating} stars. Committed to delivering exceptional service and creating memorable experiences for every client.`}
            </p>
          </div>

          {/* Services & Pricing */}
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">
              {t("vendorProfile.servicesPricing")}
            </h3>
            {vendor.packages && vendor.packages.length > 0 ? (
              <div className="space-y-3">
                {vendor.packages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-100 dark:border-gray-600"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-white">
                          {pkg.title}
                        </p>
                        <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-primary">
                          {pkg.category}
                        </p>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                          {pkg.description}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm text-gray-600 dark:text-gray-300">Price Range</p>
                        <p className="text-lg font-bold text-green-600 dark:text-green-400">
                          {pkg.minPrice.toLocaleString()} -{" "}
                          {pkg.maxPrice.toLocaleString()} RWF
                        </p>
                        {onBookPackage && (
                          <button
                            onClick={() => {
                              onBookPackage(pkg);
                              onClose();
                            }}
                            className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-soft transition"
                          >
                            {t("booking.bookPackage")}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-800 dark:text-white">
                      {vendor.service}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {vendor.services && vendor.services.length > 0
                        ? vendor.services.join(", ")
                        : "Professional Package"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-300">Price Range</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {vendor.minPrice.toLocaleString()} -{" "}
                      {vendor.maxPrice.toLocaleString()} RWF
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Certifications & Awards */}
          <div className="mb-6 grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">Certifications</h3>
              {vendor.certifications && vendor.certifications.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {vendor.certifications.map((item, index) => (
                    <span
                      key={`${item}-${index}`}
                      className="rounded-full bg-blue-50 dark:bg-blue-900/30 px-3 py-1 text-sm font-medium text-blue-700 dark:text-blue-300"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No certifications listed.
                </p>
              )}
            </div>

            <div>
              <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">Awards</h3>
              {vendor.awards && vendor.awards.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {vendor.awards.map((item, index) => (
                    <span
                      key={`${item}-${index}`}
                      className="rounded-full bg-yellow-50 dark:bg-yellow-900/30 px-3 py-1 text-sm font-medium text-yellow-700 dark:text-yellow-300"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No awards listed.</p>
              )}
            </div>
          </div>

          {/* Portfolio Preview */}
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-3 text-gray-900 dark:text-white">
              {t("vendorProfile.portfolio")}
            </h3>
            {vendor.portfolioImages && vendor.portfolioImages.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {vendor.portfolioImages.map((image, index) => (
                  <img
                    key={`${image}-${index}`}
                    src={image}
                    alt={`Portfolio ${index + 1}`}
                    className="aspect-square rounded-lg object-cover"
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-600 p-4 text-sm text-gray-500 dark:text-gray-400">
                No portfolio images uploaded yet.
              </div>
            )}
          </div>

          {/* Privacy Notice */}
          <div className="bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 dark:border-yellow-500 p-4 rounded mb-6">
            <p className="text-sm text-yellow-800 dark:text-yellow-200 font-medium">
              🔒 For your safety and payment protection, all communication and
              transactions must be conducted through Event Connect platform.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                onBookNow();
                onClose();
              }}
              className="flex-1 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-soft transition"
            >
              {t("vendorProfile.bookNow")}
            </button>
            <button
              onClick={() => {
                onSendMessage();
                onClose();
              }}
              className="flex-1 border-2 border-primary text-primary dark:text-white py-3 rounded-lg font-semibold hover:bg-blue-50 dark:hover:bg-primary/20 transition"
            >
              {t("vendorProfile.sendMessage")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
