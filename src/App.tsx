import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, Copy, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf' || selectedFile.type.startsWith('image/')) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('請上傳 PDF 檔案或圖片。');
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setAnalysis(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '分析失敗');
      }

      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Helper to parse sections from markdown
  const parseSections = (text: string) => {
    const sections: Record<string, string> = {};
    
    const issueMatch = text.match(/### 1\. 核心爭點.*?\n([\s\S]*?)(?=\n###|$)/);
    const answerMatch = text.match(/### 2\. 國考標準擬答.*?\n([\s\S]*?)(?=\n###|$)/);
    const ankiMatch = text.match(/### 3\. 記憶提取卡片.*?\n([\s\S]*?)(?=\n###|$)/);
    const tldrMatch = text.match(/### 4\. 考前衝刺 30 字口訣.*?\n([\s\S]*?)(?=\n###|$)/);

    sections.issue = issueMatch ? issueMatch[1].trim() : '';
    sections.answer = answerMatch ? answerMatch[1].trim() : '';
    sections.anki = ankiMatch ? ankiMatch[1].trim() : '';
    sections.tldr = tldrMatch ? tldrMatch[1].trim() : '';

    return sections;
  };

  const sections = analysis ? parseSections(analysis) : null;

  return (
    <div className="h-screen w-full bg-editorial-bg flex flex-col font-serif text-editorial-text overflow-hidden select-none">
      {/* Top Navigation Bar */}
      <header className="h-16 border-b border-editorial-border flex items-center justify-between px-8 bg-white/50 backdrop-blur-sm z-20 flex-shrink-0">
        <div className="flex items-center gap-4">
          <span className="text-[10px] tracking-[0.2em] font-sans font-bold uppercase opacity-60">Legal Analyst v2.1</span>
          <div className="h-4 w-[1px] bg-editorial-border"></div>
          <span className="text-lg italic font-serif font-medium">國考爭點擬答與知識管理</span>
        </div>
        <div className="flex items-center gap-6 font-sans text-[11px] font-semibold tracking-widest uppercase">
          {(file || analysis) && !loading && (
            <button 
              onClick={() => { setFile(null); setAnalysis(null); setError(null); }}
              className="cursor-pointer text-editorial-accent font-black hover:underline"
            >
              {analysis ? "分析下一個" : "移除檔案"}
            </button>
          )}
          <button 
            onClick={() => analysis && copyToClipboard(analysis)}
            className="px-3 py-1 bg-editorial-text text-editorial-bg hover:opacity-90 transition-opacity disabled:opacity-30"
            disabled={!analysis}
          >
            複製內容
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {!analysis && !loading ? (
            <motion.main 
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center p-12 bg-white"
            >
              <div className="max-w-md w-full space-y-8 text-center">
                <div className="space-y-2">
                  <h2 className="text-xs font-sans font-bold tracking-[0.3em] uppercase opacity-40">Ready to Analyze</h2>
                  <h1 className="text-4xl font-bold tracking-tight">上傳國考講義檔案</h1>
                </div>

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "border-2 border-dashed rounded-lg p-16 text-center cursor-pointer transition-all bg-editorial-bg/30",
                    file ? "border-editorial-accent bg-editorial-accent/5" : "border-editorial-border hover:border-editorial-accent/50"
                  )}
                >
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,image/*" />
                  <div className="flex flex-col items-center gap-4">
                    <div className={cn(
                      "p-4 rounded-full",
                      file ? "text-editorial-accent bg-white" : "text-editorial-border bg-white"
                    )}>
                      {file ? <FileText className="w-8 h-8" /> : <Upload className="w-8 h-8" />}
                    </div>
                    {file ? (
                      <div className="space-y-1">
                        <p className="font-bold text-lg">{file.name}</p>
                        <p className="text-xs font-sans uppercase opacity-50">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <p className="font-bold text-lg italic">拖放檔案或點擊上傳</p>
                        <p className="text-xs font-sans uppercase opacity-50 tracking-widest">Support PDF & Images</p>
                      </div>
                    )}
                  </div>
                </div>

                {error && (
                  <div className="text-editorial-accent text-xs font-sans font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                {file && (
                  <button
                    onClick={handleUpload}
                    className="w-full bg-editorial-text text-editorial-bg py-4 rounded font-sans font-black uppercase tracking-widest hover:opacity-90 transition-all active:scale-[0.98]"
                  >
                    智慧剖析爭點
                  </button>
                )}
              </div>
            </motion.main>
          ) : loading ? (
            <motion.main
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center bg-white space-y-6"
            >
              <Loader2 className="w-12 h-12 text-editorial-accent animate-spin" />
              <div className="text-center space-y-2">
                <h3 className="text-xs font-sans font-black uppercase tracking-[0.3em] opacity-40">Processing</h3>
                <p className="text-2xl font-bold italic">正在為您整理申論重點...</p>
              </div>
            </motion.main>
          ) : (
            <>
              {/* Sidebar Panel: Issue & Meta */}
              <motion.aside 
                initial={{ x: -320 }}
                animate={{ x: 0 }}
                className="w-80 border-r border-editorial-border p-8 flex flex-col gap-8 bg-editorial-sidebar overflow-y-auto"
              >
                <section>
                  <h3 className="text-[10px] font-sans font-black uppercase tracking-tighter mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-editorial-accent rounded-full"></span> 01. 核心爭點 (Issue)
                  </h3>
                  <div className="text-sm leading-relaxed text-justify opacity-80 prose prose-sm prose-serif">
                    <ReactMarkdown>{sections?.issue || ''}</ReactMarkdown>
                  </div>
                </section>

                <section className="flex-1">
                  <h3 className="text-[10px] font-sans font-black uppercase tracking-tighter mb-4">03. 記憶提取卡片 (Anki)</h3>
                  <div className="space-y-4">
                    <div className="prose prose-sm prose-serif max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{sections?.anki || ''}</ReactMarkdown>
                    </div>
                  </div>
                </section>

                <section className="mt-auto">
                  <div className="p-5 bg-editorial-text text-editorial-bg transform -rotate-1 shadow-xl">
                    <h3 className="text-[10px] font-sans font-black uppercase tracking-widest mb-2 opacity-50">04. 考前口訣 (TLDR)</h3>
                    <div className="text-sm font-medium leading-relaxed prose prose-invert prose-sm">
                      <ReactMarkdown>{sections?.tldr || ''}</ReactMarkdown>
                    </div>
                  </div>
                </section>
              </motion.aside>

              {/* Main content: Model Answer */}
              <motion.main 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex-1 p-12 overflow-y-auto bg-white flex justify-center"
              >
                <div className="max-w-2xl w-full flex flex-col">
                  <div className="border-b-2 border-editorial-text pb-4 mb-8">
                    <h2 className="text-xs font-sans font-bold tracking-[0.3em] uppercase opacity-40 mb-1">Model Answer Sheet</h2>
                    <h1 className="text-3xl font-bold tracking-tight">國考標準擬答分析</h1>
                  </div>

                  <div className="prose prose-serif max-w-none 
                    prose-headings:text-xl prose-headings:font-bold prose-headings:mb-4 prose-headings:mt-8
                    prose-headings:border-l-4 prose-headings:border-editorial-accent prose-headings:pl-4
                    prose-p:text-sm prose-p:leading-[1.8] prose-p:text-gray-700
                    prose-table:text-xs prose-table:border-collapse prose-table:font-sans
                    prose-th:bg-gray-100 prose-th:border prose-th:border-gray-300 prose-th:p-2 prose-th:text-left prose-th:uppercase prose-th:tracking-widest prose-th:font-black
                    prose-td:border prose-td:border-gray-300 prose-td:p-2
                    prose-strong:text-editorial-accent prose-strong:font-bold
                    prose-em:italic prose-em:text-gray-600 prose-em:bg-gray-50 prose-em:px-1
                  ">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {sections?.answer || ''}
                    </ReactMarkdown>
                  </div>

                  <footer className="mt-12 pt-4 border-t border-editorial-border flex justify-between items-center opacity-30 pb-8">
                    <span className="text-[9px] font-sans tracking-widest uppercase">Legal Draft: Exam Series (Alpha)</span>
                    <span className="text-[9px] font-sans tracking-widest uppercase">Analysis Complete</span>
                  </footer>
                </div>
              </motion.main>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
