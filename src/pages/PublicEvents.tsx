import { useState, useMemo, useCallback } from "react";
import { Calendar, MapPin, Users, Clock, X, Loader } from "lucide-react";
import { useTranslation } from "react-i18next";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useEvents } from "../hooks/useEvents";
import {
  getEventDisplayType,
  stripCustomEventTypePrefix,
} from "../utils/eventCategories";
import { formatDate as fmtDate, formatTime as fmtTime } from "../utils/dateFormatter";
import { createGuest } from "../services/api";
import PaymentModal from "../components/PaymentModal";

// Extract ticket price from description e.g. "[TICKET_PRICE:5000]"
const extractTicketPrice = (description?: string): number => {
  const match = description?.match(/\[TICKET_PRICE:(\d+)\]/);
  return match ? parseInt(match[1]) : 0;
};

// Maps lowercase eventType values to translation keys
const CATEGORY_KEY_MAP: Record<string, string> = {
  wedding: "event.wedding",
  weddings: "event.wedding",
  birthday: "event.birthday",
  "birth day": "event.birthday",
  "birthday party": "event.birthday",
  corporate: "event.corporate",
  "corporate event": "event.corporate",
  "corporate events": "event.corporate",
  conference: "event.conference",
  conferences: "event.conference",
  festival: "event.festival",
  festivals: "event.festival",
  charity: "event.charity",
  "charity event": "event.charity",
  "charity events": "event.charity",
  graduation: "event.graduation",
  other: "event.other",
};

