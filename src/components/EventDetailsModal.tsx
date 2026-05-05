import { Event, EventService } from "../services/api";
import { X, Trash2, Edit } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getEventDisplayType, stripCustomEventTypePrefix } from "../utils/eventCategories";
import { formatDateTime } from "../utils/dateFormatter";

interface EventDetailsModalProps {
  event: Event;
  eventServices: EventService[];
  onClose: () => void;
  onDelete: (id: string) => Promise<void>;
  onEdit: (event: Event) => void;
}

export default function EventDetailsModal({ event, eventServices, onClose, onDelete, onEdit }: EventDetailsModalProps) {
  const { t, i18n } = useTranslation();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b dark:border-gray-700 p-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{t("eventDetails.title")}</h2>
          <button onClick={onClose} aria-label={t("common.close")} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">
          <table className="w-full text-left table-auto">
            <tbody className="text-sm text-gray-700 dark:text-gray-300">
              <tr>
                <th className="py-2 pr-4 font-medium">{t("eventDetails.titleLabel")}</th>
                <td className="py-2">{event.title}</td>
              </tr>
              <tr>
                <th className="py-2 pr-4 font-medium">{t("event.eventDescription")}</th>
                <td className="py-2">{stripCustomEventTypePrefix(event.description)}</td>
              </tr>
              <tr>
                <th className="py-2 pr-4 font-medium">{t("event.eventType")}</th>
                <td className="py-2">{getEventDisplayType(event.eventType, event.description)}</td>
              </tr>
              <tr>
                <th className="py-2 pr-4 font-medium">{t("event.status")}</th>
                <td className="py-2 capitalize">{event.status}</td>
              </tr>
              <tr>
                <th className="py-2 pr-4 font-medium">{t("event.startDate")}</th>
                <td className="py-2">{formatDateTime(event.startDate, i18n.language)}</td>
              </tr>
              <tr>
                <th className="py-2 pr-4 font-medium">{t("event.endDate")}</th>
                <td className="py-2">{formatDateTime(event.endDate, i18n.language)}</td>
              </tr>
              <tr>
                <th className="py-2 pr-4 font-medium">{t("event.location")}</th>
                <td className="py-2">{event.location}</td>
              </tr>
              <tr>
                <th className="py-2 pr-4 font-medium">{t("event.budget")}</th>
                <td className="py-2">{event.budget.toLocaleString()} RWF</td>
              </tr>
              <tr>
                <th className="py-2 pr-4 font-medium">{t("eventDetails.guestCount")}</th>
                <td className="py-2">{event.guestCount}</td>
              </tr>
              <tr>
                <th className="py-2 pr-4 font-medium">{t("event.eventImage")}</th>
                <td className="py-2">
                  {event.imageUrl ? (
                    <a href={event.imageUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                      {t("eventDetails.viewImage")}
                    </a>
                  ) : "—"}
                </td>
              </tr>
              <tr>
                <th className="py-2 pr-4 font-medium">{t("eventDetails.createdAt")}</th>
                <td className="py-2">{formatDateTime(event.createdAt, i18n.language)}</td>
              </tr>
              <tr>
                <th className="py-2 pr-4 font-medium">{t("eventDetails.updatedAt")}</th>
                <td className="py-2">{formatDateTime(event.updatedAt, i18n.language)}</td>
              </tr>
            </tbody>
          </table>

          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
              {t("event.servicesNeeded")} ({eventServices.length})
            </h3>

            {eventServices.length === 0 ? (
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 text-sm text-gray-500 dark:text-gray-400">
                {t("eventDetails.noServices")}
              </div>
            ) : (
              <div className="space-y-3">
                {eventServices.map((service) => (
                  <div key={service.id} className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <p className="font-semibold text-gray-800 dark:text-white">{service.title || service.category}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{t("event.serviceCategory")}: {service.category}</p>
                    {service.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-300">{t("event.serviceDescription")}: {service.description}</p>
                    )}
                    <p className="text-sm text-gray-600 dark:text-gray-300">{t("event.serviceQuantity")}: {service.quantity || 1}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{t("event.budget")}: {(service.budget || 0).toLocaleString()} RWF</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button onClick={() => onEdit(event)} className="inline-flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-500">
              <Edit className="w-4 h-4" /> {t("common.edit")}
            </button>
            <button onClick={() => onDelete(event.id)} className="inline-flex items-center gap-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-500">
              <Trash2 className="w-4 h-4" /> {t("common.delete")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
