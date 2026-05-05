import { Calendar, DollarSign, CheckCircle, Clock, Trash2, Eye } from "lucide-react";
import { useTranslation } from "react-i18next";
import { formatDateShort } from "../utils/dateFormatter";

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

interface BookingsListProps {
  bookings: Booking[];
  onCancel?: (bookingId: string) => void;
  onViewDetails?: (booking: Booking) => void;
}

export default function BookingsList({ bookings, onCancel, onViewDetails }: BookingsListProps) {
  const { t, i18n } = useTranslation();

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300";
      case "pending":
        return "bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300";
      case "cancelled":
        return "bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    if (status === "confirmed") return <CheckCircle className="w-4 h-4" />;
    if (status === "pending") return <Clock className="w-4 h-4" />;
    return null;
  };

  const statusLabel = (status: string) => {
    if (status === "confirmed") return t("booking.confirmed");
    if (status === "pending") return t("booking.pending");
    if (status === "cancelled") return t("booking.cancelled");
    return status;
  };

  if (bookings.length === 0) {
    return (
      <div className="text-center py-16">
        <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">No bookings yet</p>
        <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
          Start by booking a vendor from the Matched Vendors tab
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-gray-600 dark:text-gray-300 text-sm mb-4">
        You have{" "}
        <span className="font-bold text-primary">{bookings.length}</span>{" "}
        {bookings.length !== 1 ? t("booking.bookingsPlural") : t("booking.bookingSingular")}
      </div>

      {bookings.map((booking) => (
        <div
          key={booking.id}
          className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition bg-white dark:bg-gray-800"
        >
          {/* Main Info */}
          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-soft rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                    {booking.vendorName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {booking.vendorName}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${getStatusStyles(
                          booking.status,
                        )}`}
                      >
                        {getStatusIcon(booking.status)}
                        {statusLabel(booking.status)}
                      </span>
                    </div>

                    <p className="text-gray-600 dark:text-gray-400 mb-3">
                      <span className="font-semibold text-primary">{booking.service}</span>
                      {" • "}
                      <span className="font-semibold text-gray-800 dark:text-gray-200">{booking.eventName}</span>
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                        <p className="text-gray-600 dark:text-gray-400 text-xs">
                          Booking Date
                        </p>
                        <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-1 mt-1">
                          <Calendar className="w-4 h-4" />
                          {formatDateShort(booking.bookingDate, i18n.language)}
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded">
                        <p className="text-gray-600 dark:text-gray-400 text-xs">
                          Time Slot
                        </p>
                        <p className="font-semibold capitalize mt-1 text-gray-900 dark:text-white">
                          {booking.timeSlot}
                        </p>
                      </div>

                      <div className="bg-green-50 dark:bg-green-900/30 p-3 rounded">
                        <p className="text-gray-600 dark:text-gray-400 text-xs">
                          Amount
                        </p>
                        <p className="font-semibold text-green-600 dark:text-green-400 flex items-center gap-1 mt-1">
                          <DollarSign className="w-4 h-4" />
                          {booking.price.toLocaleString()} RWF
                        </p>
                      </div>

                      <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded">
                        <p className="text-gray-600 dark:text-gray-400 text-xs">
                          Booked On
                        </p>
                        <p className="font-semibold text-sm mt-1 text-gray-900 dark:text-white">
                          {booking.createdAt}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button onClick={() => onViewDetails?.(booking)} className="bg-blue-50 dark:bg-gray-700 text-primary dark:text-blue-400 px-4 py-2 rounded-lg hover:bg-blue-100 dark:hover:bg-gray-600 font-semibold flex items-center gap-2 transition">
                  <Eye className="w-4 h-4" /> {t("common.view")}
                </button>
                {booking.status === "confirmed" && (
                  <button
                    onClick={() => onCancel?.(booking.id)}
                    className="border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 px-4 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-gray-700 font-semibold flex items-center gap-2 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
