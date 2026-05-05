import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#2C3E9A", "#5A6BCF", "#FFD23F", "#34D399", "#94A3B8"];

type TabKey = "myEvents" | "matchedVendors" | "attendees" | "costs";

const TAB_KEYS: TabKey[] = ["myEvents", "matchedVendors", "attendees", "costs"];

interface BudgetData {
  labelKey: string;
  allocated: number;
  used: number;
}

interface VendorSpendingData {
  name: string;
  value: number;
  count: number;
}

interface DashboardStatsProps {
  eventCount: number;
  budgetData: BudgetData[];
  vendorSpendingData: VendorSpendingData[];
}

export default function DashboardStats({ 
  eventCount, 
  budgetData, 
  vendorSpendingData 
}: DashboardStatsProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<TabKey>("myEvents");

  const totalSpent = useMemo(
    () => vendorSpendingData.reduce((sum, item) => sum + item.value, 0),
    [vendorSpendingData],
  );

  const tabDetails: Record<TabKey, { primary: string; secondary: string }> = {
    myEvents: {
      primary: t("stats.myEventsPrimary"),
      secondary: t("stats.myEventsSecondary"),
    },
    matchedVendors: {
      primary: t("stats.matchedVendorsPrimary"),
      secondary: t("stats.matchedVendorsSecondary"),
    },
    attendees: {
      primary: t("stats.attendeesPrimary"),
      secondary: t("stats.attendeesSecondary"),
    },
    costs: {
      primary: t("stats.costsPrimary"),
      secondary: t("stats.costsSecondary"),
    },
  };

  return (
    <section className="mb-8 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 lg:p-8 shadow-sm">
      <h2 className="text-2xl font-bold text-neutral dark:text-white mb-6">
        {t("stats.overview")}
      </h2>

      <div className="grid lg:grid-cols-3 gap-5 mb-6">
        <div className="lg:col-span-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-background dark:bg-gray-900 p-5">
          <h3 className="text-lg font-semibold text-neutral dark:text-white mb-4">
            {t("stats.budgets")}
          </h3>
          <div className="space-y-5">
            {budgetData.map((budget) => {
              const progress = Math.min(100, Math.round((budget.used / budget.allocated) * 100));
              return (
                <div key={budget.labelKey}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-neutral dark:text-gray-100">
                      {t(budget.labelKey)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {budget.used.toLocaleString()} / {budget.allocated.toLocaleString()} RWF
                    </p>
                  </div>
                  <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-primary-soft" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-background dark:bg-gray-900 p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t("dashboard.myEvents")}</p>
            <p className="text-2xl font-bold text-primary dark:text-cyan-400">{eventCount}</p>
          </div>
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-background dark:bg-gray-900 p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{t("dashboard.totalSpent")}</p>
            <p className="text-2xl font-bold text-primary-soft dark:text-white">
              {totalSpent >= 1000000 
                ? `${(totalSpent / 1000000).toFixed(2)}M RWF`
                : `${totalSpent.toLocaleString()} RWF`
              }
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-5 mb-6">
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-background dark:bg-gray-900 p-5">
          <h3 className="text-lg font-semibold text-neutral dark:text-white mb-4">
            {t("stats.spendingByCategory")}
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={vendorSpendingData} cx="50%" cy="50%" innerRadius={50} outerRadius={82} paddingAngle={2} dataKey="value">
                {vendorSpendingData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => `${Number(value ?? 0).toLocaleString()} RWF`}
                contentStyle={{ borderRadius: "10px", border: "1px solid #e5e7eb" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-background dark:bg-gray-900 p-5">
          <h3 className="text-lg font-semibold text-neutral dark:text-white mb-4">
            {t("stats.vendorServicesBooked")}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400">
                  <th className="pb-3 font-medium">{t("stats.typeOfService")}</th>
                  <th className="pb-3 font-medium">{t("stats.bookings")}</th>
                  <th className="pb-3 font-medium text-right">{t("stats.cost")}</th>
                </tr>
              </thead>
              <tbody>
                {vendorSpendingData.length > 0 ? (
                  vendorSpendingData.map((vendor) => (
                    <tr key={vendor.name} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 text-neutral dark:text-gray-100">{vendor.name}</td>
                      <td className="py-3 text-neutral dark:text-gray-100">{vendor.count}</td>
                      <td className="py-3 text-right font-semibold text-primary-soft dark:text-white">
                        {vendor.value.toLocaleString()} RWF
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-gray-500 dark:text-gray-400">
                      {t("stats.noBookingsYet")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-background dark:bg-gray-900 p-5">
        <div className="flex flex-wrap gap-2 mb-4">
          {TAB_KEYS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === tab
                  ? "bg-primary text-white"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {t(`stats.tab_${tab}`)}
            </button>
          ))}
        </div>
        <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-4">
          <p className="text-lg font-semibold text-neutral dark:text-white">{tabDetails[activeTab].primary}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{tabDetails[activeTab].secondary}</p>
        </div>
      </div>
    </section>
  );
}
