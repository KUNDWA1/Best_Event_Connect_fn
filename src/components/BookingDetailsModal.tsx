import { Calendar, Clock, DollarSign, MapPin, X, Trash2, Edit } from "lucide-react";
import { useState } from "react";
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

interface BookingDetailsModalProps {
  booking: Booking;
  onClose: () => void;
  onCancel: (bookingId: string) => void;
  onDelete: (bookingId: string) => void;
  onUpdate: (booking: Booking) => void;
}

export default function BookingDetailsModal({
  booking,
  onClose,
  onCancel,
  onDelete,
  onUpdate,
}: BookingDetailsModalProps) {
  const { t, i18n } = useTranslation();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
      case "pending": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
      case "cancelled": return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const statusLabel = (status: string) => {
    if (status === "confirmed") return t("booking.confirmed");
    if (status === "pending") return t("booking.pending");
    if (status === "cancelled") return t("booking.cancelled");
    return status;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-primary to-primary-soft text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{t("booking.details")}</h2>
              <p className="text-blue-100 text-sm mt-1">{booking.vendorName}</p>
            </div>
            <button onClick={onClose} aria-label={t("common.close")} className="text-white hover:bg-white hover:bg-opacity-20 w-8 h-8 rounded-full flex items-center justify-center">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <span className={`px-4 py-2 rounded-full text-sm font-bold ${getStatusStyles(booking.status)}`}>
              {statusLabel(booking.status)}
            </span>
          </div>

          <div className="space-y-4 mb-6">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t("booking.service")}</p>
              <p className="text-lg font-semibold text-primary dark:text-white">{booking.service}</p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> {t("booking.eventName")}
              </p>
              <p className="text-lg font-semibold">{booking.eventName}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> {t("booking.eventDate")}
                </p>
                <p className="font-semibold">{formatDateShort(booking.bookingDate, i18n.language)}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> {t("booking.timeSlot")}
                </p>
                <p className="font-semibold capitalize">{booking.timeSlot}</p>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1 flex items-center gap-2">
                <DollarSign className="w-4 h-4" /> {t("booking.totalAmount")}
              </p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {booking.price.toLocaleString()} RWF
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t("booking.bookedOn")}</p>
              <p className="font-semibold">{booking.createdAt}</p>
            </div>

            {booking.notes && (
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{t("booking.additionalNotes")}</p>
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{booking.notes}</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200 dark:border-gray-600">
            <button onClick={onClose} className="border-2 border-gray-300 dark:border-gray-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition">
              {t("common.close")}
            </button>
            <button onClick={() => { onUpdate(booking); onClose(); }} className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2">
              <Edit className="w-4 h-4" /> {t("common.edit")}
            </button>
            {(booking.status === "confirmed" || booking.status === "pending") && (
              <button onClick={() => setShowCancelConfirm(true)} className="bg-yellow-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-yellow-700 transition flex items-center justify-center gap-2">
                <Trash2 className="w-4 h-4" /> {t("common.cancel")}
              </button>
            )}
            <button onClick={() => setShowDeleteConfirm(true)} className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2">
              <Trash2 className="w-4 h-4" /> {t("common.delete")}
            </button>
          </div>
        </div>
      </div>

      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4 animate-scale-in">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 dark:bg-yellow-900 mb-4">
                <Trash2 className="h-10 w-10 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t("booking.cancelBooking")}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">{t("booking.cancelConfirmMsg")}</p>
              <div className="flex gap-3">
                <button onClick={() => setShowCancelConfirm(false)} className="flex-1 border-2 border-gray-300 dark:border-gray-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  {t("booking.noKeepIt")}
                </button>
                <button onClick={() => { onCancel(booking.id); setShowCancelConfirm(false); onClose(); }} className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-semibold transition">
                  {t("booking.yesCancel")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4 animate-scale-in">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900 mb-4">
                <Trash2 className="h-10 w-10 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t("booking.deleteBooking")}</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">{t("booking.deleteConfirmMsg")}</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 border-2 border-gray-300 dark:border-gray-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                  {t("booking.noKeepIt")}
                </button>
                <button onClick={() => { onDelete(booking.id); setShowDeleteConfirm(false); onClose(); }} className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition">
                  {t("booking.yesDelete")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
