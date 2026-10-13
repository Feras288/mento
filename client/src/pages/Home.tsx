/**
 * الجمعية التعاونية الزراعية للتطوير والاستدامة
 * الصفحة الرئيسية: توجه «الأثر الأخضر»، هوية سعودية زراعية مستدامة.
 */
import BackToTop from "@/components/BackToTop";
import { Button } from "@/components/ui/button";
import Achievements from "@/components/Achievements";
import LatestUpdates from "@/components/LatestUpdates";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import UpcomingEvents from "@/components/UpcomingEvents";
import { activities, focusAreas, objectives } from "@/content/siteContent";
import {
  ArrowLeft,
  ChevronLeft,
  Droplets,
  Leaf,
  ShieldCheck,
  Sprout,
  Trees,
  UsersRound,
} from "lucide-react";

const markUrl = "/storage/acsd-ecosystem-mark_bb9ed866.png";

const homeStats = [
  { value: "+1,200", label: "مزارع ومستفيد", desc: "برامج إرشادية وتدريبية", Icon: UsersRound },
  { value: "40%", label: "رفع كفاءة المياه", desc: "بحلول وتقنيات الري الحديث", Icon: Droplets },
  { value: "+15,000", label: "شتلة وشجرة", desc: "لتنمية الغطاء النباتي المستدام", Icon: Trees },
  { value: "100%", label: "حوكمة وشفافية", desc: "امتثال كامل للأنظمة التعاونية", Icon: ShieldCheck },
];

