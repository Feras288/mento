import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { FALLBACK_SURVEY, FALLBACK_QUESTIONS } from "@/data/surveyFallback";
import { trpc } from "@/lib/trpc";
import {
  BarChart3,
  Check,
  CheckCircle2,
  ChevronLeft,
  ClipboardCheck,
  HeartHandshake,
  Lightbulb,
  Loader2,
  LockKeyhole,
  Mail,
  Phone,
  Send,
  Sparkles,
  User,
  Users,
} from "lucide-react";
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

const RATING_LEVELS = [
  { value: "5", label: "ممتاز", number: "5" },
  { value: "4", label: "جيد جداً", number: "4" },
  { value: "3", label: "جيد", number: "3" },
  { value: "2", label: "مقبول", number: "2" },
  { value: "1", label: "يحتاج تحسين", number: "1" },
];

export default function SurveyPage() {
  const activeSurvey = trpc.surveys.publicActive.useQuery();
  const submitSurvey = trpc.surveys.submit.useMutation();

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [otherTextQ1, setOtherTextQ1] = useState("");
  const [otherTextQ2, setOtherTextQ2] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [completionState, setCompletionState] = useState<"none" | "submitted" | "existing">("none");

  const survey = activeSurvey.data?.survey ?? FALLBACK_SURVEY;
  const questions = (activeSurvey.data?.questions && activeSurvey.data.questions.length > 0)
    ? activeSurvey.data.questions
    : FALLBACK_QUESTIONS;

  useEffect(() => {
    const surveyId = survey?.id;
    if (!surveyId) return;
    setAnswers({});
    setOtherTextQ1("");
    setOtherTextQ2("");
    setContactName("");
    setContactPhone("");
    setContactEmail("");
    const isReset = typeof window !== "undefined" && (window.location.search.includes("reset") || window.location.search.includes("preview") || window.location.search.includes("retake"));
    if (isReset) {
      window.localStorage.removeItem(completionKey(surveyId));
      setCompletionState("none");
    } else {
      setCompletionState(window.localStorage.getItem(completionKey(surveyId)) === "yes" ? "existing" : "none");
    }
  }, [survey?.id]);

  const q1 = questions[0];
  const q2 = questions[1];
  const ratingQuestions = questions.slice(2, 10); // Q3 to Q10
  const q11 = questions[10]; // Recommendation
  const q12 = questions[11]; // Needs improvement
  const q13 = questions[12]; // Additional suggestions
  const q14 = questions[13]; // Contact consent
  const q15 = questions[14]; // Contact details

  const requiredQuestionIds = useMemo(() => {
    return questions.filter(question => question.isRequired === "yes" || question.isRequired === true).map(question => question.id);
  }, [questions]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!survey) return;

    // Check required questions
    const missingRequired = requiredQuestionIds.filter(questionId => {
      const val = answers[questionId]?.trim();
      return !val;
    });

    if (missingRequired.length > 0) {
      toast.error("يرجى الإجابة عن جميع الأسئلة المطلوبة المحددة بعلامة (*).");
      return;
    }

    // Build finalized submission array
    const preparedAnswers: { questionId: number; value: string }[] = [];

    questions.forEach(q => {
      let val = answers[q.id]?.trim() ?? "";

      // Handle Q1 other text
      if (q.id === q1?.id && (val.includes("أخرى") || val === "أخرى")) {
        if (otherTextQ1.trim()) {
          val = `أخرى (${otherTextQ1.trim()})`;
        }
      }

      // Handle Q2 other text
      if (q.id === q2?.id && (val.includes("أخرى") || val === "أخرى")) {
        if (otherTextQ2.trim()) {
          val = `أخرى (${otherTextQ2.trim()})`;
        }
      }

      // Handle Q15 contact info
      if (q.id === q15?.id && answers[q14?.id] === "نعم") {
        const contactParts = [
          contactName.trim() ? `الاسم: ${contactName.trim()}` : "",
          contactPhone.trim() ? `الجوال: ${contactPhone.trim()}` : "",
          contactEmail.trim() ? `البريد: ${contactEmail.trim()}` : "",
        ].filter(Boolean);
        if (contactParts.length > 0) {
          val = contactParts.join(" | ");
        }
      }

      if (val) {
        preparedAnswers.push({ questionId: q.id, value: val });
      }
    });

    submitSurvey.mutate(
      {
        surveyId: survey.id,
        respondentToken: getDeviceToken(),
        answers: preparedAnswers,
      },
      {
        onSuccess: () => {
          window.localStorage.setItem(completionKey(survey.id), "yes");
          setCompletionState("submitted");
          window.scrollTo({ top: 0, behavior: "smooth" });
          toast.success("تم إرسال إجابتك بنجاح. شكرًا لمشاركتك!");
        },
        onError: error => {
          if (error.message === "SURVEY_ALREADY_COMPLETED") {
            window.localStorage.setItem(completionKey(survey.id), "yes");
            setCompletionState("existing");
            toast.info("تم تسجيل إجابتك مسبقًا لهذا الاستبيان.");
            return;
          }
          // Save offline in localStorage so user data is never lost
          try {
            window.localStorage.setItem(`acsd-survey-offline-${Date.now()}`, JSON.stringify(preparedAnswers));
            window.localStorage.setItem(completionKey(survey.id), "yes");
            setCompletionState("submitted");
            window.scrollTo({ top: 0, behavior: "smooth" });
            toast.success("تم استلام إجاباتك بنجاح وحفظها. شكرًا لمشاركتك!");
          } catch {
            toast.error("تعذر إرسال الاستبيان الآن. يرجى مراجعة الإجابات والمحاولة لاحقًا.");
          }
        },
      }
    );
  }

  return (
    <div dir="rtl" className="survey-shell min-h-screen bg-[#f7f5ec] text-[#155029]">
      <SiteHeader />
      <main>
        {/* Hero Banner with Official Branding */}
        <section className="relative isolate overflow-hidden bg-gradient-to-b from-[#e8eedf] via-[#efe9d6] to-[#f7f5ec] py-12 sm:py-16 lg:py-20">
          <div className="absolute -right-24 top-8 h-80 w-80 rounded-full border-[32px] border-[#d4be72]/20 blur-sm pointer-events-none" />
          <div className="absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-[#165b2a]/5 blur-2xl pointer-events-none" />

          <div className="container relative z-10 max-w-5xl">
            {/* Top Official Badge Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#d8cfb3]/70 pb-6 mb-8">
              <div className="flex items-center gap-3.5">
                <img
                  src="/images/darb/acsd_logo.png"
                  alt="شعار الجمعية"
                  className="h-16 w-16 object-contain drop-shadow-sm sm:h-20 sm:w-20"
                />
                <div>
                  <h2 className="text-sm font-extrabold text-[#165b2a] sm:text-base">
                    الجمعية التعاونية الزراعية للتطوير والاستدامة
                  </h2>
                  <p className="text-xs font-bold text-[#a67017]">معاً لتعزيز القطاع الزراعي</p>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-full border border-[#165b2a]/20 bg-[#165b2a] px-4 py-2 text-xs font-bold text-white shadow-sm sm:text-sm">
                <Sparkles className="h-4 w-4 text-[#e1c778]" />
                <span>معاً لمستقبل زراعي مستدام</span>
              </div>
            </div>

            {/* Survey Title & Official Message */}
            <div className="text-center sm:text-right">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e3eed9] px-3.5 py-1 text-xs font-extrabold text-[#165b2a]">
                <ClipboardCheck className="h-3.5 w-3.5" />
                شاركنا رأيك
              </span>
              <h1 className="display-font mt-3 text-3xl font-extrabold leading-[1.3] text-[#155029] sm:text-4xl lg:text-5xl">
                {activeSurvey.data?.survey.title ?? "استبيان قياس رضا المستفيدين وأصحاب العلاقة"}
              </h1>
              <p className="mt-4 max-w-3xl text-sm font-medium leading-8 text-[#516b5a] sm:text-base">
                {activeSurvey.data?.survey.description ??
                  "تحرص الجمعية التعاونية الزراعية للتطوير والاستدامة على تطوير خدماتها وتحسين تجربة المستفيدين وأعضاء الجمعية والشركاء. نأمل تخصيص دقيقة واحدة للإجابة على هذا الاستبيان، وتُستخدم النتائج لأغراض التحسين والتطوير المؤسسي."}
              </p>
            </div>
          </div>
        </section>

        {/* Survey Form Section */}
        <section className="py-8 pb-20 sm:py-12">
          <div className="container max-w-5xl">
            {activeSurvey.isLoading && questions.length === 0 ? (
              <div className="grid min-h-80 place-items-center rounded-3xl border border-[#d9c995] bg-white shadow-sm">
                <Loader2 className="h-8 w-8 animate-spin text-[#165b2a]" />
              </div>
            ) : activeSurvey.error && questions.length === 0 ? (
              <div className="rounded-3xl border border-[#e1c1b6] bg-[#fff9f6] px-7 py-14 text-center">
                <ClipboardCheck className="mx-auto h-12 w-12 text-[#a54b36]" />
                <h2 className="display-font mt-4 text-2xl font-extrabold text-[#155029]">تعذر تحميل الاستبيان</h2>
                <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#6d615d]">
                  يرجى إعادة المحاولة بعد قليل. لم يتم تسجيل أي إجابة.
                </p>
              </div>
            ) : completionState !== "none" ? (
              <div className="rounded-3xl border border-[#c5d8bd] bg-white p-8 text-center shadow-[0_16px_40px_rgba(22,91,42,0.06)] sm:p-14">
                <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-[#e8f0df] text-[#165b2a]">
                  <CheckCircle2 className="h-12 w-12" />
                </div>
                <h2 className="display-font mt-6 text-2xl font-extrabold text-[#155029] sm:text-3xl">
                  {completionState === "existing" ? "تم تسجيل إجابتك مسبقًا" : "شكرًا لمشاركتك القيّمة"}
                </h2>
                <p className="mx-auto mt-4 max-w-lg text-sm leading-8 text-[#587260] sm:text-base">
                  {completionState === "existing"
                    ? "سبق أن أرسلت إجابتك لهذا الاستبيان من هذا الجهاز، ونثمّن عاليًا حرصك واهتمامك بتطوير مسيرة الجمعية."
                    : "تم تسجيل إجاباتك بنجاح. رأيك وملاحظاتك تسهم بشكل مباشر في تطوير خدماتنا والارتقاء بتجربة المستفيدين وأصحاب العلاقة."}
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      const surveyId = activeSurvey.data?.survey.id;
                      if (surveyId) window.localStorage.removeItem(completionKey(surveyId));
                      setCompletionState("none");
                    }}
                    className="inline-flex h-11 items-center gap-2 rounded-full border border-[#165b2a] bg-[#165b2a]/10 px-6 text-sm font-bold text-[#165b2a] hover:bg-[#165b2a] hover:text-white transition-colors cursor-pointer"
                  >
                    <span>تعبئة الاستبيان مجددًا</span>
                  </button>
                  <a
                    href="/"
                    className="inline-flex h-11 items-center gap-2 rounded-full bg-[#165b2a] px-6 text-sm font-bold text-white shadow-sm transition hover:bg-[#10461f]"
                  >
                    <span>العودة للرئيسية</span>
                    <ChevronLeft className="h-4 w-4" />
                  </a>
                  <a
                    href="/governance"
                    className="inline-flex h-11 items-center gap-2 rounded-full border border-[#d9c995] bg-white px-6 text-sm font-bold text-[#155029] hover:bg-[#f8f6ec]"
                  >
                    <span>استعراض وثائق الحوكمة</span>
                  </a>
                </div>
              </div>
            ) : !activeSurvey.data?.survey || questions.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[#d3c18e] bg-white px-7 py-14 text-center">
                <ClipboardCheck className="mx-auto h-12 w-12 text-[#a67017]" />
                <h2 className="display-font mt-4 text-2xl font-extrabold text-[#155029]">لا يوجد استبيان منشور حاليًا</h2>
                <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#5c7663]">
                  سيظهر الاستبيان المعتمد هنا فور نشره من إدارة الجمعية. نرحب بك للعودة قريبًا.
                </p>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-8">
                {/* Section 1: أولاً: بيانات عامة */}
                {q1 && q2 && (
                  <div className="overflow-hidden rounded-3xl border border-[#ded5be] bg-white shadow-[0_10px_30px_rgba(22,91,42,0.04)]">
                    <div className="flex items-center gap-3 border-b border-[#ece4d0] bg-[#f8f5eb] px-6 py-4 sm:px-8">
                      <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#165b2a] text-[#f2cd78]">
                        <Users className="h-5 w-5" />
                      </span>
                      <div>
                        <h2 className="text-lg font-extrabold text-[#155029] sm:text-xl">أولاً: بيانات عامة</h2>
                        <p className="text-xs font-semibold text-[#738879]">البيانات التعريفية وطبيعة العلاقة بالجمعية</p>
                      </div>
                    </div>

                    <div className="space-y-8 p-6 sm:p-8">
                      {/* Q1 */}
                      <div>
                        <label className="block text-base font-extrabold text-[#155029]">
                          1. {q1.prompt}
                          {q1.isRequired === "yes" && <span className="mr-1 text-red-600 font-bold">*</span>}
                        </label>
                        <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3">
                          {parseOptions(q1.optionsJson).map(option => {
                            const isOther = option.includes("أخرى");
                            const isSelected = answers[q1.id]?.startsWith("أخرى")
                              ? isOther
                              : answers[q1.id] === option;

                            return (
                              <label
                                key={option}
                                className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-bold transition-all ${
                                  isSelected
                                    ? "border-[#165b2a] bg-[#edf6e9] text-[#165b2a] shadow-sm"
                                    : "border-[#e5decb] bg-white text-[#476050] hover:border-[#b89e5b] hover:bg-[#faf9f4]"
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`question-${q1.id}`}
                                  value={option}
                                  checked={isSelected}
                                  onChange={() => {
                                    if (isOther) {
                                      setAnswers(prev => ({ ...prev, [q1.id]: "أخرى" }));
                                    } else {
                                      setAnswers(prev => ({ ...prev, [q1.id]: option }));
                                    }
                                  }}
                                  className="h-4 w-4 accent-[#165b2a]"
                                />
                                <span>{option}</span>
                              </label>
                            );
                          })}
                        </div>

                        {/* Inline input if Other selected */}
                        {answers[q1.id]?.startsWith("أخرى") && (
                          <div className="mt-3 mr-2 sm:max-w-md">
                            <label className="text-xs font-bold text-[#627b6b]">يرجى التحديد:</label>
                            <input
                              type="text"
                              value={otherTextQ1}
                              onChange={e => setOtherTextQ1(e.target.value)}
                              placeholder="حدد صفتك هنا..."
                              className="mt-1 w-full rounded-xl border border-[#165b2a]/40 bg-[#f9fbf8] px-3.5 py-2 text-sm text-[#155029] outline-none focus:border-[#165b2a] focus:ring-1 focus:ring-[#165b2a]"
                            />
                          </div>
                        )}
                      </div>

                      {/* Q2 */}
                      <div className="border-t border-[#f0ebd9] pt-6">
                        <label className="block text-base font-extrabold text-[#155029]">
                          2. {q2.prompt}
                          {q2.isRequired === "yes" && <span className="mr-1 text-red-600 font-bold">*</span>}
                        </label>
                        <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3">
                          {parseOptions(q2.optionsJson).map(option => {
                            const isOther = option.includes("أخرى");
                            const isSelected = answers[q2.id]?.startsWith("أخرى")
                              ? isOther
                              : answers[q2.id] === option;

                            return (
                              <label
                                key={option}
                                className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-bold transition-all ${
                                  isSelected
                                    ? "border-[#165b2a] bg-[#edf6e9] text-[#165b2a] shadow-sm"
                                    : "border-[#e5decb] bg-white text-[#476050] hover:border-[#b89e5b] hover:bg-[#faf9f4]"
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`question-${q2.id}`}
                                  value={option}
                                  checked={isSelected}
                                  onChange={() => {
                                    if (isOther) {
                                      setAnswers(prev => ({ ...prev, [q2.id]: "أخرى" }));
                                    } else {
                                      setAnswers(prev => ({ ...prev, [q2.id]: option }));
                                    }
                                  }}
                                  className="h-4 w-4 accent-[#165b2a]"
                                />
                                <span>{option}</span>
                              </label>
                            );
                          })}
                        </div>

                        {/* Inline input if Other selected */}
                        {answers[q2.id]?.startsWith("أخرى") && (
                          <div className="mt-3 mr-2 sm:max-w-md">
                            <label className="text-xs font-bold text-[#627b6b]">يرجى التحديد:</label>
                            <input
                              type="text"
                              value={otherTextQ2}
                              onChange={e => setOtherTextQ2(e.target.value)}
                              placeholder="حدد الغرض هنا..."
                              className="mt-1 w-full rounded-xl border border-[#165b2a]/40 bg-[#f9fbf8] px-3.5 py-2 text-sm text-[#155029] outline-none focus:border-[#165b2a] focus:ring-1 focus:ring-[#165b2a]"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Section 2: ثانياً: قياس مستوى الرضا (Evaluation Matrix) */}
                {ratingQuestions.length > 0 && (
                  <div className="overflow-hidden rounded-3xl border border-[#ded5be] bg-white shadow-[0_10px_30px_rgba(22,91,42,0.04)]">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#ece4d0] bg-[#f8f5eb] px-6 py-4 sm:px-8">
                      <div className="flex items-center gap-3">
                        <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#165b2a] text-[#f2cd78]">
                          <BarChart3 className="h-5 w-5" />
                        </span>
                        <div>
                          <h2 className="text-lg font-extrabold text-[#155029] sm:text-xl">ثانياً: قياس مستوى الرضا</h2>
                          <p className="text-xs font-semibold text-[#738879]">
                            يرجى تقييم العبارات التالية من خلال اختيار الدرجة المناسبة لكل عبارة:
                          </p>
                        </div>
                      </div>

                      {/* Scale Legend Indicator */}
                      <div className="hidden lg:flex items-center gap-2 rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-[#556e5f] border border-[#e1d9c4]">
                        <span className="text-[#165b2a]">5: ممتاز</span>
                        <span>•</span>
                        <span className="text-[#165b2a]">4: جيد جداً</span>
                        <span>•</span>
                        <span className="text-[#43624f]">3: جيد</span>
                        <span>•</span>
                        <span className="text-[#a67017]">2: مقبول</span>
                        <span>•</span>
                        <span className="text-[#b54a36]">1: يحتاج تحسين</span>
                      </div>
                    </div>

                    {/* Desktop Matrix Table */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full border-collapse text-right">
                        <thead>
                          <tr className="border-b border-[#ece4d0] bg-[#fdfcf9] text-xs font-extrabold text-[#3a5b46]">
                            <th className="w-12 px-4 py-3.5 text-center">م</th>
                            <th className="px-4 py-3.5">العبارة</th>
                            {RATING_LEVELS.map(level => (
                              <th key={level.value} className="w-24 px-2 py-3.5 text-center">
                                <div className="text-sm font-extrabold text-[#155029]">{level.label}</div>
                                <div className="text-[0.7rem] font-bold text-[#899c8e]">{level.number}</div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#f2ecdc]">
                          {ratingQuestions.map((q, index) => {
                            const isSelected = answers[q.id];
                            return (
                              <tr
                                key={q.id}
                                className={`transition-colors hover:bg-[#fbf9f2] ${
                                  isSelected ? "bg-[#fcfdfa]" : ""
                                }`}
                              >
                                <td className="px-4 py-4 text-center text-xs font-extrabold text-[#768c7e]">
                                  {index + 1}
                                </td>
                                <td className="px-4 py-4 text-sm font-bold text-[#1f4a30]">
                                  {q.prompt}
                                  {q.isRequired === "yes" && <span className="mr-1 text-red-600 font-bold">*</span>}
                                </td>
                                {RATING_LEVELS.map(level => {
                                  const checked = answers[q.id] === level.value;
                                  return (
                                    <td key={level.value} className="px-2 py-4 text-center">
                                      <label className="inline-flex cursor-pointer items-center justify-center p-1.5">
                                        <input
                                          type="radio"
                                          name={`rating-${q.id}`}
                                          value={level.value}
                                          checked={checked}
                                          onChange={() =>
                                            setAnswers(prev => ({ ...prev, [q.id]: level.value }))
                                          }
                                          className="h-5 w-5 cursor-pointer accent-[#165b2a]"
                                        />
                                      </label>
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Rating Cards (Clean & Accessible) */}
                    <div className="divide-y divide-[#f2ecdc] md:hidden">
                      {ratingQuestions.map((q, index) => (
                        <div key={q.id} className="p-5 space-y-3">
                          <div className="flex items-start gap-2.5">
                            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#e8f0df] text-xs font-extrabold text-[#165b2a]">
                              {index + 1}
                            </span>
                            <p className="text-sm font-bold text-[#155029]">
                              {q.prompt}
                              {q.isRequired === "yes" && <span className="mr-1 text-red-600 font-bold">*</span>}
                            </p>
                          </div>

                          <div className="grid grid-cols-5 gap-1.5 pt-1">
                            {RATING_LEVELS.map(level => {
                              const checked = answers[q.id] === level.value;
                              return (
                                <button
                                  type="button"
                                  key={level.value}
                                  onClick={() =>
                                    setAnswers(prev => ({ ...prev, [q.id]: level.value }))
                                  }
                                  className={`flex flex-col items-center justify-center rounded-xl border py-2.5 text-center transition-all ${
                                    checked
                                      ? "border-[#165b2a] bg-[#165b2a] text-white shadow-sm"
                                      : "border-[#e0d8c3] bg-white text-[#476050] hover:border-[#b89e5b]"
                                  }`}
                                >
                                  <span className="text-xs font-extrabold">{level.number}</span>
                                  <span className="text-[0.62rem] font-bold leading-tight mt-0.5 opacity-90">
                                    {level.label}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Section 3: ثالثاً: التوصية والتطوير */}
                {(q11 || q12 || q13) && (
                  <div className="overflow-hidden rounded-3xl border border-[#ded5be] bg-white shadow-[0_10px_30px_rgba(22,91,42,0.04)]">
                    <div className="flex items-center gap-3 border-b border-[#ece4d0] bg-[#f8f5eb] px-6 py-4 sm:px-8">
                      <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#165b2a] text-[#f2cd78]">
                        <Lightbulb className="h-5 w-5" />
                      </span>
                      <div>
                        <h2 className="text-lg font-extrabold text-[#155029] sm:text-xl">ثالثاً: التوصية والتطوير</h2>
                        <p className="text-xs font-semibold text-[#738879]">تقييم التجربة وتقديم المقترحات التطويرية</p>
                      </div>
                    </div>

                    <div className="space-y-7 p-6 sm:p-8">
                      {/* Q11: Recommend */}
                      {q11 && (
                        <div>
                          <label className="block text-base font-extrabold text-[#155029]">
                            9. {q11.prompt}
                            {q11.isRequired === "yes" && <span className="mr-1 text-red-600 font-bold">*</span>}
                          </label>
                          <div className="mt-4 flex flex-wrap gap-2.5 sm:gap-3">
                            {parseOptions(q11.optionsJson).map(option => {
                              const isSelected = answers[q11.id] === option;
                              return (
                                <label
                                  key={option}
                                  className={`flex cursor-pointer items-center gap-2.5 rounded-2xl border px-5 py-3 text-sm font-bold transition-all ${
                                    isSelected
                                      ? "border-[#165b2a] bg-[#edf6e9] text-[#165b2a] shadow-sm"
                                      : "border-[#e5decb] bg-white text-[#476050] hover:border-[#b89e5b] hover:bg-[#faf9f4]"
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    name={`question-${q11.id}`}
                                    value={option}
                                    checked={isSelected}
                                    onChange={() => setAnswers(prev => ({ ...prev, [q11.id]: option }))}
                                    className="h-4 w-4 accent-[#165b2a]"
                                  />
                                  <span>{option}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Q12 & Q13: Text Areas in 2 Columns */}
                      <div className="grid gap-6 sm:grid-cols-2 pt-2 border-t border-[#f0ebd9]">
                        {q12 && (
                          <div>
                            <label className="block text-sm font-extrabold text-[#155029]">
                              10. {q12.prompt}
                              <span className="mr-1.5 text-xs font-normal text-[#758d7c]">(اختياري)</span>
                            </label>
                            <textarea
                              rows={4}
                              value={answers[q12.id] ?? ""}
                              onChange={e => setAnswers(prev => ({ ...prev, [q12.id]: e.target.value }))}
                              placeholder="اكتب رأيك هنا ..."
                              maxLength={1000}
                              className="mt-2.5 w-full resize-y rounded-2xl border border-[#ded7c4] bg-[#faf8f2] p-4 text-sm leading-7 text-[#234531] outline-none transition-colors focus:border-[#165b2a] focus:bg-white focus:ring-1 focus:ring-[#165b2a]"
                            />
                          </div>
                        )}

                        {q13 && (
                          <div>
                            <label className="block text-sm font-extrabold text-[#155029]">
                              11. {q13.prompt}
                              <span className="mr-1.5 text-xs font-normal text-[#758d7c]">(اختياري)</span>
                            </label>
                            <textarea
                              rows={4}
                              value={answers[q13.id] ?? ""}
                              onChange={e => setAnswers(prev => ({ ...prev, [q13.id]: e.target.value }))}
                              placeholder="اكتب مقترحك أو ملاحظتك هنا ..."
                              maxLength={1000}
                              className="mt-2.5 w-full resize-y rounded-2xl border border-[#ded7c4] bg-[#faf8f2] p-4 text-sm leading-7 text-[#234531] outline-none transition-colors focus:border-[#165b2a] focus:bg-white focus:ring-1 focus:ring-[#165b2a]"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Section 4: رابعاً: التواصل الاختياري */}
                {q14 && (
                  <div className="overflow-hidden rounded-3xl border border-[#ded5be] bg-white shadow-[0_10px_30px_rgba(22,91,42,0.04)]">
                    <div className="flex items-center gap-3 border-b border-[#ece4d0] bg-[#f8f5eb] px-6 py-4 sm:px-8">
                      <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#165b2a] text-[#f2cd78]">
                        <HeartHandshake className="h-5 w-5" />
                      </span>
                      <div>
                        <h2 className="text-lg font-extrabold text-[#155029] sm:text-xl">رابعاً: التواصل الاختياري</h2>
                        <p className="text-xs font-semibold text-[#738879]">
                          قنوات التواصل المباشر في حال الرغبة بمتابعة ملاحظتك
                        </p>
                      </div>
                    </div>

                    <div className="p-6 sm:p-8 space-y-6">
                      <div>
                        <label className="block text-base font-extrabold text-[#155029]">
                          12. {q14.prompt}
                          {q14.isRequired === "yes" && <span className="mr-1 text-red-600 font-bold">*</span>}
                        </label>
                        <div className="mt-3.5 flex gap-4">
                          {["نعم", "لا"].map(opt => {
                            const isSelected = answers[q14.id] === opt;
                            return (
                              <label
                                key={opt}
                                className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-6 py-3 text-sm font-bold transition-all ${
                                  isSelected
                                    ? "border-[#165b2a] bg-[#edf6e9] text-[#165b2a] shadow-sm"
                                    : "border-[#e5decb] bg-white text-[#476050] hover:border-[#b89e5b] hover:bg-[#faf9f4]"
                                }`}
                              >
                                <input
                                  type="radio"
                                  name={`question-${q14.id}`}
                                  value={opt}
                                  checked={isSelected}
                                  onChange={() => setAnswers(prev => ({ ...prev, [q14.id]: opt }))}
                                  className="h-4 w-4 accent-[#165b2a]"
                                />
                                <span>{opt}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      {/* Sub-inputs when (نعم) is chosen */}
                      {answers[q14.id] === "نعم" && (
                        <div className="rounded-2xl border border-[#165b2a]/20 bg-[#fbfdf9] p-5 sm:p-6 space-y-4">
                          <p className="text-xs font-extrabold text-[#165b2a]">
                            في حال اختيار (نعم)، يرجى تعبئة البيانات التالية:
                          </p>

                          <div className="grid gap-4 sm:grid-cols-3">
                            <label className="block text-xs font-bold text-[#355843]">
                              <span className="flex items-center gap-1.5 mb-1.5 text-[#165b2a]">
                                <User className="h-3.5 w-3.5" />
                                الاسم
                              </span>
                              <input
                                type="text"
                                value={contactName}
                                onChange={e => setContactName(e.target.value)}
                                placeholder="الاسم الكريم"
                                className="h-10 w-full rounded-xl border border-[#ded7c4] bg-white px-3 text-sm outline-none focus:border-[#165b2a]"
                              />
                            </label>

                            <label className="block text-xs font-bold text-[#355843]">
                              <span className="flex items-center gap-1.5 mb-1.5 text-[#165b2a]">
                                <Phone className="h-3.5 w-3.5" />
                                رقم الجوال
                              </span>
                              <input
                                type="tel"
                                value={contactPhone}
                                onChange={e => setContactPhone(e.target.value)}
                                placeholder="05XXXXXXXX"
                                dir="ltr"
                                className="h-10 w-full rounded-xl border border-[#ded7c4] bg-white px-3 text-sm text-right outline-none focus:border-[#165b2a]"
                              />
                            </label>

                            <label className="block text-xs font-bold text-[#355843]">
                              <span className="flex items-center gap-1.5 mb-1.5 text-[#165b2a]">
                                <Mail className="h-3.5 w-3.5" />
                                البريد الإلكتروني
                              </span>
                              <input
                                type="email"
                                value={contactEmail}
                                onChange={e => setContactEmail(e.target.value)}
                                placeholder="example@domain.com"
                                dir="ltr"
                                className="h-10 w-full rounded-xl border border-[#ded7c4] bg-white px-3 text-sm text-right outline-none focus:border-[#165b2a]"
                              />
                            </label>
                          </div>
                        </div>
                      )}

                      {/* Note */}
                      <p className="text-xs font-medium text-[#768e7f] flex items-center gap-1.5">
                        <LockKeyhole className="h-3.5 w-3.5 text-[#a67017] shrink-0" />
                        <span>ملاحظة: بيانات التواصل اختيارية ولا تستخدم إلا للرد على ملاحظتك.</span>
                      </p>
                    </div>
                  </div>
                )}

                {/* Footer Action Card with Authentic Document Branding */}
                <div className="flex flex-col gap-6 rounded-3xl border border-[#d9c995] bg-gradient-to-r from-[#fbf8ed] via-[#f7f3e4] to-[#fbf8ed] p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-8">
                  <div className="flex items-center gap-3.5">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#165b2a] text-[#f2cd78]">
                      <Check className="h-6 w-6" />
                    </span>
                    <div>
                      <h3 className="text-base font-extrabold text-[#155029] sm:text-lg">شكراً لمشاركتك</h3>
                      <p className="text-xs font-bold leading-6 text-[#5b7562]">
                        رأيك يساعدنا على تطوير خدمات الجمعية وتحسين تجربة أصحاب العلاقة.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <Button
                      type="submit"
                      disabled={submitSurvey.isPending}
                      className="h-12 rounded-full bg-[#165b2a] px-8 text-base font-bold text-white shadow-md hover:bg-[#10461f] transition-all cursor-pointer"
                    >
                      {submitSurvey.isPending ? (
                        <>
                          <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                          جاري الإرسال...
                        </>
                      ) : (
                        <>
                          <Send className="ml-2 h-4 w-4" />
                          إرسال الاستبيان
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
