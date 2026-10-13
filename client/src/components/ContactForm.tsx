/**
 * نموذج تواصل مؤسسي: يحفظ الرسالة ويعطي الزائر حالة نجاح واضحة بعد الإرسال.
 */
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, FileText, LoaderCircle, Mail, MessageCircle, Paperclip, Send, ShieldCheck, Sparkles, X } from "lucide-react";
import { FormEvent, useState } from "react";

type ContactValues = {
  senderName: string;
  senderEmail: string;
  phone: string;
  subject: string;
  message: string;
};

type PreparedAttachment = {
  name: string;
  type: "application/pdf" | "image/jpeg" | "image/png" | "application/msword" | "application/vnd.openxmlformats-officedocument.wordprocessingml.document" | "application/vnd.ms-excel" | "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  size: number;
  base64: string;
};

const initialValues: ContactValues = { senderName: "", senderEmail: "", phone: "", subject: "", message: "" };
const acceptedTypes = new Set<PreparedAttachment["type"]>([
  "application/pdf", "image/jpeg", "image/png", "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);
const maxAttachmentSize = 5 * 1024 * 1024;
const formatSize = (size: number) => `${Math.ceil(size / 1024)} كيلوبايت`;
const inputClassName = "h-12 rounded-2xl border border-white/15 bg-[#0d4626]/55 px-4 text-base font-medium text-white shadow-inner shadow-black/10 outline-none transition-all duration-200 placeholder:text-white/35 hover:border-white/30 focus:border-[#f2cd78] focus:bg-[#0d4626] focus:ring-4 focus:ring-[#e6bd67]/10 sm:text-sm";

const readAsBase64 = (file: File) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => {
    const value = typeof reader.result === "string" ? reader.result.split(",")[1] : undefined;
    if (value) resolve(value); else reject(new Error("Unable to read file"));
  };
  reader.onerror = () => reject(reader.error ?? new Error("Unable to read file"));
  reader.readAsDataURL(file);
});