export default function Home() {
  const FeaturedActivityIcon = activities[0].Icon;

  return (
    <div className="site-shell min-h-screen bg-[#fbf8ed] text-[#173d26]" dir="rtl">
      <SiteHeader />

      <main>
        {/* Hero Section */}
        <section id="الرئيسية" className="grain-layer relative isolate overflow-hidden bg-[#f1efdF] pt-7 sm:pt-9 md:pt-14">
          <div className="container relative z-10 grid items-stretch gap-6 pb-16 sm:gap-8 sm:pb-20 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14 lg:pb-24">
            <div className="order-2 flex flex-col justify-center pb-2 sm:pb-4 lg:order-1 lg:pb-12">
              <div className="reveal-up">
                <span className="section-label">نزرع الأثر المشترك</span>
                <h1 className="display-font mt-4 max-w-2xl text-[2.3rem] font-extrabold leading-[1.4] tracking-tight text-[#155029] sm:text-5xl lg:text-[3.6rem] lg:leading-[1.35]">
                  معًا نحو أرضٍ <span className="relative whitespace-nowrap text-[#ad761c]">أكثر عطاءً<span className="absolute -bottom-1 right-0 h-1.5 w-full bg-[#d8aa47]/55" /></span> واستدامة
                </h1>
                <p className="mt-6 max-w-xl text-base font-medium leading-8 text-[#456351] sm:text-lg">
                  الجمعية التعاونية الزراعية للتطوير والاستدامة تجمع المعرفة والمبادرة والتعاون؛ لتطوير قطاع زراعي يحقق قيمة دائمة للمزارع والمجتمع والبيئة.
                </p>
              </div>

              {/* Exact Requested Hero Buttons */}
              <div className="reveal-up-delay mt-7 grid gap-3 sm:mt-8 sm:flex sm:flex-wrap sm:items-center">
                <a href="/about">
                  <Button className="h-12 w-full rounded-full bg-[#165B2A] px-7 font-bold text-white shadow-[0_12px_25px_rgba(22,91,42,0.2)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#10461f] active:scale-[0.97] sm:w-auto">
                    تعرف على الجمعية
                    <ChevronLeft className="mr-1.5 h-4 w-4" />
                  </Button>
                </a>
                <a
                  href="/about#مسارات-الأثر"
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full border border-[#bb913c] bg-white/70 px-6 text-sm font-bold text-[#775619] transition-all duration-200 hover:border-[#8c6419] hover:bg-white active:scale-[0.97] sm:w-auto"
                >
                  مجالات عملنا
                  <ArrowLeft className="h-4 w-4" />
                </a>
              </div>

              {/* Focus Areas Badges */}
              <div className="mt-8 grid max-w-xl grid-cols-3 border-t border-[#d9c995] pt-5 sm:mt-11">
                {focusAreas.map(({ label, Icon }) => (
                  <div key={label} className="flex flex-col gap-2 border-l border-[#d9c995] px-3 last:border-l-0 first:pr-0">
                    <Icon className="h-5 w-5 text-[#b17816]" strokeWidth={1.8} />
                    <span className="text-xs font-bold leading-5 text-[#315441] sm:text-sm">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Visual Image */}
            <div className="relative order-1 min-h-[21.5rem] overflow-hidden rounded-bl-[4rem] rounded-tr-[4rem] border-[7px] border-white shadow-[0_28px_70px_rgba(24,76,46,0.17)] sm:min-h-[25rem] sm:rounded-bl-[5.5rem] sm:rounded-tr-[5.5rem] sm:border-[9px] lg:order-2 lg:min-h-[36rem]">
              <img
                src="/storage/acsd-hero-terraced-fields_8e549636.jpg"
                alt="حقول زراعية متدرجة ومسار مائي"
                className="warm-documentary absolute inset-0 h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/uploads/acsd-hero-terraced-fields_8e549636.jpg";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#123e26]/60 via-transparent to-[#f7e7b8]/20" />
              <div className="absolute right-5 top-5 flex items-center gap-2 rounded-full border border-white/50 bg-[#fbf8ed]/90 px-3.5 py-2 shadow-lg backdrop-blur">
                <img src={markUrl} alt="" className="h-6 w-6 object-contain" />
                <span className="text-xs font-bold text-[#155029]">أرض، ماء، معرفة</span>
              </div>
              <div className="absolute bottom-6 right-6 left-6 border-r-3 border-[#dfb757] pr-4 text-right text-white">
                <span className="display-font block text-base font-bold sm:text-lg">التنمية تبدأ من جذورٍ قوية</span>
                <span className="mt-1 block text-xs text-white/85 sm:text-sm">ونقودها بشراكة تؤمن بالمستقبل الزراعي السعودي.</span>
              </div>
            </div>
          </div>
        </section>

        {/* Short Statistics Section */}
        <section className="border-y border-[#d9c995]/70 bg-[#164A3A] py-12 text-white">
          <div className="container">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {homeStats.map(({ value, label, desc, Icon }) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center backdrop-blur transition-transform hover:-translate-y-1"
                >
                  <span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-[#e6bd67] text-[#164A3A]">
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="display-font mt-3 text-2xl font-extrabold text-[#e6bd67] sm:text-3xl" dir="ltr">
                    {value}
                  </p>
                  <p className="mt-1.5 text-sm font-bold text-white">{label}</p>
                  <p className="mt-0.5 text-xs text-white/70">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Strategic Objectives */}
        <section id="أهدافنا" className="route-map relative isolate bg-[#fbf8ed] py-20 lg:py-28">
          <div className="container relative z-10">
            <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
              <div>
                <span className="section-label">وجهة العمل</span>
                <h2 className="display-font mt-4 max-w-xl text-3xl font-extrabold leading-[1.5] text-[#155029] sm:text-4xl">
                  أهداف تصنع دورة نمو أكثر توازنًا
                </h2>
              </div>
              <p className="max-w-xl text-base leading-8 text-[#516f5d]">
                نوجّه مواردنا نحو الأولويات التي تعزز قدرة القطاع الزراعي على الاستمرار، وتضع التعاون والمعرفة في قلب الإنجاز.
              </p>
            </div>
            <div className="branch-rule mt-10" />
            <div className="mt-2">
              {objectives.map(({ number, title, description, Icon }) => (
                <article key={number} className="group grid gap-4 border-b border-[#ded4b7] py-7 transition-colors hover:bg-[#f3f0e3]/70 sm:grid-cols-[6.5rem_4rem_1fr] sm:items-center sm:gap-6 sm:px-4">
                  <div className="outline-number order-2 sm:order-1">{number}</div>
                  <div className="order-1 grid h-12 w-12 place-items-center rounded-full border border-[#d4b467] bg-white text-[#a36d18] transition-transform duration-200 group-hover:-translate-y-1 sm:order-2">
                    <Icon className="h-5 w-5" strokeWidth={1.7} />
                  </div>
                  <div className="order-3 flex flex-col gap-2 md:flex-row md:items-baseline md:gap-8">
                    <h3 className="display-font shrink-0 text-xl font-bold text-[#155029]">{title}</h3>
                    <p className="max-w-2xl text-sm leading-7 text-[#567260]">{description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Impact Paths / Activities */}
        <section id="أنشطتنا" className="route-map relative isolate bg-[#e8f0df] py-20 lg:py-28">
          <div className="container relative z-10">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div>
                <span className="section-label">مسارات الأثر</span>
                <h2 className="display-font mt-4 text-3xl font-extrabold leading-[1.5] text-[#155029] sm:text-4xl">
                  أنشطة ومجالات عمل متصلة بالميدان
                </h2>
              </div>
              <p className="max-w-md text-sm leading-7 text-[#52705b]">
                من المعرفة العملية إلى حماية الموارد، تتحول الأولويات إلى برامج تفتح مجالًا للتطوير المشترك.
              </p>
            </div>

            <div className="mt-11 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
              <article className="group relative min-h-[30rem] overflow-hidden rounded-bl-[4rem] rounded-tr-[4rem] bg-[#155029] shadow-[0_20px_45px_rgba(22,91,42,0.18)]">
                <img
                  src={activities[0].image}
                  alt="تعاون وتعلّم في حقل زراعي"
                  className="warm-documentary absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.035]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#123e26] via-[#123e26]/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-7 text-white sm:p-9">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-[#e6bd67] text-[#155029]">
                    <FeaturedActivityIcon className="h-5 w-5" />
                  </span>
                  <h3 className="display-font mt-5 text-2xl font-bold">{activities[0].title}</h3>
                  <p className="mt-3 max-w-lg text-sm leading-7 text-white/85">{activities[0].description}</p>
                </div>
              </article>

              <div className="activity-route flex flex-col gap-5 py-2">
                {activities.slice(1).map(({ title, description, Icon, image }) => (
                  <article key={title} className="activity-step group grid min-h-[12rem] grid-cols-[0.83fr_1.17fr] overflow-hidden border-b border-[#c6d7bd] bg-[#fbf8ed]/35 pb-5 last:border-b-0 last:pb-0 sm:min-h-[14rem]">
                    <div className="relative mr-3 overflow-hidden rounded-bl-[2rem] rounded-tr-[2rem] shadow-[0_10px_23px_rgba(22,91,42,0.09)]">
                      <img src={image} alt="" className="warm-documentary h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="image-wash" />
                    </div>
                    <div className="flex flex-col justify-center p-5 sm:p-7">
                      <Icon className="h-5 w-5 text-[#ad761c]" strokeWidth={1.8} />
                      <h3 className="display-font mt-3 text-lg font-bold text-[#155029]">{title}</h3>
                      <p className="mt-2 text-sm leading-6 text-[#58735f]">{description}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Cooperative Spirit Callout */}
        <section className="relative bg-[#fbf8ed] py-18 lg:py-24">
          <div className="container grid gap-7 lg:grid-cols-[1fr_0.66fr] lg:items-center">
            <div className="relative overflow-hidden rounded-bl-[4rem] rounded-tr-[4rem] bg-[#dba83c] px-7 py-10 text-[#173d26] sm:px-11 sm:py-12">
              <div className="absolute -left-14 -top-14 h-48 w-48 rounded-full border-[22px] border-[#f6d98d]/60" />
              <Sprout className="absolute bottom-7 left-9 h-24 w-24 text-[#155029]/15" strokeWidth={1.1} />
              <div className="relative z-10 max-w-xl">
                <span className="section-label !text-[#5f4617] before:!bg-[#5f4617]">روح التعاون</span>
                <h2 className="display-font mt-4 text-3xl font-extrabold leading-[1.6] sm:text-4xl">
                  كل مبادرة أقوى حين تنمو ضمن شراكة
                </h2>
                <p className="mt-4 text-base font-medium leading-8 text-[#4f421f]">
                  نؤمن بأن التنمية الزراعية المستدامة ليست مسارًا فرديًا؛ بل حصيلة معرفة تتبادل، وموارد تُدار بمسؤولية، ومجتمع يعمل من أجل قيمة مشتركة.
                </p>
              </div>
            </div>
            <div className="px-2 py-4 lg:px-8">
              <p className="display-font text-xl font-bold leading-9 text-[#155029]">
                نصنع مساحة للتعاون العملي بين المزارعين والجهات الداعمة والخبرات المتخصصة.
              </p>
              <div className="mt-6 flex items-center gap-3 text-[#987020]">
                <span className="h-px w-12 bg-[#c88a19]" />
                <span className="text-sm font-bold">مساحة تنمو فيها الأفكار إلى أثر مستدام</span>
              </div>
            </div>
          </div>
        </section>

        {/* Achievements Section */}
        <Achievements />

        {/* Upcoming Events Section */}
        <UpcomingEvents />

        {/* Latest Updates Section */}
        <LatestUpdates />

        {/* Call to Action Section */}
        <section id="تواصل" className="bg-[#123f25] py-16 text-white lg:py-20">
          <div className="container flex flex-col gap-7 md:flex-row md:items-center md:justify-between">
            <div>
              <span className="section-label !text-[#e6bd67] before:!bg-[#e6bd67]">تواصل معنا</span>
              <h2 className="display-font mt-4 text-2xl font-extrabold sm:text-3xl">
                لنبنِ الأثر الزراعي معًا، خطوة بخطوة
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/75">
                نسعد باستقبال استفساراتكم ومقترحاتكم وطلبات التعاون والشراكة عبر نموذج التواصل المباشر.
              </p>
            </div>
            <a
              href="/contact"
              className="inline-flex h-12 shrink-0 items-center justify-center rounded-full bg-[#e6bd67] px-7 text-sm font-bold text-[#155029] shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#f2cd78] active:scale-[0.97]"
            >
              اتصل بنا <ArrowLeft className="mr-2 h-4 w-4" />
            </a>
          </div>
        </section>
      </main>

      <BackToTop />
      <SiteFooter />
    </div>
  );
}
