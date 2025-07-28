import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { StoryVersion } from "@/hooks/useVersionHistory";

interface RestoreConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  version: StoryVersion | null;
}

export function RestoreConfirmDialog({ isOpen, onClose, onConfirm, version }: RestoreConfirmDialogProps) {
  if (!version) return null;

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Restore Version</AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>Are you sure you want to restore this version? Your current draft will be overwritten.</p>
            <div className="p-3 bg-muted rounded-lg">
              <p className="font-medium">{version.label}</p>
              <p className="text-sm text-muted-foreground">{formatTimestamp(version.timestamp)}</p>
              <p className="text-sm text-muted-foreground mt-1">"{version.title}"</p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Restore Version
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}