import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Calendar, MapPin, Check, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import DashboardSidebar from "../components/DashboardSidebar";
import DashboardHeader from "../components/DashboardHeader";
import BookingModal from "../components/BookingModal";
import BookingsList from "../components/BookingsList";

interface Booking {
  id: string;
  vendorName: string;
  service: string;
  eventName: string;
  bookingDate: string;
  timeSlot: string;
  price: number;
  status: "confirmed" | "pending" | "cancelled";
  createdAt: string;
  notes?: string;
}

interface SelectedVendor {
  name: string;
  service: string;
  price: number;
  rating: number;
  experience: number;
}

export default function PlannerDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("my-events");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<SelectedVendor | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const handleBookNow = (vendor: SelectedVendor) => {
    setSelectedVendor(vendor);
    setShowBookingModal(true);
  };

  const handleBookingSubmit = (bookingData: Booking) => {
    setBookings([...bookings, bookingData]);
    setShowBookingModal(false);
    setSelectedVendor(null);
  };

  const handleCancelBooking = (bookingId: string) => {
    if (confirm(t("planner.cancelBookingConfirm"))) {
      setBookings(bookings.filter((b) => b.id !== bookingId));
    }
  };

  const postedEvent = location.state?.newEvent;

  const [myEvents] = useState([
    ...(postedEvent ? [postedEvent] : []),
    {
      name: "John & Mary Wedding",
      date: "June 20, 2024",
      location: "Kigali, Rwanda",
      status: "Active",
      services: 8,
      matched_vendors: 12,
      total_budget: 5000000,
    },
    {
      name: "Birthday Celebration",
      date: "July 15, 2024",
      location: "Musanze, Rwanda",
      status: "Draft",
      services: 4,
      matched_vendors: 0,
      total_budget: 1500000,
    },
  ]);

  const matchedVendors = [
    { name: "Elite Photography Studio", service: "Photography", rating: 4.8, price: 300000, location: "Kigali", verified: true, experience: 8, completedEvents: 150 },
    { name: "Elegant Bridal Boutique", service: "Bride Dress", rating: 4.9, price: 200000, location: "Kigali", verified: true, experience: 5, completedEvents: 200 },
    { name: "Royal Catering Services", service: "Catering", rating: 4.7, price: 1500000, location: "Kigali", verified: true, experience: 10, completedEvents: 300 },
    { name: "Perfect Decorations", service: "Decoration", rating: 4.6, price: 500000, location: "Kigali", verified: false, experience: 4, completedEvents: 80 },
    { name: "Melody Music & DJ", service: "Music/DJ", rating: 4.8, price: 400000, location: "Kigali", verified: true, experience: 6, completedEvents: 120 },
    { name: "Glamour Makeup Artists", service: "Makeup & Hair", rating: 4.9, price: 250000, location: "Kigali", verified: true, experience: 7, completedEvents: 180 },
  ];

  const tabs = [
    { id: "my-events", label: t("dashboard.myEvents") },
    { id: "matched-vendors", label: t("planner.findVendors") },
    { id: "bookings", label: t("planner.myBookings") },
  ];

  return (
    <div className="flex min-h-screen bg-background dark:bg-gray-900">
      <DashboardSidebar userType="planner" activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex-1 lg:ml-64 bg-background dark:bg-gray-900">
        <DashboardHeader
          title={t("planner.dashboard")}
          subtitle={t("planner.postEventDesc")}
          userName="Event Planner"
          userInitials="EP"
        />

        <main className="p-6">
          <div className="bg-gradient-to-r from-primary via-neutral to-primary-soft text-white rounded-2xl p-8 mb-6">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">{t("planner.heroTitle")}</h2>
            <p className="text-lg text-blue-100">{t("planner.heroSubtitle")}</p>
          </div>

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold dark:text-white">{t("dashboard.myEvents")}</h2>
            <button
              onClick={() => navigate("/planner/create-event")}
              className="bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-soft flex items-center gap-2"
            >
              <Plus className="w-5 h-5" /> {t("dashboard.createEvent")}
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{t("planner.activeEvents")}</p>
              <p className="text-3xl font-bold text-primary">2</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{t("planner.matchedVendors")}</p>
              <p className="text-3xl font-bold text-green-600">12</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">{t("event.totalBudgetLabel")}</p>
              <p className="text-3xl font-bold text-primary-soft">6.5M RWF</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="border-b dark:border-gray-700">
              <div className="flex gap-6 px-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-2 border-b-2 font-semibold ${
                      activeTab === tab.id
                        ? "border-primary text-primary"
                        : "border-transparent text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6">
              {activeTab === "my-events" && (
                <div className="space-y-4">
                  {myEvents.map((event, i) => (
                    <div key={i} className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg p-6 hover:border-blue-500 transition">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold mb-2 dark:text-white">{event.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {event.date}</span>
                            <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {event.location}</span>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${event.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                          {event.status === "Active" ? t("event.active") : t("event.draft")}
                        </span>
                      </div>
                      <div className="grid md:grid-cols-3 gap-4 mb-4">
                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                          <p className="text-sm text-gray-600 dark:text-gray-400">{t("event.servicesLabel")}</p>
                          <p className="font-semibold dark:text-white">{event.services}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                          <p className="text-sm text-gray-600 dark:text-gray-400">{t("planner.matchedVendors")}</p>
                          <p className="font-semibold text-green-600">{event.matched_vendors}</p>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                          <p className="text-sm text-gray-600 dark:text-gray-400">{t("event.totalBudgetLabel")}</p>
                          <p className="font-semibold dark:text-white">{event.total_budget.toLocaleString()} RWF</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => setActiveTab("matched-vendors")} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-soft">
                          {t("planner.viewVendors")}
                        </button>
                        <button className="border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-white">
                          {t("event.edit")}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "matched-vendors" && (
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">{t("planner.matchedVendorsDesc")}</p>
                  <div className="space-y-4">
                    {matchedVendors.map((vendor, i) => (
                      <div key={i} className="border dark:border-gray-700 rounded-lg p-6 hover:border-blue-500 transition">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary-soft rounded-full flex items-center justify-center text-white text-2xl font-bold">
                              {vendor.name.charAt(0)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="text-xl font-bold dark:text-white">{vendor.name}</h4>
                                {vendor.verified && (
                                  <span className="bg-blue-100 text-primary text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1 w-fit">
                                    <Check className="w-3 h-3" /> {t("event.verified")}
                                  </span>
                                )}
                              </div>
                              <p className="text-gray-600 dark:text-gray-400 mb-3">
                                <span className="font-semibold text-primary">{vendor.service}</span> • {vendor.location}
                              </p>
                              <div className="flex items-center gap-4 text-sm mb-3 dark:text-gray-400">
                                <div className="flex items-center gap-1">
                                  <span className="text-yellow-500">★</span>
                                  <span className="font-semibold">{vendor.rating}</span>
                                </div>
                                <span className="text-gray-400">|</span>
                                <span>{vendor.experience} {t("event.yearsExperience")}</span>
                                <span className="text-gray-400">|</span>
                                <span>{vendor.completedEvents} {t("event.eventsCompleted")}</span>
                              </div>
                              <div className="bg-green-50 px-4 py-2 rounded-lg inline-block">
                                <p className="text-sm text-gray-600">{t("event.price")}</p>
                                <p className="text-lg font-bold text-green-600">{vendor.price.toLocaleString()} RWF</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => handleBookNow({ name: vendor.name, service: vendor.service, price: vendor.price, rating: vendor.rating, experience: vendor.experience })}
                              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-soft font-semibold"
                            >
                              {t("event.bookNow")}
                            </button>
                            <button className="border-2 border-gray-300 dark:border-gray-600 px-6 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-semibold dark:text-white">
                              {t("event.viewProfile")}
                            </button>
                            <button className="border-2 border-primary text-primary px-6 py-2 rounded-lg hover:bg-blue-50 font-semibold">
                              {t("event.chat")}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "bookings" && (
                <BookingsList bookings={bookings} onCancel={handleCancelBooking} />
              )}
            </div>
          </div>
        </main>

        {showBookingModal && selectedVendor && (
          <BookingModal
            vendor={selectedVendor}
            events={myEvents}
            onClose={() => setShowBookingModal(false)}
            onBookingSubmit={handleBookingSubmit}
          />
        )}
      </div>
    </div>
  );
}
