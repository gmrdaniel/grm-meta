
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface MessagePreviewProps {
  message: string;
  onChange: (message: string) => void;
}

export function MessagePreview({ message, onChange }: MessagePreviewProps) {
  return (
    <div>
      <Label htmlFor="message">Message</Label>
      <Textarea
        id="message"
        value={message}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Write your message here..."
        className="min-h-[100px]"
        required
      />
    </div>
  );
}
