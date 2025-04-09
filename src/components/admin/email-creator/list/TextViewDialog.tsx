
import React from "react";
import { EmailCreator } from "@/types/email-creator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface TextViewDialogProps {
  creator: EmailCreator | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const TextViewDialog: React.FC<TextViewDialogProps> = ({
  creator,
  isOpen,
  onOpenChange,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generated Text for {creator?.full_name}</DialogTitle>
        </DialogHeader>
        {creator?.prompt_output ? (
          <div className="whitespace-pre-wrap text-base">
            {creator.prompt_output}
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">
            No generated text available.
          </div>
        )}
        <div className="flex justify-end">
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};
