import { AlertCircle } from "lucide-react";
import { Button } from "./Button";
import { Card } from "./Card";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ 
  title = "Something went wrong", 
  message = "We couldn't load this data. Please try again later.",
  onRetry 
}: ErrorStateProps) {
  return (
    <Card className="p-8 text-center flex flex-col items-center justify-center border-red-500/20">
      <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-4">
        <AlertCircle size={32} />
      </div>
      <h3 className="text-xl font-bold mb-2 text-slate-50">{title}</h3>
      <p className="text-slate-400 mb-6 max-w-md">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </Card>
  );
}
