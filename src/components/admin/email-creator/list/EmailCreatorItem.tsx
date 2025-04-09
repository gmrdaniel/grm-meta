
import React from "react";
import { EmailCreator } from "@/types/email-creator";
import { TableCell, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, MessageSquarePlus } from "lucide-react";
import { format } from "date-fns";

interface EmailCreatorItemProps {
  creator: EmailCreator;
  isSelected: boolean;
  onSelectItem: (id: string) => void;
  onViewText: (creator: EmailCreator) => void;
  onGenerateClick: (creator: EmailCreator) => void;
  hideEmail?: boolean;
}

export const EmailCreatorItem: React.FC<EmailCreatorItemProps> = ({
  creator,
  isSelected,
  onSelectItem,
  onViewText,
  onGenerateClick,
  hideEmail = false,
}) => {
  const handleToggleSelect = () => {
    onSelectItem(creator.id);
  };

  const truncateUrl = (url: string, maxLength = 30) => {
    if (!url) return "";
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + "...";
  };

  return (
    <TableRow key={creator.id}>
      <TableCell className="w-[50px]">
        <Checkbox
          checked={isSelected}
          onCheckedChange={handleToggleSelect}
          aria-label={`Select ${creator.full_name}`}
        />
      </TableCell>
      <TableCell>
        <div className="font-medium">{creator.full_name}</div>
        {!hideEmail && <div className="text-sm text-muted-foreground">{creator.email}</div>}
      </TableCell>
      {!hideEmail && (
        <TableCell>{creator.email}</TableCell>
      )}
      <TableCell>
        <a 
          href={creator.tiktok_link} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          {truncateUrl(creator.tiktok_link)}
        </a>
      </TableCell>
      <TableCell>{creator.source_file || "Manual Entry"}</TableCell>
      <TableCell>
        {creator.created_at ? format(new Date(creator.created_at), 'MMM d, yyyy') : 'N/A'}
      </TableCell>
      <TableCell>
        <Badge 
          variant={creator.prompt_output ? "success" : "outline"}
        >
          {creator.prompt_output ? "Completed" : "Pending"}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex space-x-2">
          {creator.prompt_output && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onViewText(creator)}
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
          )}
          {!creator.prompt_output && (
            <Button 
              variant="default" 
              size="sm"
              onClick={() => onGenerateClick(creator)}
            >
              <MessageSquarePlus className="h-4 w-4 mr-1" />
              Generate
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};
