import { formatDistanceToNow } from "date-fns";
import { FileText, HelpCircle, ListCheck, Trash2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { type HistoryItem as HistoryItemType, useDeleteHistory } from "@/hooks/use-ai";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ReactMarkdown from "react-markdown";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface HistoryItemProps {
  item: HistoryItemType;
}

const icons = {
  solve: HelpCircle,
  summarize: FileText,
  mcq: ListCheck,
};

const labels = {
  solve: "Solution",
  summarize: "Summary",
  mcq: "Quiz",
};

const colors = {
  solve: "text-blue-500 bg-blue-500/10",
  summarize: "text-purple-500 bg-purple-500/10",
  mcq: "text-emerald-500 bg-emerald-500/10",
};

export function HistoryItem({ item }: HistoryItemProps) {
  const Icon = icons[item.type as keyof typeof icons] || FileText;
  const label = labels[item.type as keyof typeof labels] || "Result";
  const colorClass = colors[item.type as keyof typeof colors] || "text-gray-500 bg-gray-500/10";
  const deleteMutation = useDeleteHistory();
  const { toast } = useToast();

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteMutation.mutateAsync(item.id);
      toast({ title: "Activity removed", description: "The item has been deleted from your history." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Delete failed", description: error.message });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <motion.div 
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="group relative flex items-start gap-4 p-4 rounded-xl border bg-card/50 hover:bg-card hover:shadow-xl hover:border-primary/20 transition-all cursor-pointer"
        >
          <div className={`p-2.5 rounded-lg shrink-0 ${colorClass}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-foreground/80 group-hover:text-primary transition-colors">
                {label}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {item.createdAt && formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                </span>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                  disabled={deleteMutation.isPending}
                  onClick={handleDelete}
                >
                  {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {item.content}
            </p>
            {item.subject && (
              <Badge variant="secondary" className="mt-2 text-[10px] h-5 px-2 font-medium">
                {item.subject}
              </Badge>
            )}
          </div>
        </motion.div>
      </DialogTrigger>
      
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 pb-2 border-b bg-muted/20">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${colorClass}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl">{label}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {item.subject && <span className="capitalize text-primary font-medium">{item.subject} • </span>}
                {item.createdAt && formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="mb-8">
            <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Input</h4>
            <div className="bg-muted/30 p-4 rounded-lg border text-sm leading-relaxed">
              {item.content}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">AI Response</h4>
            <div className="prose-custom">
              <ReactMarkdown>{item.result}</ReactMarkdown>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
