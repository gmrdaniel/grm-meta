
import React from "react";
import { EmailCreator } from "@/types/email-creator";
import { TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Wand2, Eye, ExternalLink } from "lucide-react";

interface EmailCreatorItemProps {
  creator: EmailCreator;
  isSelected: boolean;
  onSelectItem: (id: string) => void;
  onViewText: (creator: EmailCreator) => void;
  onGenerateClick: (creator: EmailCreator) => void;
}

export const EmailCreatorItem: React.FC<EmailCreatorItemProps> = ({
  creator,
  isSelected,
  onSelectItem,
  onViewText,
  onGenerateClick,
}) => {
  const getTiktokHandle = (tiktokLink: string): string => {
    const match = tiktokLink.match(/@([^/?]+)/);
    if (match && match[1]) {
      return `@${match[1]}`;
    }
    
    if (!tiktokLink.includes("/") && !tiktokLink.includes("@")) {
      return `@${tiktokLink}`;
    }
    
    return tiktokLink;
  };

  return (
    <TableRow key={creator.id}>
      <TableCell>
        <Checkbox 
          checked={isSelected}
          onCheckedChange={() => onSelectItem(creator.id)}
          aria-label={`Select ${creator.full_name}`}
        />
      </TableCell>
      <TableCell>{creator.full_name}</TableCell>
      <TableCell>{creator.email}</TableCell>
      <TableCell>
        <a 
          href={creator.tiktok_link} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline flex items-center gap-1"
        >
          {getTiktokHandle(creator.tiktok_link)}
          <ExternalLink size={14} />
        </a>
      </TableCell>
      <TableCell>
        <span className="text-sm text-gray-600">
          {creator.source_file || "Manual entry"}
        </span>
      </TableCell>
      <TableCell>{new Date(creator.created_at).toLocaleString()}</TableCell>
      <TableCell>
        <span className={`px-2 py-1 rounded-full text-xs ${
          creator.status === 'completed' ? 'bg-green-100 text-green-800' : 
          creator.status === 'active' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {creator.status}
        </span>
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          {creator.prompt_output && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onViewText(creator)}
              className="flex items-center gap-1"
            >
              <Eye className="h-4 w-4" />
              View Text
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onGenerateClick(creator)}
            className="flex items-center gap-1"
            disabled={creator.status === 'completed'}
          >
            <Wand2 className="h-4 w-4" />
            {creator.status === 'completed' ? 'Already Generated' : 'Create Text'}
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};
