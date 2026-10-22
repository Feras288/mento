export interface FallbackSurveyQuestion {
  id: number;
  surveyId: number;
  prompt: string;
  helpText: string | null;
  type: "rating" | "single_choice" | "text";
  optionsJson: string;
  isRequired: boolean | string;
  orderIndex?: number;
  position?: number;
  [key: string]: any;
}

export interface FallbackSurvey {
  id: number;
  title: string;
  description: string | null;
  status: "draft" | "published";
  createdAt: string;
  updatedAt: string;
}

export const FALLBACK_SURVEY: FallbackSurvey = {
  "id": 1,
  "title": "استبيان قياس رضا المستفيدين وأصحاب العلاقة",
  "description": "تحرص الجمعية التعاونية الزراعية للتطوير والاستدامة على تطوير خدماتها وتحسين تجربة المستفيدين وأعضاء الجمعية والشركاء. نأمل تخصيص دقيقة واحدة للإجابة على هذا الاستبيان، وتُستخدم النتائج لأغراض التحسين والتطوير المؤسسي.",
  "status": "published",
  "createdAt": "2026-10-12T19:38:11.727Z",
  "updatedAt": "2026-10-20T00:37:18.287Z"
};
export const FALLBACK_QUESTIONS: FallbackSurveyQuestion[] = [
  {
    "id": 1,
    "surveyId": 1,
    "prompt": "صفتك بالنسبة للجمعية:",
    "helpText": "أولاً: بيانات عامة",
    "type": "single_choice",
    "optionsJson": "[\"عضو / مساهم\",\"مستفيد\",\"عميل\",\"شريك أو جهة متعاونة\",\"زائر\",\"مورد / مقدم خدمة\",\"أخرى (يرجى التحديد)\"]",
    "isRequired": "yes",
    "position": 0
  },
  {
    "id": 2,
    "surveyId": 1,
    "prompt": "ما الغرض الرئيسي من تواصلك مع الجمعية؟",
    "helpText": "أولاً: بيانات عامة",
    "type": "single_choice",
    "optionsJson": "[\"الحصول على خدمة\",\"استفسار\",\"عضوية / مساهمة\",\"شراكة أو تعاون\",\"مشروع / استثمار\",\"شكوى أو مقترح\",\"أخرى\"]",
    "isRequired": "yes",
    "position": 1
  },
  {
    "id": 3,
    "surveyId": 1,
    "prompt": "سهولة التواصل مع الجمعية والوصول إلى الجهة المختصة.",
    "helpText": "ثانياً: قياس مستوى الرضا",
    "type": "rating",
    "optionsJson": "[]",
    "isRequired": "yes",
    "position": 2
  },
  {
    "id": 4,
    "surveyId": 1,
    "prompt": "سرعة الاستجابة للاستفسارات والطلبات.",
    "helpText": "ثانياً: قياس مستوى الرضا",
    "type": "rating",
    "optionsJson": "[]",
    "isRequired": "yes",
    "position": 3
  },
  {
    "id": 5,
    "surveyId": 1,
    "prompt": "وضوح المعلومات والإجراءات المطلوبة للحصول على الخدمة.",
    "helpText": "ثانياً: قياس مستوى الرضا",
    "type": "rating",
    "optionsJson": "[]",
    "isRequired": "yes",
    "position": 4
  },
  {
    "id": 6,
    "surveyId": 1,
    "prompt": "جودة الخدمة أو التعامل المقدم من الجمعية.",
    "helpText": "ثانياً: قياس مستوى الرضا",
    "type": "rating",
    "optionsJson": "[]",
    "isRequired": "yes",
    "position": 5
  },
  {
    "id": 7,
    "surveyId": 1,
    "prompt": "مستوى الشفافية والوضوح في التعامل.",
    "helpText": "ثانياً: قياس مستوى الرضا",
    "type": "rating",
    "optionsJson": "[]",
    "isRequired": "yes",
    "position": 6
  },
  {
    "id": 8,
    "surveyId": 1,
    "prompt": "مدى اهتمام الجمعية بالمقترحات والشكاوى وملاحظات أصحاب العلاقة.",
    "helpText": "ثانياً: قياس مستوى الرضا",
    "type": "rating",
    "optionsJson": "[]",
    "isRequired": "yes",
    "position": 7
  },
  {
    "id": 9,
    "surveyId": 1,
    "prompt": "سهولة الوصول إلى المعلومات من خلال الموقع الإلكتروني والقنوات الرقمية.",
    "helpText": "ثانياً: قياس مستوى الرضا",
    "type": "rating",
    "optionsJson": "[]",
    "isRequired": "yes",
    "position": 8
  },
  {
    "id": 10,
    "surveyId": 1,
    "prompt": "تقييمك العام لتجربتك مع الجمعية.",
    "helpText": "ثانياً: قياس مستوى الرضا",
    "type": "rating",
    "optionsJson": "[]",
    "isRequired": "yes",
    "position": 9
  },
  {
    "id": 11,
    "surveyId": 1,
    "prompt": "ما مدى احتمال أن توصي بالتعامل أو التعاون مع الجمعية؟",
    "helpText": "ثالثاً: التوصية والتطوير",
    "type": "single_choice",
    "optionsJson": "[\"بالتأكيد\",\"غالباً\",\"ربما\",\"غير مرجح\",\"لا أوصي\"]",
    "isRequired": "yes",
    "position": 10
  },
  {
    "id": 12,
    "surveyId": 1,
    "prompt": "ما الجانب الذي ترى أنه يحتاج إلى تحسين؟",
    "helpText": "اكتب رأيك هنا ...",
    "type": "text",
    "optionsJson": "[]",
    "isRequired": "no",
    "position": 11
  },
  {
    "id": 13,
    "surveyId": 1,
    "prompt": "هل لديك مقترح أو ملاحظة إضافية؟",
    "helpText": "اكتب مقترحك أو ملاحظتك هنا ...",
    "type": "text",
    "optionsJson": "[]",
    "isRequired": "no",
    "position": 12
  },
  {
    "id": 14,
    "surveyId": 1,
    "prompt": "هل ترغب في أن تتواصل معك الجمعية بخصوص ملاحظتك؟",
    "helpText": "رابعاً: التواصل الاختياري",
    "type": "single_choice",
    "optionsJson": "[\"نعم\",\"لا\"]",
    "isRequired": "yes",
    "position": 13
  },
  {
    "id": 15,
    "surveyId": 1,
    "prompt": "بيانات التواصل (في حال اختيار نعم):",
    "helpText": "الاسم، رقم الجوال، البريد الإلكتروني (اختياري)",
    "type": "text",
    "optionsJson": "[]",
    "isRequired": "no",
    "position": 14
  }
];
