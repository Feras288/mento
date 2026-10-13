import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CircleHelp } from "lucide-react";

const questions = [
  { question: "كيف أتواصل مع الجمعية؟", answer: "يمكنك مراسلتنا عبر نموذج التواصل في هذه الصفحة أو مباشرةً على البريد info@acsd.sa، كما تتوفر قنوات الاتصال الهاتفية والحسابات الرسمية أعلاه." },
  { question: "هل يمكنني إرفاق ملفات مع رسالتي؟", answer: "نعم. يدعم النموذج ملفات PDF وJPG وPNG وWord وExcel، حتى ثلاثة ملفات، وبحجم لا يتجاوز 5 ميغابايت للملف الواحد." },
  { question: "كيف أتابع رسالتي بعد الإرسال؟", answer: "تُحفظ رسالتك ومرفقاتها لدى فريق الجمعية، وتصل إلى البريد المعتمد. يتابع الفريق الطلب ويرسل الرد إلى بريدك الإلكتروني عند اكتمال المراجعة." },
  { question: "كيف أسجل في فعالية قادمة؟", answer: "انتقل إلى قسم الفعاليات القادمة في الصفحة الرئيسية، ثم اختر الفعالية وسجّل اسمك وبريدك الإلكتروني. تصل رسالة تأكيد تلقائية بعد نجاح التسجيل." },
  { question: "كيف تُستخدم بياناتي؟", answer: "تُستخدم بيانات التواصل فقط لمتابعة استفسارك أو تسجيلك، وتُحفظ ضمن نطاق إدارة الجمعية للوصول المنظم والرد على طلبك." },
];

export default function FAQSection() {
  return <section id="الأسئلة-الشائعة" className="bg-[#f3f1e4] py-20 lg:py-24"><div className="container grid gap-10 lg:grid-cols-[0.74fr_1.26fr] lg:items-start"><div><span className="grid h-12 w-12 place-items-center rounded-full bg-[#155029] text-[#f2cd78]"><CircleHelp className="h-5 w-5" /></span><p className="section-label mt-6">قبل أن تراسلنا</p><h2 className="display-font mt-4 text-3xl font-extrabold leading-[1.5] text-[#155029] sm:text-4xl">أسئلة توضّح الخطوة التالية.</h2><p className="mt-5 max-w-md text-base leading-8 text-[#587260]">جمعنا الإجابات العملية التي تساعدك على الوصول السريع إلى القناة المناسبة أو الاستفادة من خدمات الموقع.</p></div><Accordion type="single" collapsible className="rounded-bl-[2.5rem] rounded-tr-[2.5rem] border border-[#d9c995] bg-white px-5 shadow-[0_14px_32px_rgba(22,91,42,0.06)] sm:px-7">{questions.map((item, index) => <AccordionItem key={item.question} value={`faq-${index}`} className="border-[#e7debf]"><AccordionTrigger className="py-5 text-right text-base font-bold leading-7 text-[#155029] hover:no-underline"><span className="flex items-center gap-3"><span className="text-xs font-extrabold text-[#b37819]">0{index + 1}</span>{item.question}</span></AccordionTrigger><AccordionContent className="max-w-2xl pb-5 text-sm leading-8 text-[#5e7765]">{item.answer}</AccordionContent></AccordionItem>)}</Accordion></div></section>;
}
