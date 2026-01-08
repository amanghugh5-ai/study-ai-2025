import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, BrainCircuit, BookOpen, PenTool, Loader2, 
  Upload, Camera, FileText, X, Image as ImageIcon,
  Zap, ChevronRight, History, Settings2, Moon, Sun
} from "lucide-react";
import "@/styles/math.css";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGenerateContent, useHistory } from "@/hooks/use-ai";
import { SubjectSelector } from "@/components/SubjectSelector";
import { ResultCard } from "@/components/ResultCard";
import { HistoryItem } from "@/components/HistoryItem";

const commonSchema = z.object({
  subject: z.string().optional(),
  content: z.string().optional(),
  fileData: z.string().optional(),
  fileName: z.string().optional(),
  fileType: z.string().optional(),
  count: z.number().optional(),
  complexity: z.enum(['easy', 'medium', 'difficult']).optional(),
  language: z.enum(['english', 'urdu', 'both']).optional(),
});

export default function Home() {
  const { toast } = useToast();
  const generateMutation = useGenerateContent();
  const { data: history, isLoading: isLoadingHistory } = useHistory();
  
  const [activeTab, setActiveTab] = useState("solve");
  const [result, setResult] = useState<string>("");
  const [remainingRequests, setRemainingRequests] = useState<number | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [selectedFile, setSelectedFile] = useState<{name: string, data: string, type: string} | null>(null);

  useEffect(() => {
    setResult("");
    setSelectedFile(null);
    form.setValue("content", "");
  }, [activeTab]);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  const form = useForm<z.infer<typeof commonSchema>>({
    resolver: zodResolver(commonSchema)
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({ variant: "destructive", title: "File too large", description: "Maximum size is 10MB" });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedFile({
          name: file.name,
          data: reader.result as string,
          type: file.type
        });
        toast({ title: "File attached", description: `${file.name} ready for processing.` });
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    setIsCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      toast({ variant: "destructive", title: "Camera Error", description: "Could not access camera" });
      setIsCameraOpen(false);
    }
  };

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
      const data = canvas.toDataURL('image/jpeg', 0.8);
      setSelectedFile({ name: `capture-${new Date().getTime()}.jpg`, data, type: 'image/jpeg' });
      stopCamera();
    }
  };

  const stopCamera = () => {
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(track => track.stop());
    setIsCameraOpen(false);
  };

  const handleGenerate = async (type: 'solve' | 'summarize' | 'mcq') => {
    const values = form.getValues();
    if (!values.content && !selectedFile) {
      toast({ variant: "destructive", title: "Input Required", description: "Please enter text, upload a file, or take a photo." });
      return;
    }

    // Special handling for solve mode with only a file
    if (activeTab === 'solve' && !values.content && selectedFile) {
      toast({ title: "Solving from file", description: "Analyzing your image/document for questions..." });
    }

    setResult("");
    try {
      const response = await generateMutation.mutateAsync({
        type: activeTab as any,
        content: values.content,
        subject: values.subject,
        fileData: selectedFile?.data,
        fileName: selectedFile?.name,
        fileType: selectedFile?.type,
        count: values.count || 5,
        complexity: values.complexity || 'medium',
        language: values.language || 'english',
      });
      setResult(response.result);
      setRemainingRequests(response.remaining);
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Generation Failed", description: error.message });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full animate-float" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 blur-[120px] rounded-full animate-float" style={{ animationDelay: '-3s' }} />
      </div>

            <header className="sticky top-0 z-50 glass-panel border-b shadow-sm backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="p-2.5 bg-primary rounded-2xl shadow-xl shadow-primary/20 rotate-3 hover:rotate-0 transition-transform duration-500">
              <BrainCircuit className="w-7 h-7 text-white" />
            </div>
            <span className="font-display font-bold text-3xl tracking-tight hidden sm:block">
              Study<span className="text-primary">AI</span>
            </span>
          </motion.div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-8 mr-4">
              <a href="#" className="text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors">Features</a>
              <a href="#" className="text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors">Pricing</a>
              <a href="#" className="text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors">Community</a>
            </div>
            <Button variant="ghost" className="rounded-2xl font-bold h-12 px-6 hover:bg-primary/5" onClick={() => toast({ title: "Login Coming Soon", description: "Authentication is being integrated." })}>
              Log In
            </Button>
            <Button className="rounded-2xl font-bold h-12 px-8 bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all" onClick={() => toast({ title: "Premium Coming Soon", description: "Payments are currently being integrated." })}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-12 gap-16 items-start">
          
          <div className="lg:col-span-8 space-y-16">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-6 text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-[0.2em] mb-4">
                <Sparkles className="w-4 h-4" />
                Next Generation Learning
              </div>
              <h1 className="text-6xl lg:text-8xl font-black tracking-tight leading-[1] font-display">
                Master Any <span className="gradient-text">Subject</span> <br className="hidden md:block" /> Instantly.
              </h1>
              <p className="text-2xl text-muted-foreground max-w-2xl leading-relaxed font-medium">
                The most advanced AI study assistant. Snapshot questions, summarize complex notes, and generate quizzes with one tap.
              </p>
            </motion.div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 h-20 p-2 bg-secondary/30 rounded-[2rem] mb-16 border border-white/5 backdrop-blur-md shadow-2xl">
                {[
                  { id: 'solve', icon: BrainCircuit, label: 'Solver' },
                  { id: 'summarize', icon: BookOpen, label: 'Summarizer' },
                  { id: 'mcq', icon: PenTool, label: 'Quiz Gen' }
                ].map(tab => (
                  <TabsTrigger 
                    key={tab.id}
                    value={tab.id} 
                    className="rounded-[1.5rem] font-display font-bold text-lg data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-2xl transition-all duration-500 gap-3"
                  >
                    <tab.icon className="w-6 h-6" />
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="glass-card rounded-[3.5rem] p-10 md:p-16 border-white/10 shadow-[0_48px_96px_-24px_rgba(0,0,0,0.15)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full -mr-32 -mt-32 transition-colors group-hover:bg-primary/10" />
                <motion.div 
                  layout
                  className="space-y-12"
                >
                  <div className="flex flex-col md:flex-row gap-10 items-start">
                    <div className="w-full md:w-[45%] space-y-6">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Select Subject</label>
                        <Settings2 className="w-4 h-4 text-muted-foreground/30" />
                      </div>
                      <SubjectSelector 
                        value={form.watch("subject") || ""} 
                        onChange={(val: string) => form.setValue("subject", val)} 
                        className="w-full h-16 text-lg rounded-2xl bg-secondary/20 border-white/5 hover:bg-secondary/40 transition-all shadow-inner"
                      />
                    </div>

                    {activeTab === 'mcq' && (
                      <div className="w-full md:w-[30%] space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">MCQ Count</label>
                        </div>
                        <Select 
                          value={String(form.watch("count") || "5")} 
                          onValueChange={(val) => form.setValue("count", parseInt(val))}
                        >
                          <SelectTrigger className="w-full h-16 text-lg rounded-2xl bg-secondary/20 border-white/5 hover:bg-secondary/40 transition-all shadow-inner">
                            <SelectValue placeholder="Select count" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-white/10 shadow-2xl backdrop-blur-3xl">
                            <SelectItem value="5">5 Questions</SelectItem>
                            <SelectItem value="10">10 Questions</SelectItem>
                            <SelectItem value="15">15 Questions</SelectItem>
                            <SelectItem value="20">20 Questions</SelectItem>
                            <SelectItem value="50">50 Questions</SelectItem>
                            <SelectItem value="100">100 Questions</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {activeTab === 'summarize' && (
                      <div className="w-full md:w-[30%] space-y-6">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Complexity</label>
                        </div>
                        <Select 
                          value={form.watch("complexity") || "medium"} 
                          onValueChange={(val: any) => form.setValue("complexity", val)}
                        >
                          <SelectTrigger className="w-full h-16 text-lg rounded-2xl bg-secondary/20 border-white/5 hover:bg-secondary/40 transition-all shadow-inner">
                            <SelectValue placeholder="Select level" />
                          </SelectTrigger>
                          <SelectContent className="rounded-2xl border-white/10 shadow-2xl backdrop-blur-3xl">
                            <SelectItem value="easy">Easy</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="difficult">Difficult</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="w-full md:w-[30%] space-y-6">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Language</label>
                      </div>
                      <Select 
                        value={form.watch("language") || "english"} 
                        onValueChange={(val: any) => form.setValue("language", val)}
                      >
                        <SelectTrigger className="w-full h-16 text-lg rounded-2xl bg-secondary/20 border-white/5 hover:bg-secondary/40 transition-all shadow-inner">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-white/10 shadow-2xl backdrop-blur-3xl">
                          <SelectItem value="english">English</SelectItem>
                          <SelectItem value="urdu">Urdu</SelectItem>
                          <SelectItem value="both">English & Urdu</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex-1 w-full space-y-6">
                       <label className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Quick Actions</label>
                       <div className="grid grid-cols-2 gap-6">
                        <Button 
                          variant="outline" 
                          className="h-24 flex-col gap-3 rounded-[2rem] border-2 border-white/5 hover:border-primary/50 hover:bg-primary/5 transition-all group/btn shadow-xl" 
                          onClick={() => document.getElementById('file-upload')?.click()}
                        >
                          <div className="p-2.5 bg-primary/10 rounded-xl group-hover/btn:scale-110 transition-transform">
                            <Upload className="w-6 h-6 text-primary" />
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-[0.1em]">Upload Document</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          className="h-24 flex-col gap-3 rounded-[2rem] border-2 border-white/5 hover:border-accent/50 hover:bg-accent/5 transition-all group/btn shadow-xl" 
                          onClick={startCamera}
                        >
                          <div className="p-2.5 bg-accent/10 rounded-xl group-hover/btn:scale-110 transition-transform">
                            <Camera className="w-6 h-6 text-accent" />
                          </div>
                          <span className="text-[10px] font-bold uppercase tracking-[0.1em]">Smart Capture</span>
                        </Button>
                        <input id="file-upload" type="file" className="hidden" accept=".jpg,.jpeg,.png,.pdf,.docx,.txt" onChange={handleFileChange} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6 relative">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground/60">Input Content</label>
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-primary/60 bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
                        <Zap className="w-3 h-3 fill-primary" />
                        Smart OCR Engine Active
                      </div>
                    </div>
                    <div className="relative group/input">
                      <div className="absolute inset-0 bg-primary/5 blur-2xl rounded-3xl opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-700" />
                      <Textarea 
                        placeholder={activeTab === 'mcq' ? "Describe the topic you want to be quizzed on..." : "Type, paste, or use the camera to extract text..."} 
                        className="min-h-[320px] resize-none rounded-[2rem] p-10 text-xl bg-secondary/10 border-2 border-transparent focus:border-primary/20 transition-all focus:ring-0 placeholder:text-muted-foreground/20 shadow-inner relative z-10 font-medium"
                        {...form.register("content")}
                      />
                      <AnimatePresence>
                        {selectedFile && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.9, y: 10 }} 
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            className="absolute bottom-6 left-6 right-6 p-4 glass-panel border border-primary/20 rounded-2xl flex items-center justify-between shadow-2xl"
                          >
                            <div className="flex items-center gap-3 truncate">
                              <div className="p-2 bg-primary/20 rounded-lg">
                                {selectedFile.type.includes('image') ? <ImageIcon className="w-5 h-5 text-primary" /> : <FileText className="w-5 h-5 text-primary" />}
                              </div>
                              <div className="truncate">
                                <p className="text-sm font-bold truncate">{selectedFile.name}</p>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Attached & Ready</p>
                              </div>
                            </div>
                            <Button size="icon" variant="ghost" className="h-10 w-10 rounded-xl hover:bg-destructive/10 hover:text-destructive" onClick={() => setSelectedFile(null)}>
                              <X className="w-5 h-5" />
                            </Button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <Button 
                    size="lg" className="w-full h-20 rounded-[2rem] text-2xl font-display font-bold shadow-[0_32px_64px_-16px_rgba(var(--primary),0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all gap-4 bg-primary group/submit" 
                    disabled={generateMutation.isPending}
                    onClick={() => handleGenerate(activeTab as any)}
                  >
                    {generateMutation.isPending ? <Loader2 className="w-8 h-8 animate-spin" /> : <Sparkles className="w-8 h-8 group-hover/submit:rotate-12 transition-transform" />}
                    {generateMutation.isPending ? "Crafting Excellence..." : `Launch ${activeTab.toUpperCase()}`}
                    <ChevronRight className="w-6 h-6 ml-auto opacity-50 group-hover/submit:translate-x-1 transition-transform" />
                  </Button>
                </motion.div>
              </div>

              <div className="mt-16">
                <ResultCard content={result} isLoading={generateMutation.isPending} type={activeTab as any} />
              </div>
            </Tabs>
          </div>

          <div className="lg:col-span-4 space-y-8">
            <div className="sticky top-24 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-2xl flex items-center gap-3">
                  <History className="w-6 h-6 text-primary" />
                  Activity
                </h3>
                <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Recent</span>
              </div>
              
              <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar">
                {isLoadingHistory ? (
                  Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 rounded-[2rem] bg-secondary/30 animate-pulse" />)
                ) : history?.length === 0 ? (
                   <div className="text-center py-12 px-6 glass-card rounded-[2rem] border-dashed border-2">
                     <p className="text-muted-foreground font-medium">Your learning journey starts here. Try your first session!</p>
                   </div>
                ) : history?.map((item: any) => <HistoryItem key={item.id} item={item} />)}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modern Camera Modal */}
      <AnimatePresence>
        {isCameraOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-2xl flex flex-col items-center justify-center p-6 md:p-12"
          >
            <div className="max-w-4xl w-full glass-card rounded-[3rem] p-4 flex flex-col items-center shadow-3xl overflow-hidden relative">
              <div className="absolute top-8 left-8 z-10">
                 <div className="flex items-center gap-2 px-4 py-2 bg-black/40 rounded-full border border-white/10 text-white">
                   <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                   <span className="text-xs font-bold uppercase tracking-widest">Live Capture</span>
                 </div>
              </div>
              <video ref={videoRef} autoPlay playsInline className="w-full aspect-video md:aspect-[16/9] object-cover rounded-[2.5rem]" />
              <div className="flex gap-6 py-8">
                <Button size="lg" variant="ghost" className="h-16 px-8 rounded-2xl text-lg font-bold" onClick={stopCamera}>Dismiss</Button>
                <Button size="lg" className="h-16 px-12 rounded-2xl text-xl font-bold bg-white text-black hover:bg-white/90 shadow-2xl" onClick={captureImage}>
                   Take Photo
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
