import BackToTop from "@/components/BackToTop";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { trpc } from "@/lib/trpc";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  Copy,
  LoaderCircle,
  Share2,
  Sprout,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useRoute } from "wouter";
import { toast } from "sonner";

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

const formatDate = (value: Date) =>
  new Intl.DateTimeFormat("ar-SA", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));

export default function NewsDetail() {
  const [, params] = useRoute("/news/:id");
  const id = Number(params?.id);
  const [copied, setCopied] = useState(false);

  const newsQuery = trpc.content.publicNewsById.useQuery(
    { id: Number.isInteger(id) && id > 0 ? id : 0 },
    { enabled: Number.isInteger(id) && id > 0 }
  );

  const listQuery = trpc.content.publicList.useQuery();

  const relatedNews = useMemo(() => {
    if (!listQuery.data) return [];
    return ((listQuery.data as ContentItem[]) ?? [])
      .filter(item => item.type === "news" && item.id !== id)
      .slice(0, 3);
  }, [listQuery.data, id]);

  const handleShare = async () => {
    const url = window.location.href;
    const title = newsQuery.data?.title || "خبر من الجمعية التعاونية الزراعية للتطوير والاستدامة";
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: newsQuery.data?.summary,
          url,
        });
        toast.success("تمت المشاركة بنجاح");
        return;
      } catch (err) {
        // Fallback to clipboard if share was canceled or unavailable
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("تم نسخ رابط الخبر إلى الحافظة بنجاح");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("تعذر نسخ الرابط تلقائيًا");
    }
  };

  if (newsQuery.isLoading) {
    return (
      <div className="site-shell min-h-screen bg-[#fbf8ed]" dir="rtl">
        <SiteHeader />
        <main className="grid min-h-[60vh] place-items-center">
          <div className="flex flex-col items-center gap-3">
            <LoaderCircle className="h-9 w-9 animate-spin text-[#165B2A]" />
            <p className="text-sm font-bold text-[#58735f]">جاري تحميل الخبر...</p>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  if (newsQuery.error || !newsQuery.data) {
    return (
      <div className="site-shell min-h-screen bg-[#fbf8ed]" dir="rtl">
        <SiteHeader />
        <main className="grid min-h-[60vh] place-items-center px-5 text-center">
          <div className="max-w-md">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#e8f0df] text-[#165B2A]">
              <Sprout className="h-8 w-8" />
            </span>
            <h1 className="display-font mt-6 text-3xl font-extrabold text-[#155029]">
              هذا الخبر غير متاح
            </h1>
            <p className="mt-3 leading-8 text-[#58735f]">
              قد يكون الخبر غير منشور أو تم تعديل رابطه، يمكنك تصفح بقية الأخبار المنشورة في المركز الإعلامي.
            </p>
            <Link
              href="/news"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#165B2A] px-6 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-0.5 active:scale-[0.97]"
            >
              <ArrowRight className="h-4 w-4" />
              العودة إلى قائمة الأخبار
            </Link>
          </div>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const news = newsQuery.data;
  const paragraphs = (news.body || news.summary).split(/\n{2,}/).filter(Boolean);

  return (
    <div className="site-shell min-h-screen overflow-x-hidden bg-[#fbf8ed] text-[#173d26]" dir="rtl">
      <SiteHeader />

      <main>
        {/* Article Header & Navigation */}
        <section className="bg-[#f0eedf] py-8 border-b border-[#e5ddc4]">
          <div className="container max-w-4xl">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Link
                href="/news"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#165B2A] transition-colors hover:text-[#a56c18]"
              >
                <ArrowRight className="h-4 w-4" />
                العودة إلى قائمة الأخبار
              </Link>

              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-2 rounded-full border border-[#d9c995] bg-white px-4 py-2 text-xs font-bold text-[#155029] shadow-sm transition-all hover:bg-[#e8f0df] active:scale-95"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span>تم النسخ</span>
                  </>
                ) : (
                  <>
                    <Share2 className="h-3.5 w-3.5 text-[#a67017]" />
                    <span>مشاركة الخبر</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* Main Article Content */}
        <article className="container max-w-4xl py-12 sm:py-16">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#e8f0df] px-3.5 py-1.5 text-xs font-bold text-[#165B2A]">
            <Sprout className="h-3.5 w-3.5 text-[#a67017]" />
            أخبار الجمعية والتنمية
          </div>

          <h1 className="display-font mt-5 text-3xl font-extrabold leading-[1.5] text-[#155029] sm:text-5xl">
            {news.title}
          </h1>

          <div className="mt-6 flex flex-wrap items-center gap-4 border-b border-[#e3d9be] pb-6 text-sm font-medium text-[#7d6836]">
            <span className="flex items-center gap-2 font-bold text-[#a67017]">
              <CalendarDays className="h-4 w-4" />
              <time>{formatDate(news.publishedAt)}</time>
            </span>
            <span className="text-stone-300">•</span>
            <span className="flex items-center gap-1.5 text-xs text-[#597561]">
              <Clock3 className="h-3.5 w-3.5" />
              وقت القراءة: دقيقتان
            </span>
          </div>

          {/* Featured Image */}
          {news.imageUrl && (
            <figure className="mt-8 overflow-hidden rounded-bl-[3.5rem] rounded-tr-[3.5rem] border border-[#dfd2ae] bg-[#e8f0df] shadow-[0_18px_45px_rgba(22,91,42,0.09)]">
              <img
                src={news.imageUrl}
                alt={news.title}
                className="warm-documentary max-h-[34rem] w-full object-cover"
              />
            </figure>
          )}

          {/* Lead Summary */}
          <div className="mt-10 rounded-2xl border-r-4 border-[#dba83c] bg-[#f5f1df]/80 p-6 sm:p-8">
            <p className="display-font text-lg font-bold leading-9 text-[#155029] sm:text-xl">
              {news.summary}
            </p>
          </div>

          {/* Body Paragraphs */}
          <div className="mt-8 space-y-6 text-base leading-9 text-[#42614d] sm:text-lg sm:leading-10">
            {paragraphs.map((paragraph: string, index: number) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          {/* Share & Back Action Card */}
          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#d9c995] bg-[#f5f1df] p-6">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-[#165B2A] text-white">
                <Share2 className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-bold text-[#155029]">أعجبك المحتوى؟</p>
                <p className="text-xs text-[#6a8470]">شاركه مع زملائك والمهتمين بالقطاع الزراعي</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-2 rounded-full bg-[#165B2A] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-transform hover:-translate-y-0.5 active:scale-95"
              >
                <Copy className="h-3.5 w-3.5" />
                نسخ الرابط
              </button>

              <Link
                href="/news"
                className="inline-flex items-center gap-1.5 rounded-full border border-[#165B2A] px-4 py-2 text-xs font-bold text-[#165B2A] transition-colors hover:bg-white"
              >
                جميع الأخبار
              </Link>
            </div>
          </div>
        </article>

        {/* Related News Section */}
        {relatedNews.length > 0 && (
          <section className="border-t border-[#ded4b7] bg-[#f5f2e5] py-16 lg:py-20">
            <div className="container max-w-5xl">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <span className="section-label">مستجدات أخرى</span>
                  <h2 className="display-font mt-2 text-2xl font-extrabold text-[#155029] sm:text-3xl">
                    أخبار ذات صلة
                  </h2>
                </div>
                <Link
                  href="/news"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#165B2A] hover:underline"
                >
                  عرض كافة الأخبار
                  <ArrowLeft className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {relatedNews.map(item => (
                  <article
                    key={item.id}
                    className="group flex flex-col justify-between overflow-hidden rounded-bl-[2.2rem] rounded-tr-[2.2rem] border border-[#d9c995] bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
                  >
                    <div>
                      {item.imageUrl ? (
                        <div className="h-40 overflow-hidden bg-[#e8f0df]">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="warm-documentary h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      ) : (
                        <div className="h-2 bg-[#dba83c]" />
                      )}
                      <div className="p-5">
                        <time className="text-xs font-bold text-[#a67017]">
                          {formatDate(item.publishedAt)}
                        </time>
                        <h3 className="display-font mt-2 text-base font-bold leading-7 text-[#155029] group-hover:text-[#a67017]">
                          {item.title}
                        </h3>
                        <p className="mt-2 line-clamp-2 text-xs leading-6 text-[#58735f]">
                          {item.summary}
                        </p>
                      </div>
                    </div>
                    <div className="p-5 pt-0">
                      <Link
                        href={`/news/${item.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#165B2A] transition-colors hover:text-[#a67017]"
                      >
                        قراءة الخبر
                        <ArrowLeft className="h-3 w-3" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <BackToTop />
      <SiteFooter />
    </div>
  );
}
