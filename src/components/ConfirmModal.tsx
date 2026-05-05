import { AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmText: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: "danger" | "warning";
}

export default function ConfirmModal({
  title,
  message,
  confirmText,
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  type = "danger",
}: ConfirmModalProps) {
  const bgColor = type === "danger" ? "bg-red-100 dark:bg-red-900" : "bg-yellow-100 dark:bg-yellow-900";
  const iconColor = type === "danger" ? "text-red-600 dark:text-red-400" : "text-yellow-600 dark:text-yellow-400";
  const buttonColor = type === "danger" ? "bg-red-600 hover:bg-red-700" : "bg-yellow-600 hover:bg-yellow-700";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4 animate-scale-in">
        <div className="text-center">
          <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full ${bgColor} mb-4`}>
            <AlertTriangle className={`h-10 w-10 ${iconColor}`} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{message}</p>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 border-2 border-gray-300 dark:border-gray-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 ${buttonColor} text-white px-6 py-3 rounded-lg font-semibold transition`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
