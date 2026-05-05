import { CheckCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface SuccessModalProps {
  message: string;
  onClose: () => void;
}

export default function SuccessModal({ message, onClose }: SuccessModalProps) {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full mx-4 animate-scale-in">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 mb-4">
            <CheckCircle className="h-10 w-10 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t("common.success")}</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
          <button onClick={onClose} className="w-full bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-soft transition">
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