export default function ContactForm() {
  const [values, setValues] = useState<ContactValues>(initialValues);
  const [attachments, setAttachments] = useState<PreparedAttachment[]>([]);
  const [attachmentError, setAttachmentError] = useState("");
  const [isPreparingFiles, setIsPreparingFiles] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const submit = trpc.contact.submit.useMutation({
    onSuccess: result => {
      setValues(initialValues);
      setAttachments([]);
      setSuccessMessage(result.delivered
        ? `تم إرسال رسالتكم إلى فريق الجمعية بنجاح${result.attachmentCount ? `، مع ${result.attachmentCount} مرفق.` : "."}`
        : "تم استلام رسالتكم وحفظها لدى فريق الجمعية، وسيتم التواصل معكم قريبًا.");
    },
  });

  const onChooseFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const chosenFiles = Array.from(event.target.files ?? []);
    event.target.value = "";
    setAttachmentError("");
    if (!chosenFiles.length) return;
    if (attachments.length + chosenFiles.length > 3) {
      setAttachmentError("يمكن إرفاق ثلاثة ملفات كحد أقصى مع الرسالة.");
      return;
    }
    const invalidFile = chosenFiles.find(file => !acceptedTypes.has(file.type as PreparedAttachment["type"]) || file.size > maxAttachmentSize);
    if (invalidFile) {
      setAttachmentError("يرجى اختيار PDF أو صورة JPG/PNG أو مستند Word/Excel بحجم لا يتجاوز 5 ميغابايت للملف.");
      return;
    }
    setIsPreparingFiles(true);
    try {
      const prepared = await Promise.all(chosenFiles.map(async file => ({
        name: file.name,
        type: file.type as PreparedAttachment["type"],
        size: file.size,
        base64: await readAsBase64(file),
      })));
      setAttachments(current => [...current, ...prepared]);
    } catch {
      setAttachmentError("تعذر تجهيز المرفق. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsPreparingFiles(false);
    }
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccessMessage("");
    submit.mutate({ ...values, attachments });
  };

  const startAnotherMessage = () => {
    setSuccessMessage("");
    submit.reset();
  };

  return (
    <section id="تواصل" className="relative isolate overflow-hidden bg-[#123f25] py-20 text-white lg:py-28">
      <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(75%_100%_at_12%_0%,rgba(230,189,103,0.18),transparent_70%)]" aria-hidden="true" />
      <div className="absolute bottom-0 right-[8%] h-64 w-64 rounded-full border border-[#e6bd67]/10" aria-hidden="true" />
      <div className="container relative z-10 grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <div className="pt-2 lg:pb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#e6bd67]/35 bg-white/5 px-3 py-1.5 text-xs font-bold text-[#f2cd78]">
            <Sparkles className="h-3.5 w-3.5" /> مساحة تعاون مباشرة
          </div>
          <p className="section-label mt-7 !text-[#e6bd67] before:!bg-[#e6bd67]">لنبنِ الأثر معًا</p>
          <h2 className="display-font mt-4 max-w-xl text-3xl font-extrabold leading-[1.55] sm:text-4xl">فكرةٌ واضحة اليوم، قد تصبح مبادرةً تنمو غدًا.</h2>
          <p className="mt-5 max-w-xl text-base leading-8 text-[#e7f0df]/85">أرسل اقتراحك أو استفسارك أو طلب الشراكة. تحفظ رسالتك لدى الجمعية ويصل إشعار لفريق المتابعة، لتبقى الخطوة التالية واضحة وموثقة.</p>
          <div className="mt-8 flex flex-wrap items-center gap-4 text-sm">
            <a href="mailto:info@acsd.sa" className="inline-flex items-center gap-2 font-bold text-[#f2cd78] transition-colors hover:text-white"><Mail className="h-4 w-4" />info@acsd.sa</a>
            <span className="hidden h-4 w-px bg-white/20 sm:block" />
            <span className="inline-flex items-center gap-2 text-white/70"><ShieldCheck className="h-4 w-4 text-[#9ccf89]" />تُراجع الرسائل من فريق الجمعية</span>
          </div>
        </div>

        <form onSubmit={onSubmit} className="contact-form-frame relative overflow-hidden rounded-bl-[3.5rem] rounded-tr-[3.5rem] border border-white/15 bg-[#0f4b29]/90 p-5 shadow-[0_28px_70px_rgba(0,0,0,0.22)] sm:p-8">
          <div className="absolute left-0 top-0 h-24 w-24 rounded-br-[4rem] border-b border-r border-[#e6bd67]/20" aria-hidden="true" />
          {successMessage ? (
            <div className="contact-success relative grid min-h-[32rem] place-items-center overflow-hidden px-4 text-center">
              <div className="success-field-ring absolute h-56 w-56 rounded-full border border-[#e6bd67]/30" aria-hidden="true" />
              <div className="success-field-ring success-field-ring-delay absolute h-80 w-80 rounded-full border border-[#1a7cab]/25" aria-hidden="true" />
              <div className="relative z-10 max-w-sm">
                <span className="success-seal mx-auto grid h-20 w-20 place-items-center rounded-full bg-[#e6bd67] text-[#155029] shadow-[0_0_0_9px_rgba(230,189,103,0.12)]"><CheckCircle2 className="h-10 w-10" strokeWidth={1.7} /></span>
                <p className="section-label mt-7 !text-[#f2cd78] before:!bg-[#f2cd78]">تم الاستلام</p>
                <h3 className="display-font mt-4 text-2xl font-extrabold text-white">وصلت رسالتك إلى المسار الصحيح.</h3>
                <p role="status" className="mt-4 text-sm leading-7 text-white/80">{successMessage}</p>
                <Button type="button" onClick={startAnotherMessage} className="mt-8 h-11 rounded-full border border-[#e6bd67]/70 bg-transparent px-5 font-bold text-[#f2cd78] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#e6bd67] hover:text-[#155029] active:scale-[0.97]">إرسال رسالة أخرى</Button>
              </div>
            </div>
          ) : <>
            <div className="relative z-10 mb-7 flex items-start justify-between gap-4 border-b border-white/10 pb-6">
              <div className="flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#e6bd67] text-[#155029] shadow-lg shadow-[#0a2d19]/20"><MessageCircle className="h-5 w-5" /></span>
                <div><h3 className="display-font text-xl font-bold">اكتب رسالتك</h3><p className="mt-1 text-xs text-white/65">الحقول المعلّمة مطلوبة لإتمام المتابعة.</p></div>
              </div>
              <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[0.68rem] font-bold text-white/65">خطوة واحدة</span>
            </div>
            <FieldSet className="relative z-10 gap-4">
              <FieldGroup className="grid gap-4 sm:grid-cols-2">
                <Field className="gap-2"><FieldLabel htmlFor="sender-name" className="text-sm font-bold text-white">الاسم</FieldLabel><input id="sender-name" required minLength={2} value={values.senderName} onChange={event => setValues({ ...values, senderName: event.target.value })} className={inputClassName} placeholder="الاسم الكامل" /></Field>
                <Field className="gap-2"><FieldLabel htmlFor="sender-email" className="text-sm font-bold text-white">البريد الإلكتروني</FieldLabel><input id="sender-email" required type="email" value={values.senderEmail} onChange={event => setValues({ ...values, senderEmail: event.target.value })} className={inputClassName} placeholder="name@example.com" dir="ltr" /></Field>
              </FieldGroup>
              <FieldGroup className="grid gap-4 sm:grid-cols-2">
                <Field className="gap-2"><FieldLabel htmlFor="sender-phone" className="text-sm font-bold text-white">رقم الجوال <span className="font-normal text-white/50">اختياري</span></FieldLabel><input id="sender-phone" value={values.phone} onChange={event => setValues({ ...values, phone: event.target.value })} className={inputClassName} placeholder="05xxxxxxxx" inputMode="tel" dir="ltr" /></Field>
                <Field className="gap-2"><FieldLabel htmlFor="message-subject" className="text-sm font-bold text-white">موضوع الرسالة</FieldLabel><input id="message-subject" required minLength={3} value={values.subject} onChange={event => setValues({ ...values, subject: event.target.value })} className={inputClassName} placeholder="كيف يمكننا التعاون؟" /></Field>
              </FieldGroup>
              <Field className="gap-2"><FieldLabel htmlFor="message-body" className="text-sm font-bold text-white">الرسالة</FieldLabel><textarea id="message-body" required minLength={10} rows={5} value={values.message} onChange={event => setValues({ ...values, message: event.target.value })} className={`${inputClassName} h-auto resize-none py-3 leading-7`} placeholder="اكتب رسالتك هنا..." /></Field>
            </FieldSet>
            <div className="relative z-10 mt-5 rounded-2xl border border-dashed border-white/25 bg-black/10 p-4 transition-colors hover:border-[#e6bd67]/55">
              <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="flex items-center gap-2 text-sm font-bold"><Paperclip className="h-4 w-4 text-[#f2cd78]" />إرفاق ملفات <span className="font-normal text-white/55">اختياري</span></p><FieldDescription className="mt-1 max-w-md text-xs leading-5 !text-white/55">PDF وJPG وPNG وWord وExcel؛ حتى 3 ملفات، وبحد أقصى 5 ميغابايت للملف.</FieldDescription></div><FieldLabel className="cursor-pointer rounded-full border border-[#e6bd67]/60 px-4 py-2 text-xs font-bold text-[#f2cd78] transition-all duration-200 hover:bg-[#e6bd67] hover:text-[#155029]"><input className="sr-only" type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx" onChange={onChooseFiles} disabled={isPreparingFiles || attachments.length >= 3} />{isPreparingFiles ? "جارٍ تجهيز الملف..." : "اختيار ملفات"}</FieldLabel></div>
              {attachments.length > 0 && <ul className="mt-3 space-y-2" aria-label="المرفقات المختارة">{attachments.map((file, index) => <li key={`${file.name}-${index}`} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-xs"><span className="flex min-w-0 items-center gap-2"><FileText className="h-4 w-4 shrink-0 text-[#f2cd78]" /><span className="truncate font-bold">{file.name}</span><span className="shrink-0 text-white/50">{formatSize(file.size)}</span></span><button type="button" onClick={() => setAttachments(current => current.filter((_, itemIndex) => itemIndex !== index))} className="grid h-7 w-7 place-items-center rounded-full text-white/60 transition-colors hover:bg-white/15 hover:text-white" aria-label={`إزالة ${file.name}`}><X className="h-3.5 w-3.5" /></button></li>)}</ul>}
              {attachmentError && <p role="alert" className="mt-3 text-xs font-bold leading-6 text-[#ffd8c9]">{attachmentError}</p>}
            </div>
            {submit.error && <p role="alert" className="relative z-10 mt-4 rounded-2xl border border-[#e79070]/40 bg-[#c75d3f]/20 px-4 py-3 text-sm font-bold leading-6 text-white">تعذر إرسال الرسالة الآن. يرجى المحاولة مرة أخرى أو مراسلتنا عبر البريد الإلكتروني.</p>}
            <div className="relative z-10 mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-5 text-white/55">بالإرسال، تتيح للجمعية استخدام بياناتك فقط لمتابعة رسالتك.</p>
              <Button type="submit" disabled={submit.isPending || isPreparingFiles} className="h-12 rounded-full bg-[#e6bd67] px-6 font-bold text-[#155029] shadow-[0_10px_24px_rgba(0,0,0,0.2)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#f2cd78] active:scale-[0.97] disabled:opacity-70">{submit.isPending ? <><LoaderCircle className="ml-2 h-4 w-4 animate-spin" />جارٍ إرسال الرسالة...</> : <>إرسال الرسالة <Send className="mr-2 h-4 w-4" /></>}</Button>
            </div>
          </>}
        </form>
      </div>
    </section>
  );
}
