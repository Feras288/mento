import BackToTop from "@/components/BackToTop";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, CalendarDays, Filter, Newspaper, Search, Sparkles, Sprout } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "wouter";

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
  if (!value) return "مؤخرًا";
  return new Intl.DateTimeFormat("ar-SA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
};

function NewsSkeleton() {
  return (
    <div className="overflow-hidden rounded-bl-[2.5rem] rounded-tr-[2.5rem] border border-[#d9c995]/50 bg-white shadow-sm">
      <div className="h-48 animate-pulse bg-[#e8f0df]" />
      <div className="p-6 space-y-3">
        <div className="h-4 w-24 animate-pulse rounded bg-[#e8f0df]" />
        <div className="h-6 w-3/4 animate-pulse rounded bg-[#e8f0df]" />
        <div className="h-4 w-full animate-pulse rounded bg-[#e8f0df]" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-[#e8f0df]" />
        <div className="pt-3">
          <div className="h-9 w-32 animate-pulse rounded-full bg-[#e8f0df]" />
        </div>
      </div>
    </div>
  );
}

export default function NewsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const { data, isLoading } = trpc.content.publicList.useQuery();

  const newsItems = useMemo(() => {
    const list = ((data ?? []) as ContentItem[]).filter(item => item.type === "news");
    return list.filter(item => {
      const matchesSearch =
        searchTerm.trim() === "" ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [data, searchTerm]);

  return (
    <div className="site-shell min-h-screen bg-[#fbf8ed] text-[#173d26]" dir="rtl">
      <SiteHeader />

      <main>
        {/* Hero Section */}
        <section className="grain-layer relative isolate overflow-hidden bg-[#f0eedf] py-14 lg:py-20">
          <div
            className="absolute -left-20 top-8 h-72 w-72 rounded-full border-[28px] border-[#e6bd67]/20"
            aria-hidden="true"
          />
          <div className="container relative z-10 max-w-4xl text-center">
            <span className="section-label mx-auto inline-flex items-center gap-2">
              <Newspaper className="h-4 w-4" />
              المركز الإعلامي
            </span>
            <h1 className="display-font mt-4 text-3xl font-extrabold leading-[1.4] text-[#155029] sm:text-5xl">
              أخبار الجمعية ومستجدات الميدان
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#486653] sm:text-lg">
              نافذتكم الموثوقة للاطلاع على أحدث المبادرات، والاتفاقيات، والمشاريع الزراعية التي تقودها الجمعية نحو تنمية مستدامة وأثر مجتمعي ملموس.
            </p>

            {/* Search Input */}
            <div className="mx-auto mt-8 max-w-xl">
              <div className="relative flex items-center rounded-full border border-[#d9c995] bg-white px-4 py-2 shadow-[0_8px_20px_rgba(22,91,42,0.06)] focus-within:border-[#165B2A] focus-within:ring-2 focus-within:ring-[#165B2A]/20">
                <Search className="h-5 w-5 text-[#a67017]" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="ابحث في أخبار الجمعية ومشاريعها..."
                  className="w-full bg-transparent px-3 py-1.5 text-sm font-medium text-[#173d26] placeholder:text-[#8ba293] outline-none"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="text-xs font-bold text-[#a67017] hover:underline"
                  >
                    مسح
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* News Grid Section */}
        <section className="py-16 lg:py-24">
          <div className="container">
            {isLoading ? (
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, index) => (
                  <NewsSkeleton key={index} />
                ))}
              </div>
            ) : newsItems.length > 0 ? (
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {newsItems.map(item => (
                  <article
                    key={item.id}
                    className="group flex flex-col justify-between overflow-hidden rounded-bl-[2.8rem] rounded-tr-[2.8rem] border border-[#d9c995] bg-white shadow-[0_12px_32px_rgba(22,91,42,0.07)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(22,91,42,0.13)]"
                  >
                    <div>
                      {/* Image Frame */}
                      <div className="relative flex h-52 items-center justify-center overflow-hidden bg-[#e8f0df]">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="warm-documentary h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="grid h-full w-full place-items-center bg-[#155029] text-[#e6bd67]">
                            <Sprout className="h-12 w-12 opacity-40" />
                          </div>
                        )}
                        <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-[#155029] shadow-sm backdrop-blur">
                          <Sprout className="h-3 w-3 text-[#a67017]" />
                          خبر وتطوير
                        </span>
                      </div>

                      {/* Content */}
                      <div className="p-6 sm:p-7">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#a67017]">
                          <CalendarDays className="h-3.5 w-3.5" />
                          <time>{formatDate(item.publishedAt)}</time>
                        </div>

                        <h2 className="display-font mt-3 text-xl font-bold leading-8 text-[#155029] transition-colors group-hover:text-[#a67017]">
                          {item.title}
                        </h2>

                        <p className="mt-3 line-clamp-3 text-sm leading-7 text-[#58735f]">
                          {item.summary}
                        </p>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="p-6 pt-0 sm:p-7 sm:pt-0">
                      <Link
                        href={`/news/${item.id}`}
                        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-[#165B2A] bg-transparent px-5 text-sm font-bold text-[#165B2A] transition-all duration-200 group-hover:bg-[#165B2A] group-hover:text-white active:scale-95 sm:w-auto"
                      >
                        قراءة الخبر
                        <ArrowLeft className="h-4 w-4" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mx-auto max-w-lg rounded-bl-[3rem] rounded-tr-[3rem] border border-dashed border-[#b8cdad] bg-white p-12 text-center shadow-sm">
                <Newspaper className="mx-auto h-12 w-12 text-[#a67017]" />
                <h3 className="display-font mt-4 text-xl font-bold text-[#155029]">
                  لا توجد أخبار تطابق البحث حاليًا
                </h3>
                <p className="mt-2 text-sm leading-7 text-[#58735f]">
                  يرجى تجربة كلمات بحث أخرى أو مسح شريط البحث لعرض كافة الأخبار المنشورة.
                </p>
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm("")}
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#165B2A] px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#10461f]"
                  >
                    عرض جميع الأخبار
                  </button>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      <BackToTop />
      <SiteFooter />
    </div>
  );
}
