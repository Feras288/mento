import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, CalendarDays, CheckCircle2, Clock3, LoaderCircle, MapPin, Ticket, UsersRound, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

type EventItem = { id: number; type: "news" | "event" | "achievement"; title: string; summary: string; imageUrl: string | null; eventStartsAt: Date | null; eventLocation: string | null };
type RegistrationValues = { attendeeName: string; attendeeEmail: string; attendeePhone: string };
const emptyRegistration: RegistrationValues = { attendeeName: "", attendeeEmail: "", attendeePhone: "" };

function useCountdown(target: Date) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => { const interval = window.setInterval(() => setNow(Date.now()), 1_000); return () => window.clearInterval(interval); }, []);
  const remaining = Math.max(0, target.getTime() - now);
  return { days: Math.floor(remaining / 86_400_000), hours: Math.floor((remaining / 3_600_000) % 24), minutes: Math.floor((remaining / 60_000) % 60), isOpen: remaining > 0 };
}

function EventCard({ event }: { event: EventItem }) {
  const target = new Date(event.eventStartsAt!);
  const countdown = useCountdown(target);
  const [showRegistration, setShowRegistration] = useState(false);
  const [values, setValues] = useState<RegistrationValues>(emptyRegistration);
  const register = trpc.events.register.useMutation({ onSuccess: () => { setValues(emptyRegistration); }, });
  const dateLabel = new Intl.DateTimeFormat("ar-SA", { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "2-digit" }).format(target);
  const submit = (eventForm: FormEvent<HTMLFormElement>) => { eventForm.preventDefault(); register.mutate({ eventId: event.id, ...values }); };

  const isDuplicateRegistration = register.error?.data?.code === "CONFLICT" || register.error?.message === "EMAIL_ALREADY_REGISTERED";
  return <article className="group relative overflow-hidden rounded-bl-[3.5rem] rounded-tr-[3.5rem] border border-[#d9c995] bg-white shadow-[0_20px_44px_rgba(22,91,42,0.09)]"><div className="grid lg:grid-cols-[0.9fr_1.1fr]">{event.imageUrl ? <div className="relative flex min-h-48 items-center justify-center overflow-hidden bg-[#edf2e9] p-3 sm:min-h-60"><img src={event.imageUrl} alt="" className="warm-documentary max-h-[22rem] w-full object-contain transition-transform duration-500 group-hover:scale-[1.02]" /></div> : <div className="relative min-h-48 bg-[#155029] sm:min-h-60"><div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(230,189,103,0.34),transparent_32%),radial-gradient(circle_at_20%_100%,rgba(26,124,171,0.34),transparent_45%)]" /></div>}<div className="p-5 sm:p-8"><div className="flex flex-wrap items-center justify-between gap-3"><span className="inline-flex items-center gap-2 rounded-full bg-[#e8f0df] px-3 py-1.5 text-xs font-bold text-[#155029]"><CalendarDays className="h-3.5 w-3.5" />فعالية قادمة</span>{event.eventLocation && <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#6a836f]"><MapPin className="h-3.5 w-3.5 text-[#a56c18]" />{event.eventLocation}</span>}</div><h3 className="display-font mt-5 text-2xl font-extrabold leading-9 text-[#155029]">{event.title}</h3><p className="mt-3 text-sm leading-7 text-[#58735f]">{event.summary}</p><p className="mt-5 inline-flex items-center gap-2 text-xs font-bold text-[#a56c18]"><Clock3 className="h-4 w-4" />{dateLabel}</p><div className="mt-6 grid max-w-sm grid-cols-3 divide-x divide-x-reverse divide-[#d9c995] rounded-2xl border border-[#d9c995] bg-[#fbf8ed] py-3 text-center"><div><b className="display-font block text-xl text-[#155029]">{countdown.days}</b><span className="text-[0.65rem] font-bold text-[#66816d]">يوم</span></div><div><b className="display-font block text-xl text-[#155029]">{String(countdown.hours).padStart(2, "0")}</b><span className="text-[0.65rem] font-bold text-[#66816d]">ساعة</span></div><div><b className="display-font block text-xl text-[#155029]">{String(countdown.minutes).padStart(2, "0")}</b><span className="text-[0.65rem] font-bold text-[#66816d]">دقيقة</span></div></div>{register.isSuccess ? <div className="mt-6 rounded-2xl border border-[#a7c992] bg-[#edf6e8] p-4 text-sm font-bold leading-7 text-[#155029]"><CheckCircle2 className="ml-2 inline h-4 w-4 text-[#3d7d41]" />تم تسجيل اهتمامك بالفعالية بنجاح. {register.data?.confirmationDelivered ? "أُرسل تأكيد التسجيل إلى بريدك الإلكتروني." : "سيحتفظ فريق الجمعية ببياناتك للمتابعة."}</div> : showRegistration ? <form onSubmit={submit} className="mt-6 grid gap-3 rounded-2xl border border-[#d9c995] bg-[#fbf8ed] p-4"><div className="flex items-center justify-between"><span className="inline-flex items-center gap-2 text-sm font-bold text-[#155029]"><UsersRound className="h-4 w-4 text-[#a56c18]" />سجّل اهتمامك</span><button type="button" onClick={() => setShowRegistration(false)} className="grid h-10 w-10 place-items-center rounded-full text-[#6a836f] hover:bg-white hover:text-[#a54b36]" aria-label="إغلاق التسجيل"><X className="h-4 w-4" /></button></div><input required minLength={2} value={values.attendeeName} onChange={e => setValues({ ...values, attendeeName: e.target.value })} placeholder="الاسم الكامل" className="h-12 rounded-xl border border-[#d8d0b9] bg-white px-3 text-base outline-none focus:border-[#165B2A] sm:text-sm" /><input required type="email" value={values.attendeeEmail} onChange={e => setValues({ ...values, attendeeEmail: e.target.value })} placeholder="البريد الإلكتروني" dir="ltr" className="h-12 rounded-xl border border-[#d8d0b9] bg-white px-3 text-base outline-none focus:border-[#165B2A] sm:text-sm" /><input value={values.attendeePhone} onChange={e => setValues({ ...values, attendeePhone: e.target.value })} placeholder="رقم الجوال (اختياري)" dir="ltr" className="h-12 rounded-xl border border-[#d8d0b9] bg-white px-3 text-base outline-none focus:border-[#165B2A] sm:text-sm" />{register.error && <p className="text-xs font-bold text-[#a54b36]">{isDuplicateRegistration ? "هذا البريد مسجل مسبقًا في هذه الفعالية." : "تعذر إتمام التسجيل الآن. يرجى المحاولة مرة أخرى."}</p>}<Button type="submit" disabled={register.isPending} className="h-12 rounded-full bg-[#165B2A] font-bold text-white hover:bg-[#10461f]">{register.isPending ? <LoaderCircle className="h-4 w-4 animate-spin" /> : "تأكيد التسجيل"}</Button></form> : <Button type="button" onClick={() => setShowRegistration(true)} disabled={!countdown.isOpen} className="mt-6 h-12 w-full rounded-full bg-[#165B2A] px-5 font-bold text-white hover:bg-[#10461f] sm:w-auto"><Ticket className="ml-2 h-4 w-4" />{countdown.isOpen ? "التسجيل في الفعالية" : "انتهت صلاحية التسجيل"}</Button>}</div></div></article>;
}

