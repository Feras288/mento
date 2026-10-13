/**
 * توجه «الأثر الأخضر»: موجز حيّ للأخبار والفعاليات مع مسار زمني هادئ وواضح.
 */
import { trpc } from "@/lib/trpc";
import { ArrowLeft, CalendarDays, MapPin, Newspaper, Sprout } from "lucide-react";

type ContentItem = {
  id: number;
  type: "news" | "event" | "achievement";
  title: string;
  summary: string;
  body: string | null;
  imageUrl: string | null;
  publishedAt: Date;
  eventStartsAt: Date | null;
  eventLocation: string | null;
};

const formatDate = (value: Date | null) => {
  if (!value) return "قريبًا";
  return new Intl.DateTimeFormat("ar-SA", { day: "numeric", month: "long", year: "numeric" }).format(new Date(value));
};

function UpdateSkeleton() {
  return <div className="h-44 animate-pulse rounded-bl-[2.2rem] rounded-tr-[2.2rem] bg-[#e5eadf]" />;
}

function EmptyUpdates({ type }: { type: "news" | "event" }) {
  const isNews = type === "news";
  const title = isNews ? "الميدان يكتب قصته أولًا بأول." : "مساحات قادمة للتعلّم والتعاون.";
  const text = isNews
    ? "تُحدَّث هذه المساحة مباشرة من إدارة الجمعية لتعرض المبادرات والبرامج وما يتحقق من أثر في الميدان."
    : "تُعلن هنا اللقاءات والورش والزيارات الميدانية التي تفتح للمجتمع الزراعي بابًا للمشاركة والمعرفة.";
  return (
    <div className={`relative flex min-h-48 overflow-hidden rounded-bl-[2.2rem] rounded-tr-[2.2rem] border border-dashed p-6 ${isNews ? "border-[#c6d7bd] bg-[#f1f5ed]" : "border-white/25 bg-white/5"}`}>
      <div className={`absolute bottom-0 left-0 h-12 w-full opacity-75 ${isNews ? "bg-[radial-gradient(120%_130%_at_50%_120%,transparent_55%,#165B2A_56%_58%,transparent_59%_68%,#1A7CAB_69%_71%,transparent_72%)]" : "bg-[radial-gradient(120%_130%_at_50%_120%,transparent_55%,#E6BD67_56%_58%,transparent_59%_68%,#1A7CAB_69%_71%,transparent_72%)]"}`} />
      <div className="relative z-10 flex max-w-md flex-col justify-center">
        <Sprout className={`h-6 w-6 ${isNews ? "text-[#b17816]" : "text-[#f2cd78]"}`} strokeWidth={1.6} />
        <p className={`display-font mt-4 text-lg font-bold ${isNews ? "text-[#155029]" : "text-white"}`}>{title}</p>
        <p className={`mt-2 text-sm leading-7 ${isNews ? "text-[#58735f]" : "text-white/75"}`}>{text}</p>
      </div>
    </div>
  );
}

export default function LatestUpdates() {
  const { data, isLoading } = trpc.content.publicList.useQuery();
  const published = (data ?? []) as ContentItem[];
  const latestNews = published.filter(item => item.type === "news").slice(0, 3);
  const upcomingEvents = published
    .filter(item => item.type === "event")
    .sort((a, b) => Number(new Date(a.eventStartsAt ?? a.publishedAt)) - Number(new Date(b.eventStartsAt ?? b.publishedAt)))
    .slice(0, 3);

  return (
    <section id="الأخبار" className="route-map relative isolate bg-[#fbf8ed] py-20 lg:py-28">
      <div className="container relative z-10">
        <div className="grid gap-7 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
          <div>
            <p className="section-label">من ميدان الجمعية</p>
            <h2 className="display-font mt-4 text-3xl font-extrabold leading-[1.5] text-[#155029] sm:text-4xl">آخر الأخبار وما هو قادم.</h2>
          </div>
          <p className="max-w-xl text-base leading-8 text-[#516f5d]">تابع مستجدات المبادرات والبرامج، واكتشف الفعاليات التي تتيح للمجتمع الزراعي مساحة للمعرفة والتعاون.</p>
        </div>

        <div className="mt-11 grid gap-9 lg:grid-cols-[1.16fr_0.84fr]">
          <div>
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-[#165B2A] text-white"><Newspaper className="h-4 w-4" /></span>
                <h3 className="display-font text-xl font-bold text-[#155029]">أحدث الأخبار</h3>
              </div>
              <a href="/news" className="inline-flex items-center gap-1 text-xs font-bold text-[#165B2A] transition-colors hover:text-[#a56c18]">
                كافة الأخبار <ArrowLeft className="h-3.5 w-3.5" />
              </a>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {isLoading ? Array.from({ length: 3 }).map((_, index) => <UpdateSkeleton key={index} />) : latestNews.length > 0 ? latestNews.map(item => (
                <article key={item.id} className="group overflow-hidden rounded-bl-[2.2rem] rounded-tr-[2.2rem] border border-[#e5ddc4] bg-white shadow-[0_10px_28px_rgba(22,91,42,0.06)] transition-transform duration-200 hover:-translate-y-1">
                  {item.imageUrl ? <div className="flex h-40 items-center justify-center bg-[#edf2e9] p-2"><img src={item.imageUrl} alt="" className="warm-documentary h-full w-full object-contain" /></div> : <div className="h-2 bg-[#dba83c]" />}
                  <div className="p-5">
                    <time className="text-xs font-bold text-[#a56c18]">{formatDate(item.publishedAt)}</time>
                    <h4 className="display-font mt-2 text-base font-bold leading-7 text-[#155029]">{item.title}</h4>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#58735f]">{item.summary}</p>
                    <a href={`/news/${item.id}`} className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#165B2A] transition-colors hover:text-[#a56c18]">قراءة الخبر <ArrowLeft className="h-3.5 w-3.5" /></a>
                  </div>
                </article>
              )) : <div className="sm:col-span-2 xl:col-span-3"><EmptyUpdates type="news" /></div>}
            </div>
          </div>

          <div className="rounded-bl-[3rem] rounded-tr-[3rem] bg-[#165B2A] p-6 text-white sm:p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-[#e6bd67] text-[#155029]"><CalendarDays className="h-4 w-4" /></span>
                <h3 className="display-font text-xl font-bold">فعاليات قادمة</h3>
              </div>
              <a href="/events" className="inline-flex items-center gap-1 text-xs font-bold text-[#e6bd67] hover:underline">
                عرض الكل <ArrowLeft className="h-3 w-3" />
              </a>
            </div>
            <div className="mt-6 space-y-1">
              {isLoading ? Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-20 animate-pulse border-b border-white/15" />) : upcomingEvents.length > 0 ? upcomingEvents.map(item => (
                <article key={item.id} className="border-b border-white/15 py-4 last:border-b-0">
                  <time className="text-xs font-bold text-[#f2cd78]">{formatDate(item.eventStartsAt)}</time>
                  <h4 className="display-font mt-1 text-base font-bold leading-7">{item.title}</h4>
                  {item.eventLocation && <span className="mt-2 inline-flex items-center gap-1.5 text-xs text-white/75"><MapPin className="h-3.5 w-3.5" />{item.eventLocation}</span>}
                </article>
              )) : <EmptyUpdates type="event" />}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
