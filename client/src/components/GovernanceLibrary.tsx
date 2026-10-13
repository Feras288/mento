import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { ChevronLeft, ChevronRight, Download, Eye, FileBarChart2, FileCheck2, FileText, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorker;

const NEW_DOCUMENT_WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

type PreviewDocument = { id: number; title: string; url: string };

function documentLabel(category: "governance" | "annual_report" | null) {
  return category === "annual_report" ? "تقرير سنوي" : "وثيقة حوكمة";
}

function isPdf(url: string | null) {
  return Boolean(url && /\.pdf(?:$|[?#])/i.test(url));
}

function isNewDocument(publishedAt: Date) {
  return Date.now() - new Date(publishedAt).getTime() <= NEW_DOCUMENT_WINDOW_MS;
}

function PdfReader({ preview, onDownload, isDownloading }: { preview: PreviewDocument; onDownload: () => void; isDownloading: boolean }) {
  const readerRef = useRef<HTMLDivElement>(null);
  const [pageCount, setPageCount] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [readerSize, setReaderSize] = useState({ width: 0, height: 0 });
  const [pageAspectRatio, setPageAspectRatio] = useState(Math.SQRT2);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    const element = readerRef.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => setReaderSize({ width: entry.contentRect.width, height: entry.contentRect.height }));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const availableWidth = Math.max(readerSize.width - 28, 220);
  const availableHeight = Math.max(readerSize.height - 28, 280);
  const pageWidth = Math.floor(Math.min(availableWidth, availableHeight / pageAspectRatio));
  const previewUrl = `/api/documents/${preview.id}/preview`;
  const changePage = (direction: number) => setPageNumber(current => Math.min(Math.max(current + direction, 1), pageCount || 1));

  return <div className="mt-2 space-y-4">
    <div className="grid gap-3 rounded-2xl border border-[#d9c995] bg-white px-3 py-3 sm:grid-cols-[1fr_auto] sm:items-center">
      <div className="flex items-center justify-center gap-3 sm:justify-start">
        <button type="button" onClick={() => changePage(-1)} disabled={pageNumber <= 1} className="grid h-9 w-9 place-items-center rounded-full border border-[#cdbb86] text-[#155029] transition-colors hover:bg-[#f8edd0] disabled:cursor-not-allowed disabled:opacity-40" aria-label="الصفحة السابقة"><ChevronRight className="h-4 w-4" /></button>
        <span className="min-w-24 text-center text-xs font-extrabold text-[#155029]">صفحة {pageNumber} من {pageCount || "—"}</span>
        <button type="button" onClick={() => changePage(1)} disabled={!pageCount || pageNumber >= pageCount} className="grid h-9 w-9 place-items-center rounded-full border border-[#cdbb86] text-[#155029] transition-colors hover:bg-[#f8edd0] disabled:cursor-not-allowed disabled:opacity-40" aria-label="الصفحة التالية"><ChevronLeft className="h-4 w-4" /></button>
      </div>
      <button type="button" onClick={onDownload} disabled={isDownloading} className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#155029] px-5 text-sm font-bold text-white transition-colors hover:bg-[#10461f] disabled:cursor-wait disabled:opacity-70">تحميل الوثيقة <Download className="h-4 w-4" /></button>
    </div>
    <div ref={readerRef} className="flex h-[58dvh] min-h-80 max-h-[42rem] items-center justify-center overflow-hidden rounded-2xl border border-[#d9c995] bg-[#e8f0df] p-3 sm:h-[62dvh] sm:min-h-[28rem] sm:p-4">
      <Document file={previewUrl} onLoadSuccess={({ numPages }) => { setPageCount(numPages); setPageNumber(1); setLoadError(false); }} onLoadError={error => { console.error("[PDF Preview] تعذر تحميل الوثيقة", { documentId: preview.id, error }); setLoadError(true); }} onSourceError={error => { console.error("[PDF Preview] تعذر الوصول إلى مصدر الوثيقة", { documentId: preview.id, error }); setLoadError(true); }} loading={<div className="grid min-h-72 place-items-center"><Loader2 className="h-7 w-7 animate-spin text-[#a67017]" /></div>} error={null}>
        {!loadError && readerSize.width > 0 && <Page pageNumber={pageNumber} width={pageWidth} onLoadSuccess={page => { const [left, bottom, right, top] = page.view; const width = right - left; const height = top - bottom; if (width > 0 && height > 0) setPageAspectRatio(height / width); }} renderTextLayer renderAnnotationLayer className="max-h-full max-w-full overflow-hidden rounded-lg shadow-[0_10px_24px_rgba(22,91,42,0.14)]" />}
      </Document>
      {loadError && <div className="grid min-h-72 place-items-center px-6 text-center"><FileText className="h-8 w-8 text-[#a67017]" /><p className="mt-3 text-sm font-bold text-[#155029]">تعذرت معاينة الوثيقة داخل الصفحة.</p><p className="mt-2 text-xs leading-6 text-[#617b68]">يمكنك تنزيل الملف وفتحه باستخدام قارئ PDF على جهازك.</p></div>}
    </div>
  </div>;
}

export default function GovernanceLibrary() {
  const [category, setCategory] = useState<"all" | "governance" | "annual_report">("all");
  const [year, setYear] = useState("all");
  const [preview, setPreview] = useState<PreviewDocument | null>(null);
  const utils = trpc.useUtils();
  const documents = trpc.content.publicList.useQuery();
  const items = (documents.data ?? []).filter(item => item.type === "document");
  const years = useMemo(() => Array.from(new Set(items.map(item => item.documentYear).filter((item): item is number => typeof item === "number"))).sort((a, b) => b - a), [items]);
  const filteredItems = items.filter(item => (category === "all" || item.documentCategory === category) && (year === "all" || item.documentYear === Number(year)));
  const recordDownload = trpc.content.recordDocumentDownload.useMutation({ onSuccess: () => utils.content.publicList.invalidate() });
  const downloadDocument = (id: number, url: string) => { recordDownload.mutate({ id }); window.open(url, "_blank", "noopener,noreferrer"); };

  const documentCard = (item: typeof items[number]) => {
    const Icon = item.documentCategory === "annual_report" ? FileBarChart2 : FileCheck2;
    const canPreview = isPdf(item.imageUrl);
    return <article key={item.id} className="group relative overflow-hidden rounded-bl-[3rem] rounded-tr-[3rem] border border-[#d9c995] bg-white p-5 shadow-[0_14px_32px_rgba(22,91,42,0.07)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_22px_40px_rgba(22,91,42,0.13)] sm:p-6"><div className="absolute left-0 top-0 h-20 w-20 rounded-br-[3.5rem] bg-[#e8f0df]" aria-hidden="true" /><span className="relative grid h-12 w-12 place-items-center rounded-2xl bg-[#155029] text-[#f2cd78]"><Icon className="h-5 w-5" /></span>{isNewDocument(item.publishedAt) && <span className="absolute left-5 top-5 inline-flex items-center gap-1 rounded-full bg-[#f2cd78] px-3 py-1 text-xs font-extrabold text-[#155029]"><Sparkles className="h-3.5 w-3.5" />جديد</span>}<div className="mt-7 flex flex-wrap items-center gap-2"><span className="rounded-full bg-[#f8edd0] px-3 py-1 text-xs font-bold text-[#8d6118]">{documentLabel(item.documentCategory)}</span>{item.documentYear && <span className="rounded-full bg-[#e8f0df] px-3 py-1 text-xs font-bold text-[#155029]">إصدار {item.documentYear}</span>}</div><h3 className="display-font mt-3 text-xl font-bold leading-8 text-[#155029]">{item.title}</h3><p className="mt-3 line-clamp-3 text-sm leading-7 text-[#607a68]">{item.summary}</p><div className="mt-6 flex flex-wrap items-center justify-between gap-3"><span className="inline-flex items-center gap-2 text-xs font-bold text-[#66816d]"><Download className="h-4 w-4 text-[#a67017]" />{item.downloadCount.toLocaleString("ar-SA")} تحميل</span>{item.imageUrl ? <div className="flex w-full items-center gap-2 sm:w-auto">{canPreview && <button type="button" onClick={() => setPreview({ id: item.id, title: item.title, url: item.imageUrl! })} className="grid h-11 w-11 place-items-center rounded-full border border-[#cdbb86] text-[#155029] transition-colors hover:bg-[#f8edd0]" aria-label={`معاينة ${item.title}`}><Eye className="h-4 w-4" /></button>}<button type="button" onClick={() => downloadDocument(item.id, item.imageUrl!)} disabled={recordDownload.isPending} className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-[#155029] px-4 text-sm font-bold text-white transition-colors hover:bg-[#10461f] disabled:cursor-wait disabled:opacity-70 sm:flex-none">تحميل <Download className="h-4 w-4" /></button></div> : <span className="inline-flex items-center gap-2 text-sm font-bold text-[#78907d]"><FileText className="h-4 w-4" />ملف قيد الإتاحة</span>}</div></article>;
  };

  return <section id="الوثائق" className="route-map relative isolate overflow-hidden bg-[#f3f1e4] py-16 sm:py-20 lg:py-28"><div className="container relative z-10"><div className="flex flex-col justify-between gap-6 border-b border-[#d9c995] pb-8 md:flex-row md:items-end"><div><p className="section-label">مكتبة الثقة</p><h2 className="display-font mt-4 text-3xl font-extrabold leading-[1.5] text-[#155029] sm:text-4xl">وثائق حوكمة تُقرأ بوضوح.</h2><p className="mt-4 max-w-2xl text-base leading-8 text-[#5b7562]">تصفّح وثائق الحوكمة والتقارير السنوية المعتمدة وفق النوع وسنة الإصدار، ثم عاين أو نزّل ما تحتاجه مباشرةً.</p></div><div className="grid w-full gap-3 sm:w-auto sm:grid-cols-2"><label className="grid gap-1.5 text-xs font-bold text-[#456651]">نوع الوثيقة<select value={category} onChange={event => setCategory(event.target.value as typeof category)} className="h-11 w-full min-w-0 rounded-full border border-[#cdbb86] bg-white px-4 text-base text-[#155029] outline-none focus:border-[#155029] sm:min-w-48 sm:text-sm"><option value="all">جميع الوثائق</option><option value="governance">وثائق الحوكمة</option><option value="annual_report">التقارير السنوية</option></select></label><label className="grid gap-1.5 text-xs font-bold text-[#456651]">سنة الإصدار<select value={year} onChange={event => setYear(event.target.value)} className="h-11 w-full rounded-full border border-[#cdbb86] bg-white px-4 text-base text-[#155029] outline-none focus:border-[#155029] sm:text-sm"><option value="all">كل السنوات</option>{years.map(value => <option key={value} value={value}>{value}</option>)}</select></label></div></div><p className="mt-8 text-sm font-bold text-[#a67017]">{filteredItems.length} {filteredItems.length === 1 ? "وثيقة مطابقة" : "وثائق مطابقة"}</p><div className="mt-7 grid gap-5 lg:grid-cols-2">{documents.isLoading ? <div className="col-span-full grid min-h-48 place-items-center"><Loader2 className="h-6 w-6 animate-spin text-[#a67017]" /></div> : filteredItems.length ? filteredItems.map(item => documentCard(item)) : <div className="col-span-full rounded-bl-[3rem] rounded-tr-[3rem] border border-dashed border-[#c9b978] bg-white/60 px-6 py-12 text-center"><ShieldCheck className="mx-auto h-8 w-8 text-[#a67017]" /><h3 className="display-font mt-4 text-xl font-bold text-[#155029]">لا توجد وثائق مطابقة</h3><p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-[#617b68]">جرّب تغيير نوع الوثيقة أو سنة الإصدار، أو عد لاحقًا للاطلاع على الوثائق المعتمدة الجديدة.</p></div>}</div></div><Dialog open={Boolean(preview)} onOpenChange={open => { if (!open) setPreview(null); }}><DialogContent className="max-h-[calc(100dvh-1rem)] w-[calc(100%-1rem)] overflow-y-auto rounded-[1.5rem] border-[#d9c995] bg-[#fbf8ed] p-3 sm:w-[min(94vw,72rem)] sm:max-w-[min(94vw,72rem)] sm:rounded-lg sm:p-6" dir="rtl"><DialogHeader className="text-right"><DialogTitle className="display-font pl-8 text-xl font-extrabold text-[#155029]">معاينة الوثيقة</DialogTitle><DialogDescription className="text-[#607a68]">{preview?.title}</DialogDescription></DialogHeader>{preview && <PdfReader preview={preview} onDownload={() => downloadDocument(preview.id, preview.url)} isDownloading={recordDownload.isPending} />}</DialogContent></Dialog></section>;
}
