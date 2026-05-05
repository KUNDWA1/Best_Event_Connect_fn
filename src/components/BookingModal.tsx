import { useState } from "react";
import { Calendar, Clock, MessageSquare } from "lucide-react";
import { useTranslation } from "react-i18next";

interface BookingModalProps {
  vendor: {
    vendorId?: string;
    name: string;
    packageId?: string;
    service: string;
    category?: string;
    price: number;
    rating: number;
    experience: number;
  };
  events: Array<{
    id: string;
    name: string;
    date: string;
    location: string;
    startDate?: string;
    endDate?: string;
  }>;
  onClose: () => void;
  onBookingSubmit: (bookingData: any) => Promise<void> | void;
}

export default function BookingModal({ vendor, events, onClose, onBookingSubmit }: BookingModalProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({ eventId: "", bookingDate: "", timeSlot: "", notes: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const selectedEvent = events.find((event) => event.id === formData.eventId);
    if (!selectedEvent || !vendor.packageId) { setLoading(false); return; }

    const timeRangeBySlot: Record<string, [string, string]> = {
      morning: ["09:00:00", "12:00:00"],
      afternoon: ["13:00:00", "17:00:00"],
      evening: ["18:00:00", "22:00:00"],
      "full-day": ["09:00:00", "22:00:00"],
    };

    const [startTime, endTime] = timeRangeBySlot[formData.timeSlot] || timeRangeBySlot["full-day"];
    const startDate = new Date(`${formData.bookingDate}T${startTime}`).toISOString();
    const endDate = new Date(`${formData.bookingDate}T${endTime}`).toISOString();

    try {
      await Promise.resolve(onBookingSubmit({
        id: `booking-${Date.now()}`,
        vendorId: vendor.vendorId,
        packageId: vendor.packageId,
        vendorName: vendor.name,
        service: vendor.service,
        category: vendor.category || "General",
        eventId: selectedEvent.id,
        eventName: selectedEvent.name,
        bookingDate: formData.bookingDate,
        timeSlot: formData.timeSlot,
        price: vendor.price,
        priceOffered: vendor.price,
        startDate,
        endDate,
        message: formData.notes,
        status: "pending",
        createdAt: new Date().toLocaleDateString(),
        notes: formData.notes,
      }));
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-primary via-neutral to-primary-soft text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{t("booking.bookVendor")}</h2>
              <p className="text-blue-100 text-sm mt-1">{vendor.name}</p>
            </div>
            <button onClick={onClose} className="text-white hover:bg-white hover:bg-opacity-20 w-8 h-8 rounded-full flex items-center justify-center">✕</button>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Vendor Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Service
                </p>
                <p className="font-semibold text-gray-900 dark:text-white">{vendor.service}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Category
                </p>
                <p className="font-semibold text-gray-900 dark:text-white">{vendor.category || "General"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Rating
                </p>
                <p className="font-semibold flex items-center gap-1 text-gray-900 dark:text-white">
                  <span className="text-yellow-500">★</span> {vendor.rating}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Experience
                </p>
                <p className="font-semibold text-gray-900 dark:text-white">{vendor.experience} years</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t("event.price")}</p>
                <p className="font-semibold text-primary">{vendor.price.toLocaleString()} RWF</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Select Event
                </label>
                <select
                  value={formData.eventId}
                  onChange={(e) => setFormData({ ...formData, eventId: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 dark:text-white text-gray-900"
                >
                  <option value="">{t("booking.chooseEvent")}</option>
                  {events.map((event) => (
                    <option key={event.id} value={event.id}>{event.name}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Select the event you want this vendor for
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Calendar className="w-4 h-4" /> Event Date
                </label>
                <input
                  type="date"
                  value={formData.bookingDate}
                  onChange={(e) => setFormData({ ...formData, bookingDate: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 dark:text-white text-gray-900 dark:[color-scheme:dark]"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Date when you need the vendor services
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Clock className="w-4 h-4" /> Time
                </label>
                <select
                  value={formData.timeSlot}
                  onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 dark:text-white text-gray-900"
                >
                  <option value="">{t("booking.selectTime")}</option>
                  <option value="morning">{t("booking.morning")}</option>
                  <option value="afternoon">{t("booking.afternoon")}</option>
                  <option value="evening">{t("booking.evening")}</option>
                  <option value="full-day">{t("booking.fullDay")}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <MessageSquare className="w-4 h-4" /> Additional Requirements
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder={t("booking.specialRequests")}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none bg-white dark:bg-gray-700 dark:text-white text-gray-900"
                />
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
              <h4 className="font-bold text-sm mb-3 text-gray-900 dark:text-white">Booking Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Vendor:
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">{vendor.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Service:
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">{vendor.service}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Event:
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {events.find((event) => event.id === formData.eventId)
                      ?.name || "Not selected"}
                  </span>
                </div>
                <div className="border-t border-gray-300 dark:border-gray-600 pt-2 mt-2 flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400 font-semibold">{t("booking.totalAmount")}:</span>
                  <span className="text-xl font-bold text-green-600 dark:text-green-400">{vendor.price.toLocaleString()} RWF</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-primary to-primary-soft text-white px-6 py-3 rounded-lg font-semibold hover:from-primary-soft hover:to-primary transition disabled:opacity-50">
                {loading ? t("payment.processing") : t("publicEvents.confirmBooking")}
              </button>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center">{t("booking.confirmNote")}</p>
          </form>
        </div>
      </div>
    </div>
  );
}
