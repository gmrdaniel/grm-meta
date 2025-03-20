
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface FunctionsTabProps {
  script: string;
  onCopy: (text: string) => void;
  onDownload: (content: string, filename: string) => void;
}

const FunctionsTab = ({ script, onCopy, onDownload }: FunctionsTabProps) => {
  if (!script) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            Click "Get Function SQL" to generate database function scripts
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="flex gap-2 justify-end">
        <Button 
          variant="outline" 
          onClick={() => onCopy(script)}
        >
          Copy
        </Button>
        <Button 
          onClick={() => onDownload(script, 'functions.sql')}
        >
          Download SQL
        </Button>
      </div>
      <Textarea 
        value={script} 
        readOnly 
        className="font-mono h-[300px] overflow-y-auto"
      />
    </>
  );
};

export default FunctionsTab;
