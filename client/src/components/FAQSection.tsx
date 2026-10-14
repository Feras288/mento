import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CircleHelp } from "lucide-react";

const questions = [
  {
    question: "كيف أتواصل مع الجمعية التعاونية الزراعية؟",
    answer: "يمكنك مراسلتنا مباشرة عبر البريد الإلكتروني الرسمي info@acsd.sa، أو هاتفياً عبر الرقم 0533198555، كما يمكنك تعبئة نموذج المراسلة المباشر في أسفل الصفحة.",
  },
  {
    question: "أين يقع مقر الجمعية وما هي أوقات العمل الرسمية؟",
    answer: "يقع مقر الجمعية في محافظة الدرب، بمنطقة جازان، المملكة العربية السعودية. نستقبل الزوار والمزارعين من الأحد إلى الخميس من الساعة 8:00 صباحاً حتى 3:00 مساءً.",
  },
  {
    question: "كيف يمكنني المساهمة أو المشاركة في مشاريع الجمعية؟",
    answer: "تتاح المساهمة بالإيداع المباشر لحساب الجمعية الرسمي في بنك البلاد على الآيبان SA6405000068202441979000، ثم إشعار الإدارة عبر إرفاق إيصال الإيداع أو التواصل المباشر لاعتماد المساهمة وتسجيلها بالسجل التعاوني.",
  },
  {
    question: "هل يمكنني إرفاق ملفات أو دراسات جدوى مع رسالتي؟",
    answer: "نعم، يدعم نموذج المراسلة إرفاق ملفات PDF وصور JPG/PNG ومستندات Word وExcel حتى 3 ملفات، وبحد أقصى 5 ميغابايت لكل ملف، ليتم فحصها من قِبل الفريق المختص.",
  },
  {
    question: "كيف أتابع طلبي أو استفساري بعد الإرسال؟",
    answer: "تُحفظ رسالتك ومرفقاتها فورياً في سجل المتابعة لدى الجمعية، ويصل إشعار لفريق التنسيق المختص للرد والتواصل معكم عبر البريد الإلكتروني أو الهاتف المسجل.",
  },
];

export default function FAQSection() {
  return (
    <section id="الأسئلة-الشائعة" className="bg-[#f3f1e4] py-20 lg:py-24">
      <div className="container grid gap-10 lg:grid-cols-[0.74fr_1.26fr] lg:items-start">
        <div>
          <span className="grid h-12 w-12 place-items-center rounded-full bg-[#155029] text-[#f2cd78]">
            <CircleHelp className="h-5 w-5" />
          </span>
          <p className="section-label mt-6">إرشادات واستفسارات</p>
          <h2 className="display-font mt-4 text-3xl font-extrabold leading-[1.5] text-[#155029] sm:text-4xl">
            الأسئلة الشائعة حول الجمعية والتواصل
          </h2>
          <p className="mt-5 max-w-md text-base leading-8 text-[#587260]">
            إجابات واضحة ومباشرة تساعد المزارعين والمساهمين والشركاء على الوصول السريع إلى الخدمة المطلوبة.
          </p>
        </div>

        <Accordion
          type="single"
          collapsible
          className="rounded-bl-[2.5rem] rounded-tr-[2.5rem] border border-[#d9c995] bg-white px-5 shadow-[0_14px_32px_rgba(22,91,42,0.06)] sm:px-7"
        >
          {questions.map((item, index) => (
            <AccordionItem key={item.question} value={`faq-${index}`} className="border-[#e7debf]">
              <AccordionTrigger className="py-5 text-right text-base font-bold leading-7 text-[#155029] hover:no-underline">
                <span className="flex items-center gap-3">
                  <span className="text-xs font-extrabold text-[#b37819]">0{index + 1}</span>
                  {item.question}
                </span>
              </AccordionTrigger>
              <AccordionContent className="max-w-2xl pb-5 text-sm leading-8 text-[#5e7765]">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
