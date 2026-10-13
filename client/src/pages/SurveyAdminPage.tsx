import SurveyAdminPanel from "@/components/SurveyAdminPanel";
import DashboardLayout from "@/components/DashboardLayout";

export default function SurveyAdminPage() {
  return <DashboardLayout><div className="mx-auto max-w-6xl" dir="rtl"><div className="mb-7 flex flex-col justify-between gap-4 rounded-bl-[2.6rem] rounded-tr-[2.6rem] bg-[#155029] px-6 py-7 text-white shadow-[0_14px_30px_rgba(22,91,42,0.15)] sm:flex-row sm:items-center sm:px-8"><div><p className="text-xs font-bold tracking-[0.14em] text-[#f2cd78]">مركز إدارة الجمعية</p><h1 className="display-font mt-2 text-2xl font-extrabold">الاستبيانات والنتائج</h1><p className="mt-2 text-sm text-white/75">أنشئ الاستبيانات المعتمدة، انشرها للزوار، وتابع النتائج المجمعة.</p></div><a href="/admin" className="text-sm font-bold text-[#f2cd78] hover:text-white">العودة إلى لوحة الإدارة</a></div><SurveyAdminPanel /></div></DashboardLayout>;
}
