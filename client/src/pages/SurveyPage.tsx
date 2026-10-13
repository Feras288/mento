import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, ClipboardCheck, Loader2, LockKeyhole, MessageSquareText, Send, Sparkles } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

const deviceTokenKey = "acsd-survey-device-token";
const completionKey = (surveyId: number) => `acsd-survey-completed-${surveyId}`;

function getDeviceToken() {
  const saved = window.localStorage.getItem(deviceTokenKey);
  if (saved && /^[a-f0-9-]{36}$/i.test(saved)) return saved;
  const token = crypto.randomUUID();
  window.localStorage.setItem(deviceTokenKey, token);
  return token;
}

function parseOptions(optionsJson: string | null) {
  try {
    const options = JSON.parse(optionsJson ?? "[]");
    return Array.isArray(options) ? options.filter((option): option is string => typeof option === "string") : [];
  } catch {
    return [];
  }
}

export default function SurveyPage() {
  const activeSurvey = trpc.surveys.publicActive.useQuery();
  const submitSurvey = trpc.surveys.submit.useMutation();
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [completionState, setCompletionState] = useState<"none" | "submitted" | "existing">("none");

  useEffect(() => {
    const surveyId = activeSurvey.data?.survey.id;
    if (!surveyId) return;
    setAnswers({});
    setCompletionState(window.localStorage.getItem(completionKey(surveyId)) === "yes" ? "existing" : "none");
  }, [activeSurvey.data?.survey.id]);

  const questions = activeSurvey.data?.questions ?? [];
  const requiredQuestionIds = useMemo(() => questions.filter(question => question.isRequired === "yes").map(question => question.id), [questions]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const survey = activeSurvey.data?.survey;
    if (!survey) return;
    if (requiredQuestionIds.some(questionId => !answers[questionId]?.trim())) {
      toast.error("يرجى الإجابة عن جميع الأسئلة المطلوبة.");
      return;
    }
    submitSurvey.mutate({
      surveyId: survey.id,
      respondentToken: getDeviceToken(),
      answers: questions.filter(question => answers[question.id]?.trim()).map(question => ({ questionId: question.id, value: answers[question.id].trim() })),
    }, {
      onSuccess: () => {
        window.localStorage.setItem(completionKey(survey.id), "yes");
        setCompletionState("submitted");
      },
      onError: error => {
        if (error.message === "SURVEY_ALREADY_COMPLETED") {
          window.localStorage.setItem(completionKey(survey.id), "yes");
          setCompletionState("existing");
          return;
        }
        toast.error("تعذر إرسال الاستبيان الآن. يرجى المحاولة لاحقًا.");
      },
    });
  }

  return <div dir="rtl" className="survey-shell min-h-screen bg-[#f3f1e4] text-[#155029]"><SiteHeader /><main>
    <section className="route-map relative isolate overflow-hidden bg-[#ece9d9] py-16 sm:py-20 lg:py-24"><div className="absolute -right-24 top-8 h-72 w-72 rounded-full border-[28px] border-[#e1c778]/30" /><div className="absolute bottom-0 left-0 h-56 w-[48%] bg-[#e1edf0]/60 [clip-path:polygon(0_30%,100%_0,100%_100%,0_100%)]" /><div className="container relative z-10 grid gap-9 lg:grid-cols-[0.78fr_1.22fr] lg:items-end"><div className="order-2 rounded-bl-[3.6rem] rounded-tr-[3.6rem] border border-[#d9c995] bg-white/90 p-7 shadow-[0_14px_35px_rgba(22,91,42,0.08)] sm:p-9 lg:order-1"><span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#155029] text-[#f2cd78]"><ClipboardCheck className="h-7 w-7" /></span><h2 className="display-font mt-6 text-2xl font-extrabold leading-10">صوتك يشارك في رسم الأولويات.</h2><p className="mt-3 text-sm leading-7 text-[#597362]">أجب عن الأسئلة المتاحة في دقائق. لا يتطلب النموذج إدخال الاسم أو البريد الإلكتروني، وتُعرض النتائج للإدارة بصورة مجمعة.</p><div className="mt-6 grid gap-3 text-sm font-bold text-[#456751]"><span className="flex items-center gap-2"><LockKeyhole className="h-4 w-4 text-[#a67017]" />مشاركة دون بيانات تعريف شخصية.</span><span className="flex items-center gap-2"><MessageSquareText className="h-4 w-4 text-[#a67017]" />أسئلة واضحة وتجربة مناسبة للجوال.</span></div></div><div className="order-1 lg:order-2"><p className="section-label">منصة المشاركة</p><h1 className="display-font mt-4 max-w-3xl text-4xl font-extrabold leading-[1.35] text-[#155029] sm:text-5xl">استبيان الجمعية.<br /><span className="text-[#a67017]">لرؤى تُترجم إلى أثر.</span></h1><p className="mt-5 max-w-2xl text-base leading-8 text-[#587260]">نستمع إلى المستفيدين والشركاء لنطوّر برامج الجمعية وخدماتها وفق احتياجات المجتمع الزراعي.</p></div></div></section>

    <section className="bg-[#f8f6ec] py-16 lg:py-20"><div className="container max-w-4xl"><div className="mb-7 flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#e8f0df] text-[#155029]"><Sparkles className="h-4 w-4" /></span><div><p className="section-label">استبيان متاح</p><h2 className="display-font mt-1 text-2xl font-extrabold">شاركنا رأيك</h2></div></div>
      {activeSurvey.isLoading ? <div className="grid min-h-80 place-items-center rounded-bl-[3rem] rounded-tr-[3rem] border border-[#d9c995] bg-white"><Loader2 className="h-7 w-7 animate-spin text-[#a67017]" /></div> : activeSurvey.error ? <div className="rounded-bl-[3rem] rounded-tr-[3rem] border border-[#e1c1b6] bg-[#fff9f6] px-7 py-12 text-center"><ClipboardCheck className="mx-auto h-10 w-10 text-[#a54b36]" /><h2 className="display-font mt-4 text-2xl font-extrabold text-[#155029]">تعذر تحميل الاستبيان</h2><p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#6d615d]">يرجى إعادة المحاولة بعد قليل. لم يتم تسجيل أي إجابة.</p></div> : activeSurvey.data?.survey && questions.length ? completionState !== "none" ? <div className="rounded-bl-[3rem] rounded-tr-[3rem] border border-[#c5d8bd] bg-[#f5fbf1] px-7 py-12 text-center shadow-[0_14px_30px_rgba(22,91,42,0.06)]"><CheckCircle2 className="mx-auto h-12 w-12 text-[#165b2a]" /><h2 className="display-font mt-5 text-2xl font-extrabold text-[#155029]">{completionState === "existing" ? "تم تسجيل إجابتك مسبقًا" : "شكرًا لمشاركتك"}</h2><p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#587260]">{completionState === "existing" ? "سبق أن أرسلت إجابتك لهذا الاستبيان من هذا الجهاز، ونقدّر مشاركتك." : "تم تسجيل إجابتك. تقدّر الجمعية الوقت الذي خصصته لمشاركة رأيك."}</p></div> : <form onSubmit={submit} className="overflow-hidden rounded-bl-[3rem] rounded-tr-[3rem] border border-[#d9c995] bg-white shadow-[0_14px_32px_rgba(22,91,42,0.07)]"><div className="border-b border-[#e6ddc5] bg-[#fbf8ed] px-6 py-7 sm:px-9"><p className="text-xs font-bold text-[#a67017]">استبيان الجمعية</p><h2 className="display-font mt-2 text-2xl font-extrabold text-[#155029]">{activeSurvey.data.survey.title}</h2>{activeSurvey.data.survey.description && <p className="mt-3 max-w-2xl whitespace-pre-wrap text-sm leading-7 text-[#5b7562]">{activeSurvey.data.survey.description}</p>}</div><div className="space-y-8 px-6 py-8 sm:px-9">{questions.map((question, index) => <fieldset key={question.id} className="border-b border-[#eee7d5] pb-8 last:border-0 last:pb-0"><legend className="flex w-full gap-3 text-right"><span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#e8f0df] text-xs font-extrabold text-[#155029]">{index + 1}</span><span className="text-base font-extrabold leading-7 text-[#155029]">{question.prompt}{question.isRequired === "yes" && <span className="mr-1 text-[#b84d35]" aria-label="سؤال مطلوب">*</span>}<span className="mt-1 block text-xs font-medium leading-6 text-[#6a836f]">{question.helpText || (question.type === "rating" ? "اختر تقييمًا من 1 إلى 5." : "")}</span></span></legend><div className="mr-10 mt-5">{question.type === "single_choice" ? <div className="grid gap-3">{parseOptions(question.optionsJson).map(option => <label key={option} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm font-bold transition-colors ${answers[question.id] === option ? "border-[#165b2a] bg-[#edf5e9] text-[#155029]" : "border-[#ded7c4] bg-white text-[#55705d] hover:border-[#b89e5b]"}`}><input type="radio" className="accent-[#165b2a]" name={`question-${question.id}`} value={option} checked={answers[question.id] === option} onChange={() => setAnswers(current => ({ ...current, [question.id]: option }))} />{option}</label>)}</div> : question.type === "rating" ? <div className="grid grid-cols-5 gap-2 sm:max-w-md">{[1, 2, 3, 4, 5].map(value => <label key={value} className={`grid cursor-pointer place-items-center rounded-xl border py-3 text-sm font-extrabold transition-colors ${answers[question.id] === String(value) ? "border-[#165b2a] bg-[#165b2a] text-white" : "border-[#ded7c4] bg-white text-[#55705d] hover:border-[#b89e5b]"}`}><input type="radio" className="sr-only" name={`question-${question.id}`} value={value} checked={answers[question.id] === String(value)} onChange={() => setAnswers(current => ({ ...current, [question.id]: String(value) }))} />{value}</label>)}</div> : <textarea value={answers[question.id] ?? ""} onChange={event => setAnswers(current => ({ ...current, [question.id]: event.target.value }))} maxLength={2000} rows={5} className="w-full resize-y rounded-xl border border-[#ded7c4] bg-white px-4 py-3 text-sm leading-7 text-[#315441] outline-none transition-colors focus:border-[#165b2a]" placeholder="اكتب إجابتك هنا..." />}</div></fieldset>)}</div><div className="flex flex-col gap-4 border-t border-[#e6ddc5] bg-[#fbf8ed] px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-9"><p className="text-xs leading-6 text-[#6a836f]">لن تُطلب منك أي بيانات تعريف شخصية في هذا الاستبيان.</p><Button type="submit" disabled={submitSurvey.isPending} className="h-11 rounded-full bg-[#165b2a] px-6 font-bold text-white hover:bg-[#10461f]">{submitSurvey.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="ml-2 h-4 w-4" />إرسال الإجابات</>}</Button></div></form> : <div className="rounded-bl-[3rem] rounded-tr-[3rem] border border-dashed border-[#d3c18e] bg-white px-7 py-12 text-center"><ClipboardCheck className="mx-auto h-10 w-10 text-[#a67017]" /><h2 className="display-font mt-4 text-2xl font-extrabold text-[#155029]">لا يوجد استبيان منشور حاليًا</h2><p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#5c7663]">سيظهر الاستبيان المعتمد هنا فور نشره من إدارة الجمعية. نرحب بك للعودة قريبًا.</p></div>}</div></section>
  </main><SiteFooter /></div>;
}
