import BackToTop from "@/components/BackToTop";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  MapPin,
  Sparkles,
  Ticket,
  UsersRound,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

type EventItem = {
  id: number;
  type: "news" | "event" | "achievement";
  title: string;
  summary: string;
  imageUrl: string | null;
  eventStartsAt: Date | null;
  eventLocation: string | null;
};

type RegistrationValues = {
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone: string;
};

const emptyRegistration: RegistrationValues = {
  attendeeName: "",
  attendeeEmail: "",
  attendeePhone: "",
};

function useCountdown(target: Date) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const remaining = Math.max(0, target.getTime() - now);

  return {
    days: Math.floor(remaining / 86_400_000),
    hours: Math.floor((remaining / 3_600_000) % 24),
    minutes: Math.floor((remaining / 60_000) % 60),
    seconds: Math.floor((remaining / 1_000) % 60),
    isOpen: remaining > 0,
  };
}

function EventCardItem({ event }: { event: EventItem }) {
  const target = new Date(event.eventStartsAt!);
  const countdown = useCountdown(target);
  const [showRegistration, setShowRegistration] = useState(false);
  const [values, setValues] = useState<RegistrationValues>(emptyRegistration);
  const [isLocallyRegistered, setIsLocallyRegistered] = useState(false);
  const [localSuccess, setLocalSuccess] = useState(false);

  // Check localStorage for duplicate registration in this browser
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`acsd_registered_event_${event.id}`);
      if (stored) {
        setIsLocallyRegistered(true);
      }
    } catch {
      // localStorage disabled or private browsing
    }
  }, [event.id]);

  const registerMutation = trpc.events.register.useMutation({
    onSuccess: () => {
      try {
        localStorage.setItem(`acsd_registered_event_${event.id}`, JSON.stringify({
          email: values.attendeeEmail,
          name: values.attendeeName,
          date: new Date().toISOString(),
        }));
      } catch {}
      setIsLocallyRegistered(true);
      setLocalSuccess(true);
      setValues(emptyRegistration);
    },
  });

  const dateLabel = new Intl.DateTimeFormat("ar-SA", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(target);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLocallyRegistered) return;
    registerMutation.mutate({
      eventId: event.id,
      ...values,
    });
  };

  const isDuplicateOnServer =
    registerMutation.error?.data?.code === "CONFLICT" ||
    registerMutation.error?.message === "EMAIL_ALREADY_REGISTERED";

  return (
    <article className="group relative overflow-hidden rounded-bl-[3.5rem] rounded-tr-[3.5rem] border border-[#d9c995] bg-white shadow-[0_20px_44px_rgba(22,91,42,0.09)] transition-all duration-300 hover:shadow-[0_24px_50px_rgba(22,91,42,0.14)]">
      <div className="grid lg:grid-cols-[0.9fr_1.1fr]">
        {/* Event Image */}
        {event.imageUrl ? (
          <div className="relative flex min-h-64 items-center justify-center overflow-hidden bg-[#edf2e9] p-3 sm:min-h-72">
            <img
              src={event.imageUrl}
              alt={event.title}
              className="warm-documentary h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <span className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-[#155029] shadow-sm backdrop-blur">
              <CalendarDays className="h-3.5 w-3.5 text-[#a67017]" />
              {countdown.isOpen ? "فعالية قادمة" : "فعالية مكتملة"}
            </span>
          </div>
        ) : (
          <div className="relative min-h-64 bg-[#155029] sm:min-h-72">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(230,189,103,0.34),transparent_32%),radial-gradient(circle_at_20%_100%,rgba(26,124,171,0.34),transparent_45%)]" />
            <div className="absolute inset-0 flex items-center justify-center text-white/30">
              <CalendarDays className="h-20 w-20" />
            </div>
          </div>
        )}

        {/* Event Details */}
        <div className="flex flex-col justify-between p-6 sm:p-9">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e8f0df] px-3.5 py-1 text-xs font-bold text-[#155029]">
                <Clock3 className="h-3.5 w-3.5 text-[#a67017]" />
                {dateLabel}
              </span>

              {event.eventLocation && (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#5c7a63]">
                  <MapPin className="h-3.5 w-3.5 text-[#a67017]" />
                  {event.eventLocation}
                </span>
              )}
            </div>

            <h2 className="display-font mt-4 text-2xl font-extrabold leading-9 text-[#155029] sm:text-3xl">
              {event.title}
            </h2>

            <p className="mt-3 text-sm leading-7 text-[#58735f] sm:text-base sm:leading-8">
              {event.summary}
            </p>

            {/* Countdown Grid */}
            {countdown.isOpen && (
              <div className="mt-6">
                <span className="text-xs font-bold text-[#8c671a]">المتبقي على انطلاق الفعالية:</span>
                <div className="mt-2 grid max-w-md grid-cols-4 divide-x divide-x-reverse divide-[#d9c995] rounded-2xl border border-[#d9c995] bg-[#fbf8ed] py-3 text-center shadow-inner">
                  <div>
                    <b className="display-font block text-xl text-[#155029] sm:text-2xl">{countdown.days}</b>
                    <span className="text-[0.65rem] font-bold text-[#66816d]">أيام</span>
                  </div>
                  <div>
                    <b className="display-font block text-xl text-[#155029] sm:text-2xl">
                      {String(countdown.hours).padStart(2, "0")}
                    </b>
                    <span className="text-[0.65rem] font-bold text-[#66816d]">ساعات</span>
                  </div>
                  <div>
                    <b className="display-font block text-xl text-[#155029] sm:text-2xl">
                      {String(countdown.minutes).padStart(2, "0")}
                    </b>
                    <span className="text-[0.65rem] font-bold text-[#66816d]">دقائق</span>
                  </div>
                  <div>
                    <b className="display-font block text-xl text-[#a67017] sm:text-2xl">
                      {String(countdown.seconds).padStart(2, "0")}
                    </b>
                    <span className="text-[0.65rem] font-bold text-[#66816d]">ثوانٍ</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action / Registration Area */}
          <div className="mt-7 pt-4 border-t border-[#f0ebd9]">
            {/* If registered locally or through mutation */}
            {isLocallyRegistered || localSuccess ? (
              <div className="rounded-2xl border border-[#a7c992] bg-[#edf6e8] p-4 text-sm font-bold text-[#155029]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-[#3d7d41]" />
                  <span>
                    {localSuccess
                      ? "تم تسجيل اهتمامك بالفعالية بنجاح!"
                      : "أنت مسجل بالفعل في هذه الفعالية من هذا المتصفح."}
                  </span>
                </div>
                <p className="mt-1.5 text-xs font-normal text-[#4c6e54]">
                  سيتواصل معك فريق الجمعية بكافة تفاصيل الحضور والمستجدات قبل الموعد المحدد.
                </p>
              </div>
            ) : showRegistration ? (
              /* Registration Form */
              <form
                onSubmit={handleSubmit}
                className="grid gap-3.5 rounded-2xl border border-[#d9c995] bg-[#fbf8ed] p-5 shadow-sm"
              >
                <div className="flex items-center justify-between border-b border-[#e5ddc4] pb-3">
                  <span className="inline-flex items-center gap-2 text-sm font-bold text-[#155029]">
                    <UsersRound className="h-4 w-4 text-[#a56c18]" />
                    نموذج التسجيل في الفعالية
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowRegistration(false)}
                    className="grid h-8 w-8 place-items-center rounded-full text-[#6a836f] hover:bg-white hover:text-[#a54b36]"
                    aria-label="إغلاق نموذج التسجيل"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-bold text-[#315441]">الاسم الكامل *</label>
                    <input
                      required
                      minLength={2}
                      value={values.attendeeName}
                      onChange={e => setValues({ ...values, attendeeName: e.target.value })}
                      placeholder="مثال: صالح بن أحمد الغامدي"
                      className="h-11 w-full rounded-xl border border-[#d8d0b9] bg-white px-3.5 text-sm outline-none focus:border-[#165B2A] focus:ring-2 focus:ring-[#165B2A]/10"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-[#315441]">البريد الإلكتروني *</label>
                    <input
                      required
                      type="email"
                      value={values.attendeeEmail}
                      onChange={e => setValues({ ...values, attendeeEmail: e.target.value })}
                      placeholder="name@example.com"
                      dir="ltr"
                      className="h-11 w-full rounded-xl border border-[#d8d0b9] bg-white px-3.5 text-sm outline-none focus:border-[#165B2A] focus:ring-2 focus:ring-[#165B2A]/10"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-bold text-[#315441]">رقم الجوال (اختياري)</label>
                    <input
                      value={values.attendeePhone}
                      onChange={e => setValues({ ...values, attendeePhone: e.target.value })}
                      placeholder="05XXXXXXXX"
                      dir="ltr"
                      className="h-11 w-full rounded-xl border border-[#d8d0b9] bg-white px-3.5 text-sm outline-none focus:border-[#165B2A] focus:ring-2 focus:ring-[#165B2A]/10"
                    />
                  </div>
                </div>

                {/* Error handling */}
                {registerMutation.error && (
                  <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-bold text-[#a54b36]">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>
                      {isDuplicateOnServer
                        ? "هذا البريد الإلكتروني مسجل مسبقًا في هذه الفعالية."
                        : "تعذر إتمام التسجيل في الوقت الحالي. يرجى إعادة المحاولة."}
                    </span>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={registerMutation.isPending}
                  className="mt-1 h-11 w-full rounded-full bg-[#165B2A] font-bold text-white transition-all hover:bg-[#10461f] active:scale-95"
                >
                  {registerMutation.isPending ? (
                    <span className="flex items-center gap-2">
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      جاري تأكيد التسجيل...
                    </span>
                  ) : (
                    "تأكيد التسجيل في الفعالية"
                  )}
                </Button>
              </form>
            ) : (
              /* Trigger button */
              <Button
                type="button"
                onClick={() => setShowRegistration(true)}
                disabled={!countdown.isOpen}
                className="h-12 w-full rounded-full bg-[#165B2A] px-6 font-bold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#10461f] active:scale-95 sm:w-auto"
              >
                <Ticket className="ml-2 h-4 w-4" />
                {countdown.isOpen ? "سجّل الآن في الفعالية" : "انتهت فترة التسجيل"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export default function EventsPage() {
  const { data, isLoading } = trpc.content.publicList.useQuery();

  const events = useMemo(() => {
    return ((data ?? []) as EventItem[])
      .filter(item => item.type === "event" && item.eventStartsAt)
      .sort((a, b) => new Date(a.eventStartsAt!).getTime() - new Date(b.eventStartsAt!).getTime());
  }, [data]);

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
              <CalendarDays className="h-4 w-4" />
              البرامج والمواعيد
            </span>
            <h1 className="display-font mt-4 text-3xl font-extrabold leading-[1.4] text-[#155029] sm:text-5xl">
              فعاليات ولقاءات تقرّب المعرفة من الميدان
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-[#486653] sm:text-lg">
              تنظم الجمعية ورش عمل دورية، ولقاءات إرشادية، وملتقيات زراعية تهدف إلى تمكين المزارعين وتطوير الإنتاج الزراعي المستدام.
            </p>
          </div>
        </section>

        {/* Events List */}
        <section className="py-16 lg:py-24">
          <div className="container max-w-5xl">
            {isLoading ? (
              <div className="grid min-h-72 place-items-center rounded-3xl bg-white/60 p-12">
                <div className="flex flex-col items-center gap-3">
                  <LoaderCircle className="h-8 w-8 animate-spin text-[#165B2A]" />
                  <p className="text-sm font-bold text-[#58735f]">جاري تحميل الفعاليات القادمة...</p>
                </div>
              </div>
            ) : events.length > 0 ? (
              <div className="space-y-8">
                {events.map(event => (
                  <EventCardItem key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <div className="mx-auto max-w-lg rounded-bl-[3rem] rounded-tr-[3rem] border border-dashed border-[#b8cdad] bg-white p-12 text-center shadow-sm">
                <CalendarDays className="mx-auto h-12 w-12 text-[#a67017]" />
                <h3 className="display-font mt-4 text-xl font-bold text-[#155029]">
                  نعدّ لملتقيات وورش ميدانية جديدة
                </h3>
                <p className="mt-2 text-sm leading-7 text-[#58735f]">
                  تابع هذه الصفحة باستمرار أو تواصل معنا للاستفسار عن برامج الإرشاد والتدريب القادمة.
                </p>
                <a
                  href="/contact"
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#165B2A] px-6 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#10461f]"
                >
                  تواصل مع الجمعية
                </a>
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