export default function UpcomingEvents() {
  const { data, isLoading } = trpc.content.publicList.useQuery();
  const upcoming = useMemo(() => ((data ?? []) as EventItem[]).filter(item => item.type === "event" && item.eventStartsAt && new Date(item.eventStartsAt).getTime() > Date.now()).sort((a, b) => new Date(a.eventStartsAt!).getTime() - new Date(b.eventStartsAt!).getTime()), [data]);
  return (
    <section id="الفعاليات" className="relative isolate overflow-hidden bg-[#e8f0df] py-20 lg:py-28">
      <div className="absolute inset-x-0 top-0 h-16 bg-[radial-gradient(100%_100%_at_50%_0%,transparent_57%,#fbf8ed_58%_61%,transparent_62%)]" aria-hidden="true" />
      <div className="container relative z-10">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="section-label">موعد يتجدد</p>
            <h2 className="display-font mt-4 text-3xl font-extrabold leading-[1.5] text-[#155029] sm:text-4xl">فعاليات تُقرب المعرفة من الميدان.</h2>
            <p className="mt-2 max-w-xl text-base leading-8 text-[#516f5d]">تابع المواعيد القادمة وسجل اهتمامك في الوقت المناسب.</p>
          </div>
          <a href="/events" className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full border border-[#165B2A] bg-white px-5 text-sm font-bold text-[#165B2A] shadow-sm transition-all hover:bg-[#165B2A] hover:text-white active:scale-95">
            عرض كافة الفعاليات
            <ArrowLeft className="h-4 w-4" />
          </a>
        </div>
        <div className="mt-11 space-y-6">
          {isLoading ? (
            <div className="grid min-h-72 place-items-center rounded-bl-[3rem] rounded-tr-[3rem] bg-white/65">
              <LoaderCircle className="h-7 w-7 animate-spin text-[#165B2A]" />
            </div>
          ) : upcoming.length > 0 ? (
            upcoming.map(event => <EventCard key={event.id} event={event} />)
          ) : (
            <div className="rounded-bl-[3rem] rounded-tr-[3rem] border border-dashed border-[#b5cbaa] bg-white/50 p-8 text-center sm:p-12">
              <CalendarDays className="mx-auto h-8 w-8 text-[#a56c18]" />
              <h3 className="display-font mt-4 text-xl font-bold text-[#155029]">نعد للقاءات ميدانية جديدة.</h3>
              <p className="mt-2 text-sm leading-7 text-[#58735f]">ستظهر هنا الفعاليات المنشورة القادمة مع تفاصيلها وخيار التسجيل.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

