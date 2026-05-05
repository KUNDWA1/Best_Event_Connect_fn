import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Smartphone, CreditCard, Building2 } from "lucide-react";

interface PaymentModalProps {
  vendor: { name: string; service: string; price: number };
  eventName: string;
  onClose: () => void;
  onPaymentSuccess: () => void;
}

export default function PaymentModal({ vendor, eventName, onClose, onPaymentSuccess }: PaymentModalProps) {
  const { t } = useTranslation();
  const [paymentMethod, setPaymentMethod] = useState<"momo" | "card" | "bank">("momo");
  const [formData, setFormData] = useState({ phone: "", cardNumber: "", cardExpiry: "", cardCvv: "", accountNumber: "", bankName: "" });
  const [processing, setProcessing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setTimeout(() => { setProcessing(false); onPaymentSuccess(); onClose(); }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-primary via-neutral to-primary-soft text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">{t('payment.title')}</h2>
            <button onClick={onClose} className="text-white hover:bg-white hover:bg-opacity-20 w-8 h-8 rounded-full">✕</button>
          </div>
        </div>

        <div className="p-6">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">Booking Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Vendor:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{vendor.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Service:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{vendor.service}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Event:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{eventName}</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2 flex justify-between">
                <span className="text-gray-600 dark:text-gray-300 font-semibold">
                  {t('payment.amount')}:
                </span>
                <span className="text-2xl font-bold text-primary">
                  {vendor.price.toLocaleString()} RWF
                </span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-3 text-gray-700 dark:text-gray-300">
                {t('payment.paymentMethod')}
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("momo")}
                  className={`p-4 border-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
                    paymentMethod === "momo"
                      ? "border-primary bg-blue-50 dark:bg-primary/20 text-primary dark:text-white"
                      : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-gray-400 dark:hover:border-gray-500"
                  }`}
                >
                  <Smartphone className="w-5 h-5" /> Mobile Money
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`p-4 border-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
                    paymentMethod === "card"
                      ? "border-primary bg-blue-50 dark:bg-primary/20 text-primary dark:text-white"
                      : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-gray-400 dark:hover:border-gray-500"
                  }`}
                >
                  <CreditCard className="w-5 h-5" /> Card
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod("bank")}
                  className={`p-4 border-2 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
                    paymentMethod === "bank"
                      ? "border-primary bg-blue-50 dark:bg-primary/20 text-primary dark:text-white"
                      : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-gray-400 dark:hover:border-gray-500"
                  }`}
                >
                  <Building2 className="w-5 h-5" /> Bank
                </button>
              </div>
            </div>

            {paymentMethod === "momo" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Mobile Money Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="+250 XXX XXX XXX"
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    MTN Mobile Money or Airtel Money
                  </p>
                </div>
              </div>
            )}

            {paymentMethod === "card" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={formData.cardNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, cardNumber: e.target.value })
                    }
                    placeholder="1234 5678 9012 3456"
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      value={formData.cardExpiry}
                      onChange={(e) =>
                        setFormData({ ...formData, cardExpiry: e.target.value })
                      }
                      placeholder="MM/YY"
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      CVV
                    </label>
                    <input
                      type="text"
                      value={formData.cardCvv}
                      onChange={(e) =>
                        setFormData({ ...formData, cardCvv: e.target.value })
                      }
                      placeholder="123"
                      required
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === "bank" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Bank Name
                  </label>
                  <select
                    value={formData.bankName}
                    onChange={(e) =>
                      setFormData({ ...formData, bankName: e.target.value })
                    }
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select Bank</option>
                    <option value="Bank of Kigali">Bank of Kigali</option>
                    <option value="Equity Bank">Equity Bank</option>
                    <option value="I&M Bank">I&M Bank</option>
                    <option value="Cogebanque">Cogebanque</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Account Number
                  </label>
                  <input
                    type="text"
                    value={formData.accountNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        accountNumber: e.target.value,
                      })
                    }
                    placeholder="Enter account number"
                    required
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                {t('payment.cancel')}
              </button>
              <button
                type="submit"
                disabled={processing}
                className="flex-1 bg-gradient-to-r from-primary to-primary-soft text-white px-6 py-3 rounded-lg font-semibold hover:from-primary-soft hover:to-primary disabled:opacity-50"
              >
                {processing ? 'Processing...' : t('payment.pay')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
