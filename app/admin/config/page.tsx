"use client";
import { DashboardLayout } from "@/components/DashboardLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { madrasaConfig } from "@/mock-data";
import { Settings, Save } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

export default function AdminConfigPage() {
  const [config, setConfig] = useState(madrasaConfig);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <DashboardLayout>
      <PageHeader title="Madrasa Configuration" subtitle="System settings" icon={Settings} />

      <div className="space-y-5 max-w-2xl">
        {/* Basic Info */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-4">Basic Information</p>
          <div className="space-y-4">
            {[
              { label: "Madrasa Name", key: "name" },
              { label: "Samastha Reg. Number", key: "samasthaRegNumber" },
              { label: "Address", key: "address" },
              { label: "Phone", key: "phone" },
              { label: "Email", key: "email" },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input
                  value={config[key as keyof typeof config] as string}
                  onChange={(e) => setConfig({ ...config, [key]: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Academic Settings */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <p className="text-xs font-semibold text-teal-600 uppercase tracking-wide mb-4">Academic Settings</p>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-gray-900">Division Enabled</p>
                <p className="text-xs text-gray-500">Class A, B divisions</p>
              </div>
              <button
                onClick={() => setConfig({ ...config, divisionEnabled: !config.divisionEnabled })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${config.divisionEnabled ? "bg-emerald-600" : "bg-gray-300"}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config.divisionEnabled ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Teaching Model</label>
              <div className="space-y-2">
                {[
                  { value: "single_teacher", label: "Single Teacher Per Class", desc: "One teacher handles all subjects" },
                  { value: "subject_based", label: "Subject Based Teachers", desc: "Different teachers per subject" },
                ].map(({ value, label, desc }) => (
                  <label key={value} className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${config.teachingModel === value ? "border-emerald-500 bg-emerald-50" : "border-gray-100 hover:border-gray-200"}`}>
                    <input
                      type="radio"
                      name="teachingModel"
                      value={value}
                      checked={config.teachingModel === value}
                      onChange={() => setConfig({ ...config, teachingModel: value })}
                      className="mt-0.5 accent-emerald-600"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{label}</p>
                      <p className="text-xs text-gray-500">{desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Fee Settings */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-4">Fee Settings</p>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-gray-900">Fee System Enabled</p>
                <p className="text-xs text-gray-500">Enable fee tracking and reminders</p>
              </div>
              <button
                onClick={() => setConfig({ ...config, feeEnabled: !config.feeEnabled })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${config.feeEnabled ? "bg-emerald-600" : "bg-gray-300"}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config.feeEnabled ? "translate-x-6" : "translate-x-1"}`} />
              </button>
            </div>
            {config.feeEnabled && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Fee Amount (₹)</label>
                  <input
                    type="number"
                    value={config.monthlyFeeAmount}
                    onChange={(e) => setConfig({ ...config, monthlyFeeAmount: Number(e.target.value) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                  />
                </div>
              </motion.div>
            )}
          </div>
        </div>

        <button
          onClick={handleSave}
          className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold text-sm transition-colors ${saved ? "bg-emerald-100 text-emerald-700" : "bg-emerald-600 text-white hover:bg-emerald-700"}`}
        >
          <Save className="w-4 h-4" />
          {saved ? "✅ Settings Saved!" : "Save Configuration"}
        </button>
      </div>
    </DashboardLayout>
  );
}
