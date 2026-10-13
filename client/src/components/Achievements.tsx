/**
 * واجهة إنجازات تفاعلية تعرض محطات الأثر التي تعتمدها إدارة الجمعية فقط.
 */
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { Award, CalendarDays, CheckCircle2, LoaderCircle, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type AchievementItem = {
  id: number;
  type: "news" | "event" | "achievement";
  title: string;
  summary: string;
  imageUrl: string | null;
  publishedAt: Date;
};

const formatDate = (value: Date) => new Intl.DateTimeFormat("ar-SA", { day: "numeric", month: "long", year: "numeric" }).format(new Date(value));

export default function Achievements() {
  const { data, isLoading } = trpc.content.publicList.useQuery();
  const achievements = useMemo(() => ((data ?? []) as AchievementItem[]).filter(item => item.type === "achievement"), [data]);
  const [activeId, setActiveId] = useState<number | null>(null);

  useEffect(() => {
    if (achievements.length > 0 && !achievements.some(item => item.id === activeId)) setActiveId(achievements[0]?.id ?? null);
  }, [achievements, activeId]);

  const activeIndex = Math.max(0, achievements.findIndex(item => item.id === activeId));
  const activeAchievement = achievements[activeIndex];
  const progress = achievements.length ? ((activeIndex + 1) / achievements.length) * 100 : 0;

  return (
    <section id="الإنجازات" className="relative isolate overflow-hidden bg-[#123f25] py-20 text-white lg:py-28">
      <div className="absolute inset-0 bg-[radial-gradient(70%_75%_at_88%_20%,rgba(230,189,103,0.18),transparent_60%),radial-gradient(62%_65%_at_10%_100%,rgba(26,124,171,0.22),transparent_63%)]" aria-hidden="true" />
      <div className="container relative z-10">
        <div className="grid gap-7 lg:grid-cols-[0.76fr_1.24fr] lg:items-end">
          <div>
            <p className="section-label !text-[#e6bd67] before:!bg-[#e6bd67]">لوحة الأثر</p>
            <h2 className="display-font mt-4 text-3xl font-extrabold leading-[1.55] sm:text-4xl">إنجازات تبدأ بفكرة، وتُروى بشفافية.</h2>
          </div>
          <p className="max-w-2xl text-base leading-8 text-white/75">نعرض هنا محطات الجمعية المعتمدة؛ لتبقى نتائج العمل والمبادرات قريبة من المجتمع، وتتحول التجربة الميدانية إلى معرفة يمكن مشاركتها.</p>
        </div>

        {isLoading ? <div className="mt-11 grid min-h-72 place-items-center rounded-bl-[3rem] rounded-tr-[3rem] border border-white/10 bg-white/5"><LoaderCircle className="h-7 w-7 animate-spin text-[#f2cd78]" /></div> : achievements.length > 0 && activeAchievement ? <div className="mt-11 grid gap-6 lg:grid-cols-[0.78fr_1.22fr]">
          <div className="rounded-bl-[2.6rem] rounded-tr-[2.6rem] border border-white/10 bg-white/5 p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3 px-2 pb-4">
              <span className="inline-flex items-center gap-2 text-xs font-bold text-[#f2cd78]"><Sparkles className="h-4 w-4" />محطات الأثر المعتمدة</span>
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-[0.68rem] font-bold text-white/70">{achievements.length} {achievements.length === 1 ? "إنجاز" : "إنجازات"}</span>
            </div>
            <div className="space-y-2">
              {achievements.map((item, index) => {
                const isActive = item.id === activeAchievement.id;
                return <button type="button" key={item.id} onClick={() => setActiveId(item.id)} aria-pressed={isActive} className={`group w-full rounded-2xl border p-4 text-right transition-all duration-200 active:scale-[0.98] ${isActive ? "border-[#e6bd67]/70 bg-[#e6bd67] text-[#155029] shadow-[0_10px_24px_rgba(0,0,0,0.16)]" : "border-transparent bg-white/[0.045] text-white hover:border-white/15 hover:bg-white/[0.09]"}`}>
                  <div className="flex items-center justify-between gap-4"><span className={`grid h-8 w-8 place-items-center rounded-full text-xs font-extrabold ${isActive ? "bg-[#155029] text-[#f2cd78]" : "bg-white/10 text-[#f2cd78]"}`}>{String(index + 1).padStart(2, "0")}</span><span className={`text-[0.68rem] font-bold ${isActive ? "text-[#155029]/75" : "text-white/50"}`}>محطة إنجاز</span></div>
                  <p className="display-font mt-3 text-base font-bold leading-7">{item.title}</p>
                </button>;
              })}
            </div>
          </div>

          <article className="relative min-h-[25rem] overflow-hidden rounded-bl-[4rem] rounded-tr-[4rem] border border-white/15 bg-[#0d4626] p-7 sm:p-9">
            {activeAchievement.imageUrl && <><img src={activeAchievement.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" /><div className="absolute inset-0 bg-gradient-to-l from-[#0d4626] via-[#0d4626]/92 to-[#0d4626]/50" /></>}
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-3"><span className="inline-flex items-center gap-2 rounded-full border border-[#e6bd67]/35 bg-[#e6bd67]/10 px-3 py-1.5 text-xs font-bold text-[#f2cd78]"><Award className="h-4 w-4" />إنجاز معتمد</span><time className="inline-flex items-center gap-1.5 text-xs font-bold text-white/65"><CalendarDays className="h-3.5 w-3.5 text-[#f2cd78]" />{formatDate(activeAchievement.publishedAt)}</time></div>
                <h3 className="display-font mt-9 max-w-2xl text-3xl font-extrabold leading-[1.5] sm:text-4xl">{activeAchievement.title}</h3>
                <p className="mt-5 max-w-2xl text-base leading-8 text-white/82">{activeAchievement.summary}</p>
              </div>
              <div className="mt-12 max-w-md"><div className="mb-3 flex items-center justify-between text-xs font-bold text-white/65"><span>استكشف محطات الإنجاز</span><span>{activeIndex + 1} / {achievements.length}</span></div><Progress value={progress} className="h-1.5 bg-white/15 [&_[data-slot=progress-indicator]]:bg-[#e6bd67]" /></div>
            </div>
          </article>
        </div> : <div className="relative mt-11 overflow-hidden rounded-bl-[3rem] rounded-tr-[3rem] border border-dashed border-[#e6bd67]/40 bg-white/5 p-7 sm:p-10">
          <div className="absolute -bottom-20 -left-16 h-56 w-56 rounded-full border-[20px] border-[#1a7cab]/15" aria-hidden="true" />
          <div className="relative z-10 max-w-2xl"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#e6bd67] text-[#155029]"><CheckCircle2 className="h-6 w-6" /></span><h3 className="display-font mt-6 text-2xl font-extrabold">الإنجازات المعتمدة ستظهر هنا.</h3><p className="mt-3 text-sm leading-7 text-white/75">تُحدّث هذه المساحة عند اعتماد أي محطة أثر أو نتيجة ميدانية، حتى تبقى المعلومات دقيقة وقابلة للتوثيق.</p></div>
        </div>}
      </div>
    </section>
  );
}
