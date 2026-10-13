import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { BarChart3, Check, ClipboardList, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type QuestionDraft = {
  prompt: string;
  helpText: string;
  type: "single_choice" | "rating" | "text";
  optionsText: string;
  isRequired: boolean;
};

type SurveyDraft = {
  title: string;
  description: string;
  status: "draft" | "published";
};

const emptyQuestion = (): QuestionDraft => ({
  prompt: "",
  helpText: "",
  type: "rating",
  optionsText: "",
  isRequired: true,
});
const emptySurvey: SurveyDraft = { title: "", description: "", status: "draft" };

const optionsFromText = (value: string) => value.split("\n").map(option => option.trim()).filter(Boolean);
const optionsToText = (value: string | null) => {
  try {
    const options = JSON.parse(value ?? "[]");
    return Array.isArray(options) ? options.filter((option): option is string => typeof option === "string").join("\n") : "";
  } catch {
    return "";
  }
};

export default function SurveyAdminPanel() {
  const utils = trpc.useUtils();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState<SurveyDraft>(emptySurvey);
  const [questions, setQuestions] = useState<QuestionDraft[]>([emptyQuestion()]);

  const surveys = trpc.surveys.adminList.useQuery();
  const details = trpc.surveys.adminGet.useQuery({ id: selectedId ?? 1 }, { enabled: selectedId !== null });
  const results = trpc.surveys.adminResults.useQuery({ surveyId: selectedId ?? 1 }, { enabled: selectedId !== null });

  const refresh = async () => {
    await Promise.all([
      utils.surveys.adminList.invalidate(),
      utils.surveys.publicActive.invalidate(),
      selectedId ? utils.surveys.adminGet.invalidate({ id: selectedId }) : Promise.resolve(),
      selectedId ? utils.surveys.adminResults.invalidate({ surveyId: selectedId }) : Promise.resolve(),
    ]);
  };

  const createSurvey = trpc.surveys.create.useMutation({
    onSuccess: async ({ surveyId }) => {
      await refresh();
      setSelectedId(surveyId);
      toast.success("تم إنشاء الاستبيان بنجاح");
    },
    onError: () => toast.error("تعذر إنشاء الاستبيان. راجع البيانات وحاول مرة أخرى."),
  });
  const updateSurvey = trpc.surveys.update.useMutation({
    onSuccess: async () => {
      await refresh();
      toast.success("تم حفظ تحديثات الاستبيان");
    },
    onError: () => toast.error("تعذر حفظ التحديثات. حاول مرة أخرى."),
  });
  const deleteSurvey = trpc.surveys.delete.useMutation({
    onSuccess: async () => {
      await Promise.all([utils.surveys.adminList.invalidate(), utils.surveys.publicActive.invalidate()]);
      resetForm();
      toast.success("تم حذف الاستبيان");
    },
    onError: () => toast.error("تعذر حذف الاستبيان. حاول مرة أخرى."),
  });

  useEffect(() => {
    if (!details.data) return;
    setForm({ title: details.data.survey.title, description: details.data.survey.description ?? "", status: details.data.survey.status });
    setQuestions(details.data.questions.map(question => ({
      prompt: question.prompt,
      helpText: question.helpText ?? "",
      type: question.type,
      optionsText: optionsToText(question.optionsJson),
      isRequired: question.isRequired === "yes",
    })));
  }, [details.data]);

  const responsesByQuestion = useMemo(() => {
    const collection = new Map<number, string[]>();
    results.data?.answers.forEach(answer => collection.set(answer.questionId, [...(collection.get(answer.questionId) ?? []), answer.value]));
    return collection;
  }, [results.data?.answers]);

  function resetForm() {
    setSelectedId(null);
    setForm(emptySurvey);
    setQuestions([emptyQuestion()]);
  }

  function updateQuestion(index: number, changes: Partial<QuestionDraft>) {
    setQuestions(current => current.map((question, questionIndex) => questionIndex === index ? { ...question, ...changes } : question));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (questions.some(question => question.type === "single_choice" && optionsFromText(question.optionsText).length < 2)) {
      toast.error("أضف خيارين على الأقل لكل سؤال اختيار واحد.");
      return;
    }
    const payload = {
      ...form,
      questions: questions.map(question => ({
        prompt: question.prompt,
        helpText: question.helpText,
        type: question.type,
        options: optionsFromText(question.optionsText),
        isRequired: question.isRequired,
      })),
    };
    if (selectedId) updateSurvey.mutate({ id: selectedId, ...payload });
    else createSurvey.mutate(payload);
  }

  const isSaving = createSurvey.isPending || updateSurvey.isPending;

  return <div className="space-y-7" dir="rtl">
    <div className="grid gap-7 xl:grid-cols-[0.72fr_1.28fr]">
      <aside className="h-fit rounded-bl-[2rem] rounded-tr-[2rem] border border-[#d9c995] bg-white p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3"><div><p className="section-label">استطلاعات الجمعية</p><h2 className="display-font mt-2 text-xl font-bold text-[#155029]">سجل الاستبيانات</h2></div><button type="button" onClick={resetForm} className="grid h-9 w-9 place-items-center rounded-full bg-[#165b2a] text-white" aria-label="إضافة استبيان"><Plus className="h-4 w-4" /></button></div>
        {surveys.isLoading ? <div className="grid place-items-center py-14"><Loader2 className="h-5 w-5 animate-spin text-[#165b2a]" /></div> : surveys.error ? <p className="mt-6 rounded-xl bg-[#fff5f1] px-4 py-4 text-center text-sm font-bold leading-7 text-[#a54b36]">تعذر تحميل قائمة الاستبيانات. أعد المحاولة لاحقًا.</p> : surveys.data?.length ? <div className="mt-5 divide-y divide-[#ece5d2]">{surveys.data.map(survey => <button key={survey.id} type="button" onClick={() => setSelectedId(survey.id)} className={`w-full px-1 py-4 text-right transition-colors hover:bg-[#f8f7ed] ${selectedId === survey.id ? "bg-[#edf5e9]" : ""}`}><div className="flex items-center justify-between gap-3"><span className="display-font text-sm font-bold text-[#155029]">{survey.title}</span><span className={`rounded-full px-2 py-1 text-[0.65rem] font-bold ${survey.status === "published" ? "bg-[#e8f0df] text-[#155029]" : "bg-[#f8edd0] text-[#916215]"}`}>{survey.status === "published" ? "منشور" : "مسودة"}</span></div><p className="mt-2 text-xs text-[#67806e]">آخر تحديث: {new Intl.DateTimeFormat("ar-SA", { day: "numeric", month: "short", year: "numeric" }).format(new Date(survey.updatedAt))}</p></button>)}</div> : <div className="py-12 text-center"><ClipboardList className="mx-auto h-7 w-7 text-[#a67017]" /><p className="mt-3 text-sm font-bold text-[#155029]">لا توجد استبيانات بعد</p><p className="mt-2 text-xs leading-6 text-[#617b68]">ابدأ بإضافة استبيان وحفظه كمسودة أو نشره للزوار.</p></div>}
      </aside>

      <form onSubmit={submit} className="rounded-bl-[2rem] rounded-tr-[2rem] border border-[#ddd2b2] bg-[#fbf8ed] p-5 sm:p-7">
        {selectedId && details.isLoading ? <div className="grid min-h-64 place-items-center"><Loader2 className="h-6 w-6 animate-spin text-[#165b2a]" /></div> : selectedId && details.error ? <p className="rounded-xl bg-[#fff5f1] px-4 py-4 text-center text-sm font-bold leading-7 text-[#a54b36]">تعذر تحميل تفاصيل الاستبيان. أعد اختيار الاستبيان أو حاول لاحقًا.</p> : <>
          <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="section-label">إدارة الاستبيان</p><h2 className="display-font mt-2 text-xl font-bold text-[#155029]">{selectedId ? "تحديث الاستبيان" : "استبيان جديد"}</h2><p className="mt-1 text-xs leading-6 text-[#6a836f]">أضف المحتوى والأسئلة المعتمدة فقط.</p></div>{selectedId && <button type="button" onClick={() => { if (window.confirm("سيؤدي حذف الاستبيان إلى حذف إجاباتِه نهائيًا. هل تريد المتابعة؟")) deleteSurvey.mutate({ id: selectedId }); }} disabled={deleteSurvey.isPending} className="inline-flex items-center gap-1 text-xs font-bold text-[#a54b36] disabled:opacity-50"><Trash2 className="h-3.5 w-3.5" />حذف</button>}</div>
          <div className="mt-6 grid gap-4"><label className="grid gap-1.5 text-sm font-bold text-[#355943]">عنوان الاستبيان<input required minLength={5} maxLength={240} value={form.title} onChange={event => setForm(current => ({ ...current, title: event.target.value }))} placeholder="مثال: استبيان احتياجات المستفيدين" className="h-10 rounded-lg border border-[#d8d0b9] bg-white px-3 text-sm font-medium outline-none focus:border-[#165b2a]" /></label><label className="grid gap-1.5 text-sm font-bold text-[#355943]">وصف موجز <span className="font-normal text-[#6b8371]">اختياري</span><textarea value={form.description} onChange={event => setForm(current => ({ ...current, description: event.target.value }))} maxLength={2000} rows={3} className="resize-y rounded-lg border border-[#d8d0b9] bg-white px-3 py-2 text-sm font-medium leading-6 outline-none focus:border-[#165b2a]" /></label><label className="grid gap-1.5 text-sm font-bold text-[#355943]">الحالة<select value={form.status} onChange={event => setForm(current => ({ ...current, status: event.target.value as SurveyDraft["status"] }))} className="h-10 rounded-lg border border-[#d8d0b9] bg-white px-3 text-sm font-medium outline-none focus:border-[#165b2a]"><option value="draft">مسودة</option><option value="published">منشور للزوار</option></select></label></div>
          <div className="mt-8 border-t border-[#e5dcc3] pt-6"><div className="flex items-center justify-between gap-4"><div><p className="text-sm font-extrabold text-[#155029]">أسئلة الاستبيان</p><p className="mt-1 text-xs text-[#6a836f]">حتى 12 سؤالًا. تظهر بالترتيب نفسه للزوار.</p></div><button type="button" onClick={() => setQuestions(current => [...current, emptyQuestion()])} disabled={questions.length >= 12} className="inline-flex h-9 items-center gap-1 rounded-full border border-[#bda66c] bg-white px-3 text-xs font-bold text-[#155029] disabled:opacity-50"><Plus className="h-3.5 w-3.5" />إضافة سؤال</button></div><div className="mt-5 space-y-4">{questions.map((question, index) => <section key={index} className="rounded-2xl border border-[#ded6c0] bg-white p-4"><div className="flex items-center justify-between gap-3"><span className="grid h-7 w-7 place-items-center rounded-full bg-[#e8f0df] text-xs font-extrabold text-[#155029]">{index + 1}</span>{questions.length > 1 && <button type="button" onClick={() => setQuestions(current => current.filter((_, questionIndex) => questionIndex !== index))} className="text-xs font-bold text-[#a54b36]">حذف السؤال</button>}</div><div className="mt-4 grid gap-3"><label className="grid gap-1 text-xs font-bold text-[#355943]">نص السؤال<input required minLength={4} maxLength={500} value={question.prompt} onChange={event => updateQuestion(index, { prompt: event.target.value })} className="h-10 rounded-lg border border-[#d8d0b9] px-3 text-sm outline-none focus:border-[#165b2a]" /></label><div className="grid gap-3 sm:grid-cols-2"><label className="grid gap-1 text-xs font-bold text-[#355943]">نوع السؤال<select value={question.type} onChange={event => updateQuestion(index, { type: event.target.value as QuestionDraft["type"] })} className="h-10 rounded-lg border border-[#d8d0b9] px-3 text-sm outline-none focus:border-[#165b2a]"><option value="rating">تقييم من 1 إلى 5</option><option value="single_choice">اختيار واحد</option><option value="text">إجابة نصية</option></select></label><label className="flex items-end gap-2 pb-2 text-xs font-bold text-[#355943]"><input type="checkbox" checked={question.isRequired} onChange={event => updateQuestion(index, { isRequired: event.target.checked })} className="h-4 w-4 accent-[#165b2a]" />إجابة مطلوبة</label></div>{question.type === "single_choice" && <label className="grid gap-1 text-xs font-bold text-[#355943]">الخيارات <span className="font-normal text-[#6a836f]">خيار واحد في كل سطر</span><textarea required rows={4} value={question.optionsText} onChange={event => updateQuestion(index, { optionsText: event.target.value })} className="resize-y rounded-lg border border-[#d8d0b9] px-3 py-2 text-sm leading-6 outline-none focus:border-[#165b2a]" placeholder={"الخيار الأول\nالخيار الثاني"} /></label>}<label className="grid gap-1 text-xs font-bold text-[#355943]">توضيح مساعد <span className="font-normal text-[#6a836f]">اختياري</span><input maxLength={500} value={question.helpText} onChange={event => updateQuestion(index, { helpText: event.target.value })} className="h-10 rounded-lg border border-[#d8d0b9] px-3 text-sm outline-none focus:border-[#165b2a]" /></label></div></section>)}</div></div>
          <Button type="submit" disabled={isSaving} className="mt-7 h-11 w-full rounded-full bg-[#165b2a] font-bold text-white hover:bg-[#10461f]">{isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="ml-2 h-4 w-4" />{selectedId ? "حفظ التحديث" : "إنشاء الاستبيان"}</>}</Button>
        </>}
      </form>
    </div>

    {selectedId && <section className="rounded-bl-[2rem] rounded-tr-[2rem] border border-[#d9c995] bg-white p-5 sm:p-7"><div className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-full bg-[#e8f0df] text-[#155029]"><BarChart3 className="h-5 w-5" /></span><div><p className="section-label">ملخص الإجابات</p><h2 className="display-font mt-1 text-xl font-bold text-[#155029]">نتائج الاستبيان</h2></div></div>{results.isLoading ? <div className="grid place-items-center py-12"><Loader2 className="h-5 w-5 animate-spin text-[#165b2a]" /></div> : results.error ? <p className="mt-6 rounded-xl bg-[#fff5f1] px-4 py-4 text-center text-sm font-bold leading-7 text-[#a54b36]">تعذر تحميل نتائج الاستبيان. لم تُجرَ أي تعديلات على البيانات.</p> : <div className="mt-6"><div className="inline-flex items-center gap-2 rounded-full bg-[#165b2a] px-4 py-2 text-sm font-bold text-white"><Check className="h-4 w-4" />{results.data?.responses.length ?? 0} استجابة مكتملة</div>{results.data?.responses.length ? <div className="mt-6 grid gap-4 lg:grid-cols-2">{results.data.questions.map((question, index) => { const answerValues = responsesByQuestion.get(question.id) ?? []; const ratings = answerValues.map(value => Number(value)).filter(value => value >= 1 && value <= 5); const average = ratings.length ? (ratings.reduce((sum, value) => sum + value, 0) / ratings.length).toFixed(1) : null; const options = optionsToText(question.optionsJson).split("\n").filter(Boolean); return <article key={question.id} className="rounded-2xl border border-[#e6ddc5] bg-[#fbf8ed] p-5"><p className="text-xs font-bold text-[#a67017]">السؤال {index + 1}</p><h3 className="mt-2 text-sm font-extrabold leading-7 text-[#155029]">{question.prompt}</h3>{question.type === "rating" ? <p className="mt-5 text-2xl font-extrabold text-[#165b2a]">{average ?? "—"}<span className="mr-2 text-xs font-bold text-[#6b8371]">من 5 · {ratings.length} إجابة</span></p> : question.type === "single_choice" ? <div className="mt-5 space-y-3">{options.map(option => { const count = answerValues.filter(value => value === option).length; const percentage = answerValues.length ? Math.round((count / answerValues.length) * 100) : 0; return <div key={option}><div className="flex justify-between gap-3 text-xs font-bold text-[#4d6c58]"><span>{option}</span><span>{count} · {percentage}%</span></div><div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#e7e2d1]"><div className="h-full rounded-full bg-[#a67017]" style={{ width: `${percentage}%` }} /></div></div>; })}</div> : <div className="mt-5 space-y-2">{answerValues.slice(0, 3).map((value, answerIndex) => <p key={answerIndex} className="rounded-xl bg-white px-3 py-2 text-xs leading-6 text-[#55705d]">{value}</p>)}{answerValues.length > 3 && <p className="text-xs font-bold text-[#6a836f]">توجد {answerValues.length - 3} إجابات نصية إضافية.</p>}</div>}</article>; })}</div> : <p className="mt-6 text-sm leading-7 text-[#617b68]">لا توجد إجابات مسجلة بعد. ستظهر النتائج المجمعة هنا فور مشاركة الزوار.</p>}</div>}</section>}
  </div>;
}
