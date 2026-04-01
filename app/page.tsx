"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BookMarked, Eye, EyeOff, Shield, GraduationCap, Users } from "lucide-react";
import { useAuthStore, demoCredentials } from "@/store/auth";
import { useLanguageStore } from "@/store/language";
import { t } from "@/lib/i18n";
import LanguageSwitcher from "@/components/LanguageSwitcher";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const { lang } = useLanguageStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    const cred = demoCredentials.find((c) => c.email === email && c.password === password);
    if (cred) {
      login({ id: cred.id, name: cred.name, role: cred.role, email: cred.email });
      router.push(`/${cred.role}`);
    } else {
      setError(t("login", "invalidCredentials", lang));
    }
    setLoading(false);
  };

  const quickLogin = (cred: (typeof demoCredentials)[0]) => {
    setEmail(cred.email);
    setPassword(cred.password);
  };

  const roleCards = [
    { label: t("common", "admin", lang), icon: Shield, color: "bg-emerald-50 border-emerald-200 text-emerald-700", cred: demoCredentials[0] },
    { label: t("common", "teacher", lang), icon: GraduationCap, color: "bg-teal-50 border-teal-200 text-teal-700", cred: demoCredentials[1] },
    { label: t("common", "parent", lang), icon: Users, color: "bg-amber-50 border-amber-200 text-amber-700", cred: demoCredentials[2] },
  ];

  return (
    <div className="min-h-screen bg-[#faf9f6] flex flex-col items-center justify-center p-4">
      {/* Language Switcher at top-right */}
      <div className="fixed top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-600 rounded-2xl mb-4 shadow-lg shadow-emerald-100">
            <BookMarked className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{t("common", "appName", lang)}</h1>
          <p className="text-gray-500 text-sm mt-1">{t("common", "madrasaSystem", lang)}</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-2">{t("login", "welcomeBack", lang)}</h2>
          <p className="text-sm text-gray-500 mb-6">{t("login", "signInAccount", lang)}</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("login", "email", lang)}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("login", "enterEmail", lang)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t("login", "password", lang)}</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t("login", "enterPassword", lang)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 text-sm pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white font-semibold py-3.5 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2 text-sm"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  {t("login", "signingIn", lang)}
                </>
              ) : t("login", "signIn", lang)}
            </button>
          </form>
        </div>

        <div className="mt-6">
          <p className="text-center text-xs text-gray-500 mb-3">{t("login", "quickDemo", lang)}</p>
          <div className="grid grid-cols-3 gap-3">
            {roleCards.map(({ label, icon: Icon, color, cred }) => (
              <button
                key={label}
                onClick={() => quickLogin(cred)}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all active:scale-95 ${color}`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs font-semibold">{label}</span>
              </button>
            ))}
          </div>
          <div className="mt-4 bg-white rounded-2xl border border-gray-100 p-4 space-y-2">
            {demoCredentials.map((c) => (
              <div key={c.role} className="flex items-center justify-between text-xs text-gray-500">
                <span className="capitalize font-medium text-gray-700 w-16">{c.role}</span>
                <span className="flex-1 text-center">{c.email}</span>
                <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">{c.password}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
