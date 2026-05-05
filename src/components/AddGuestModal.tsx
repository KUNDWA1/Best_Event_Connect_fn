import { useState } from "react";
import { X, Upload } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  createGuest,
  importGuestsCsv,
  type GuestPayload,
} from "../services/api";

interface AddGuestModalProps {
  eventId: string;
  eventName: string;
  onClose: () => void;
  onSubmit: (guestData: any) => void;
}

export default function AddGuestModal({
  eventId,
  eventName,
  onClose,
  onSubmit,
}: AddGuestModalProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<GuestPayload>({
    eventId: eventId,
    fullNames: "",
    phone: "",
    email: "",
    category: "REGULAR",
    tableNumber: 0,
    rsvpstatus: "Pending",
  });
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isBulkUploading, setIsBulkUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "tableNumber" ? parseInt(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await createGuest(formData);
      onSubmit(formData);
      onClose();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to add guest";
      setError(errorMessage);
      console.error("Error adding guest:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (!file.name.toLowerCase().endsWith(".csv")) {
        setError("Please upload a CSV file only.");
        setUploadFile(null);
        return;
      }

      setError(null);
      setUploadFile(file);
    }
  };

  const handleBulkUpload = async () => {
    if (!uploadFile) {
      setError("Please choose a CSV file to import.");
      return;
    }

    setError(null);
    setIsBulkUploading(true);

    try {
      const response = await importGuestsCsv(eventId, uploadFile);
      const importedCount = response.data?.successful?.length || 0;
      const failedCount = response.data?.failed?.length || 0;

      onSubmit({
        eventId,
        bulkImport: true,
        importedCount,
        failedCount,
        message: response.message,
      });

      alert(
        response.message || `Imported ${importedCount} guests successfully.`,
      );
      setUploadFile(null);
      onClose();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to import guests from CSV";
      setError(errorMessage);
      console.error("Error importing guests:", err);
    } finally {
      setIsBulkUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-primary to-primary-soft text-white p-6 rounded-t-lg flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{t("guest.addGuest")}</h2>
            <p className="text-blue-100 text-sm mt-1">{eventName}</p>
          </div>
          <button
            onClick={onClose}
            aria-label={t("common.close")}
            className="text-white hover:bg-white hover:bg-opacity-20 w-10 h-10 rounded-full flex items-center justify-center"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">
              {t("publicEvents.fullName")}
            </label>
            <input
              type="text"
              name="fullNames"
              value={formData.fullNames}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder={t("publicEvents.fullNamePlaceholder")}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {t("publicEvents.phone")}
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="+250 XXX XXX XXX"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                {t("publicEvents.email")}
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder={t("publicEvents.emailPlaceholder")}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                {t("publicEvents.category")}
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="REGULAR">{t("publicEvents.catRegular")}</option>
                <option value="VIP">{t("publicEvents.catVIP")}</option>
                <option value="VVIP">{t("publicEvents.catVVIP")}</option>
                <option value="FAMILY">{t("publicEvents.catFamily")}</option>
                <option value="FRIEND">{t("publicEvents.catFriend")}</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                {t("publicEvents.tableNumber")}
              </label>
              <input
                type="number"
                name="tableNumber"
                value={formData.tableNumber}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {t("guest.rsvpStatus")}
            </label>
            <select
              name="rsvpstatus"
              value={formData.rsvpstatus}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="Pending">{t("guest.pending")}</option>
              <option value="Confirmed">{t("guest.confirmed")}</option>
              <option value="Declined">{t("guest.declined")}</option>
            </select>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-primary text-white py-3 rounded-lg font-semibold hover:bg-primary-soft disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? t("vendor.saving") : t("guest.addGuest")}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
            >
              {t("common.cancel")}
            </button>
          </div>
        </form>

        <div className="px-6 pb-6">
          <div className="border-t pt-6">
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
              <Upload className="w-5 h-5" />
              {t("guest.orUploadMultiple")}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {t("guest.uploadDesc")}
            </p>

            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                id="guestFile"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="guestFile"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="w-12 h-12 text-gray-400 mb-2" />
                <p className="text-sm font-medium text-gray-700 mb-1">
                  {uploadFile ? uploadFile.name : t("guest.clickToUpload")}
                </p>
                <p className="text-xs text-gray-500">{t("guest.fileTypes")}</p>
              </label>
            </div>

            {uploadFile && (
              <div className="mt-4 flex gap-3">
                <button
                  onClick={handleBulkUpload}
                  disabled={isBulkUploading}
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Upload className="w-5 h-5" />
                  {isBulkUploading ? t("vendor.saving") : `${t("guest.upload")} ${uploadFile.name}`}
                </button>
                <button
                  onClick={() => setUploadFile(null)}
                  disabled={isBulkUploading}
                  className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50"
                >
                  {t("common.delete")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
