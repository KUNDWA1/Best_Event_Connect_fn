import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";

export default function EventVendors() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const event = location.state?.event;

  if (!event) {
    navigate("/planner/dashboard");
    return null;
  }

  const matchedVendors = [
    { name: "Elite Photography Studio", service: "Photography", rating: 4.8, price: 300000, location: event.location.split(",")[0], verified: true, experience: 8, completedEvents: 150 },
    { name: "Elegant Bridal Boutique", service: "Bride Dress", rating: 4.9, price: 200000, location: event.location.split(",")[0], verified: true, experience: 5, completedEvents: 200 },
    { name: "Royal Catering Services", service: "Catering", rating: 4.7, price: 1500000, location: event.location.split(",")[0], verified: true, experience: 10, completedEvents: 300 },
    { name: "Perfect Decorations", service: "Decoration", rating: 4.6, price: 500000, location: event.location.split(",")[0], verified: false, experience: 4, completedEvents: 80 },
    { name: "Melody Music & DJ", service: "Music/DJ", rating: 4.8, price: 400000, location: event.location.split(",")[0], verified: true, experience: 6, completedEvents: 120 },
    { name: "Glamour Makeup Artists", service: "Makeup & Hair", rating: 4.9, price: 250000, location: event.location.split(",")[0], verified: true, experience: 7, completedEvents: 180 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-600">Event Connect</h1>
          <button onClick={() => navigate("/planner/dashboard")} className="text-blue-600 hover:underline">
            {t("event.backToDashboard")}
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-3xl font-bold mb-4">{event.name}</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">{t("event.date")}</p>
              <p className="font-semibold">{event.date}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t("event.location")}</p>
              <p className="font-semibold">{event.location}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t("event.servicesLabel")}</p>
              <p className="font-semibold">{event.services}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">{t("event.totalBudgetLabel")}</p>
              <p className="font-semibold text-green-600">{event.total_budget.toLocaleString()} RWF</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-2xl font-bold mb-2">
            {t("event.matchedVendors")} ({matchedVendors.length})
          </h3>
          <p className="text-gray-600">{t("event.vendorsMatchDesc")}</p>
        </div>

        <div className="space-y-4">
          {matchedVendors.map((vendor, i) => (
            <div key={i} className="bg-white border rounded-lg p-6 hover:border-blue-500 transition">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {vendor.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-xl font-bold">{vendor.name}</h4>
                      {vendor.verified && (
                        <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1 w-fit">
                          <Check className="w-3 h-3" /> {t("event.verified")}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-3">
                      <span className="font-semibold text-blue-600">{vendor.service}</span>{" "}• {vendor.location}
                    </p>
                    <div className="flex items-center gap-4 text-sm mb-3">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">★</span>
                        <span className="font-semibold">{vendor.rating}</span>
                      </div>
                      <span className="text-gray-400">|</span>
                      <span>{vendor.experience} {t("event.yearsExperience")}</span>
                      <span className="text-gray-400">|</span>
                      <span>{vendor.completedEvents} {t("event.eventsCompleted")}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="bg-green-50 px-4 py-2 rounded-lg">
                        <p className="text-sm text-gray-600">{t("event.price")}</p>
                        <p className="text-lg font-bold text-green-600">{vendor.price.toLocaleString()} RWF</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-semibold">
                    {t("event.bookNow")}
                  </button>
                  <button className="border-2 border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50 font-semibold">
                    {t("event.viewProfile")}
                  </button>
                  <button className="border-2 border-blue-600 text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 font-semibold">
                    {t("event.chat")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