export default function PublicEvents() {
  const { t, i18n } = useTranslation();
  const { events, loading, error, refetch } = useEvents({ publicOnly: true });
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [bookingEventId, setBookingEventId] = useState<string | null>(null);
  const [paymentEventId, setPaymentEventId] = useState<string | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const resolveCategory = useCallback(
    (eventType: string | undefined, description: string | undefined): string => {
      const rawType = (eventType ?? "").toLowerCase().trim();
      const key = CATEGORY_KEY_MAP[rawType];
      if (key) return t(key);
      const custom = getEventDisplayType(eventType, description);
      return custom || t("event.other");
    },
    [t]
  );

  // Re-runs whenever events, locale (language), or t (language) changes
  const transformedEvents = useMemo(
    () =>
      [...events]
        .sort(
          (a, b) =>
            new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
        )
        .map((event: any) => ({
          id: event.id,
          name: event.title,
          startDate: event.startDate,
          displayDate: fmtDate(event.startDate, i18n.language),
          time: fmtTime(event.startDate, i18n.language),
          location: event.location,
          description: stripCustomEventTypePrefix(event.description),
          attendees: event.guestCount ?? 0,
          soldOut: (event.guestCount ?? 0) <= 0,
          ticketPrice: extractTicketPrice(event.description),
          image:
            event.imageUrl ||
            "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop",
          category: resolveCategory(event.eventType, event.description),
        })),
    [events, i18n.language, t, resolveCategory]
  );

  // Derived from transformedEvents so they always reflect the current language
  const selectedEvent =
    transformedEvents.find((e) => e.id === selectedEventId) ?? null;
  const bookingEvent =
    transformedEvents.find((e) => e.id === bookingEventId) ?? null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary dark:text-white mb-4">
            {t("publicEvents.title")}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            {t("event.discover")}
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <Loader className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-gray-600 dark:text-gray-300">
              {t("publicEvents.loading")}
            </span>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
            {t("publicEvents.loadError")}: {error}
          </div>
        )}

        {/* Event grid */}
        {!loading && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {transformedEvents.length > 0 ? (
              transformedEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                >
                  {/* Card image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={event.image}
                      alt={event.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=600&fit=crop";
                      }}
                    />
                    <div className="absolute top-4 right-4">
                      <span className="bg-accent text-neutral px-3 py-1 rounded-full text-sm font-semibold">
                        {event.category}
                      </span>
                    </div>
                  </div>

                  {/* Card body */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-3 text-gray-800 dark:text-white">
                      {event.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2">
                      {event.description}
                    </p>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
                        <span>{event.displayDate}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="w-4 h-4 text-primary flex-shrink-0" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Users className="w-4 h-4 text-primary flex-shrink-0" />
                        {event.soldOut ? (
                          <span className="text-red-600 font-semibold">Sold Out</span>
                        ) : (
                          <span>{event.attendees} seats remaining</span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setSelectedEventId(event.id)}
                        className="flex-1 bg-primary text-white py-2 rounded-lg font-semibold hover:bg-primary-soft transition-colors"
                      >
                        {t("publicEvents.viewDetails")}
                      </button>
                      <button
                        onClick={() => { setBookingError(null); if (event.ticketPrice > 0) { setPaymentEventId(event.id); } else { setBookingEventId(event.id); } }}
                        disabled={event.soldOut}
                        className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
                          event.soldOut
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-accent text-neutral hover:bg-yellow-400"
                        }`}
                      >
                        {event.soldOut ? "Sold Out" : t("publicEvents.bookNow")}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-600 dark:text-gray-300 text-lg">
                  {t("publicEvents.noEvents")}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── View Details Modal ── */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                {t("publicEvents.eventDetails")}
              </h2>
              <button
                onClick={() => setSelectedEventId(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                aria-label={t("common.close")}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-6">
              <img
                src={selectedEvent.image}
                alt={selectedEvent.name}
                className="w-full h-64 object-cover rounded-lg mb-6"
              />
              <div className="mb-4">
                <span className="bg-accent text-neutral px-3 py-1 rounded-full text-sm font-semibold">
                  {selectedEvent.category}
                </span>
              </div>
              <h3 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">
                {selectedEvent.name}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg">
                {selectedEvent.description}
              </p>

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="font-semibold">
                    {t("publicEvents.date")}:
                  </span>
                  <span>{selectedEvent.displayDate}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <Clock className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="font-semibold">
                    {t("publicEvents.time")}:
                  </span>
                  <span>{selectedEvent.time}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="font-semibold">
                    {t("publicEvents.location")}:
                  </span>
                  <span>{selectedEvent.location}</span>
                </div>
                <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                  <Users className="w-5 h-5 text-primary flex-shrink-0" />
                  <span className="font-semibold">
                    {t("publicEvents.expectedAttendeesLabel")}:
                  </span>
                  <span>{selectedEvent.attendees}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedEventId(null);
                  setBookingEventId(selectedEvent.id);
                }}
                className="w-full bg-accent text-neutral py-3 rounded-lg font-bold text-lg hover:bg-yellow-400 transition-colors"
              >
                {t("publicEvents.bookNow")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Book Event Modal ── */}
      {bookingEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="border-b dark:border-gray-700 p-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                {t("publicEvents.bookEvent")}
              </h2>
              <button
                onClick={() => setBookingEventId(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                aria-label={t("common.close")}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">
                  {bookingEvent.name}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {bookingEvent.displayDate} {t("publicEvents.at")}{" "}
                  {bookingEvent.time}
                </p>
              </div>

              <form
                className="space-y-4"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  setBookingLoading(true);
                  setBookingError(null);
                  try {
                    await createGuest({
                      eventId: bookingEvent.id,
                      fullNames: fd.get("fullNames") as string,
                      phone: fd.get("phone") as string,
                      email: fd.get("email") as string,
                      category: fd.get("category") as any,
                      tableNumber: parseInt(fd.get("tableNumber") as string) || 0,
                      rsvpstatus: "Confirmed",
                      rsvpStatus: "Confirmed",
                    });
                    setBookingEventId(null);
                    await refetch();
                    alert(`Booking confirmed for ${bookingEvent.name}!`);
                  } catch (err) {
                    setBookingError(err instanceof Error ? err.message : "Booking failed");
                  } finally {
                    setBookingLoading(false);
                  }
                }}
              >
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    {t("publicEvents.fullName")}
                  </label>
                  <input
                    type="text"
                    name="fullNames"
                    required
                    placeholder={t("publicEvents.fullNamePlaceholder")}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    {t("publicEvents.phone")}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    placeholder="+250 XXX XXX XXX"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    {t("publicEvents.email")}
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder={t("publicEvents.emailPlaceholder")}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    {t("publicEvents.category")}
                  </label>
                  <select
                    name="category"
                    required
                    defaultValue="REGULAR"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                  >
                    <option value="REGULAR">{t("publicEvents.catRegular")}</option>
                    <option value="VIP">{t("publicEvents.catVIP")}</option>
                    <option value="VVIP">{t("publicEvents.catVVIP")}</option>
                    <option value="FAMILY">{t("publicEvents.catFamily")}</option>
                    <option value="FRIEND">{t("publicEvents.catFriend")}</option>
                  </select>
                </div>

                {/* Table Number */}
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                    {t("publicEvents.tableNumber")}
                  </label>
                  <input
                    type="number"
                    name="tableNumber"
                    min="0"
                    defaultValue="0"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                  />
                </div>

                {bookingError && (
                  <p className="text-red-600 text-sm font-semibold">{bookingError}</p>
                )}

                <button
                  type="submit"
                  disabled={bookingLoading}
                  className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-primary-soft transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {bookingLoading && <Loader className="w-4 h-4 animate-spin" />}
                  {bookingLoading ? "Booking..." : t("publicEvents.confirmBooking")}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Payment Modal (paid events) ── */}
      {paymentEventId && (() => {
        const payEvent = transformedEvents.find(e => e.id === paymentEventId);
        if (!payEvent) return null;
        return (
          <PaymentModal
            vendor={{ name: payEvent.name, service: "Event Ticket", price: payEvent.ticketPrice }}
            eventName={payEvent.name}
            onClose={() => setPaymentEventId(null)}
            onPaymentSuccess={() => {
              setPaymentEventId(null);
              setBookingEventId(payEvent.id);
            }}
          />
        );
      })()}

      <Footer />
    </div>
  );
}
