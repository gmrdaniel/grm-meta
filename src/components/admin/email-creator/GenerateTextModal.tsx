
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Loader2, Check, Eye } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { EmailCreator } from "@/types/email-creator";
import { toast } from "sonner";
import { updateEmailCreatorPrompt } from "@/services/emailCreatorService";

interface GenerateTextModalProps {
  creator: EmailCreator | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function GenerateTextModal({
  creator,
  open,
  onOpenChange,
  onSuccess
}: GenerateTextModalProps) {
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");
  const [processedPrompt, setProcessedPrompt] = useState("");
  const [result, setResult] = useState<any>(null);
  const [extractedText, setExtractedText] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  // Load the template description
  useEffect(() => {
    // This is the same template from RedactarTab
    setDescription("Help me research and include a paragraph about a creator within a template that I will provide. Do not change the template. Only add your paragraph (2 lines max) in the section marked with [ ] and add the name of the creator in the section { }. Make sure to get rid of the [ ] and { } once you insert the content so it looks natural. \nMake sure the text included has the same tone, language, and structure so it feels seamless to a reader.\nThe paragraph that you should include should analyze a tiktok or youtube user and provide some pointers that will demonstrate an interest from the sender about the user.  \nAnalyze the following TikTok or YouTube user profile:\nCreator Name: {nombre} \nYouTube or TikTok Profile:  {link_red_social}\nTemplate here:\n\nHi {INSERT NAME HERE},\n\nI'm Nicole Kressler from La Neta — we're an influencer marketing agency partnering with Meta to invite creators like you to the Meta Creator Breakthrough Program.\n\nWe've been checking out your content —  [INSERT CONTENT HERE]. We think it's a great fit for what Meta is supporting right now.\n\nThis program is built to help creators grow and get paid for doing what they already do.\n\nHere's what you'd get if accepted:\n\n-Instant access to Facebook Monetization\n-Up to $5,000 in extra bonuses (first 90 days)\n-Free Meta Verified\n-Support directly from us and Meta in your journey\n\nWhen you join the Meta Creator Breakthrough Bonus Program through us, you're not doing it alone. We'll walk you through setup, help you optimize your content, and get you monetizing faster. You'll also get priority access to Meta's team, plus support if anything comes up during onboarding process.\n\nPlease reach out to me if you have any questions. Alternatively, if you are ready to start please complete your application below and we'll get ready to work!\n\nNicole Kressler\nCreator Management Representative\nLa Neta");
  }, []);

  // Process the prompt when creator changes
  useEffect(() => {
    if (creator) {
      let prompt = description;
      prompt = prompt.replace(/{nombre}/g, creator.full_name || "{nombre}");
      prompt = prompt.replace(/{link_red_social}/g, creator.tiktok_link || "{link_red_social}");
      setProcessedPrompt(prompt);
      
      // If the creator already has a prompt_output, set it to be previewed
      if (creator.prompt_output) {
        setExtractedText(creator.prompt_output);
      }
    }
  }, [description, creator]);

  // Function to extract plain text from API response
  const extractPlainText = (result: any) => {
    try {
      let plainText = "";
      console.log("Result structure:", JSON.stringify(result, null, 2));
      
      if (typeof result === 'string') {
        plainText = result;
      } else if (result.content) {
        plainText = result.content;
      } else if (result.result) {
        plainText = result.result;
      } else if (result.choices && result.choices[0]?.message?.content) {
        plainText = result.choices[0].message.content;
      } else {
        // Try to find content in any nested structure
        const resultStr = JSON.stringify(result);
        const contentMatch = resultStr.match(/"content":"([^"]+)"/);
        if (contentMatch && contentMatch[1]) {
          plainText = contentMatch[1];
        } else {
          throw new Error("No se pudo encontrar el contenido del mensaje");
        }
      }
      
      // Replace escaped newlines with actual newlines
      plainText = plainText.replace(/\\n/g, '\n');
      
      // Replace each newline with two newlines
      plainText = plainText.replace(/\n/g, '\n\n');
      
      return plainText;
    } catch (err) {
      console.error("Error extracting text:", err);
      throw new Error("No se pudo extraer el texto plano");
    }
  };

  const handleGenerateText = async () => {
    if (!creator) return;
    
    setLoading(true);
    try {
      const prompt = processedPrompt;
      const response = await fetch('https://chatgpt-42.p.rapidapi.com/gpt4o', {
        method: 'POST',
        headers: {
          'x-rapidapi-key': '9e40c7bc0dmshe6e2e43f9b23e23p1c66dbjsn39d61b2261d5',
          'x-rapidapi-host': 'chatgpt-42.p.rapidapi.com',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: prompt
          }],
          web_access: true
        })
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`API error: ${errorData}`);
      }
      
      const data = await response.json();
      setResult(data.result);
      
      // Extract the plain text and apply double newlines
      const plainText = extractPlainText(data.result);
      setExtractedText(plainText);
      
      // Update the email creator with the prompt, result and change status to 'completed'
      await updateEmailCreatorPrompt(creator.id, prompt, plainText);
      
      toast.success("Text notification generated and status updated to completed");
      onSuccess();
      onOpenChange(false);
    } catch (err) {
      console.error("Error generating text:", err);
      toast.error(`Error generating text: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate Text Notification for {creator?.full_name}</DialogTitle>
          <DialogDescription>
            This will generate a personalized notification for the creator using GPT-4o and update their status to completed.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Creator Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium">Name:</span>
                <p className="text-sm">{creator?.full_name}</p>
              </div>
              <div>
                <span className="text-sm font-medium">TikTok Link:</span>
                <p className="text-sm break-all">{creator?.tiktok_link}</p>
              </div>
              {creator?.link_invitation && (
                <div>
                  <span className="text-sm font-medium">Invitation Link:</span>
                  <p className="text-sm break-all">{creator?.link_invitation}</p>
                </div>
              )}
              <div>
                <span className="text-sm font-medium">Current Status:</span>
                <p className="text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    creator?.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {creator?.status}
                  </span>
                </p>
              </div>
            </div>
          </div>
          
          {creator?.prompt_output && (
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={togglePreview}
                className="flex items-center gap-2"
              >
                <Eye className="h-4 w-4" />
                {showPreview ? "Hide Preview" : "Show Preview"}
              </Button>
            </div>
          )}
          
          {(showPreview && creator?.prompt_output) ? (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Generated Content Preview</h3>
              <div className="p-4 bg-blue-50 rounded-md whitespace-pre-wrap">
                {creator.prompt_output}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Prompt Template</h3>
              <Textarea 
                value={processedPrompt} 
                readOnly 
                className="h-40 font-mono text-xs bg-gray-50"
              />
            </div>
          )}
          
          {extractedText && !showPreview && (
            <div className="space-y-2 border-t pt-4">
              <h3 className="text-sm font-medium">Generated Text</h3>
              <div className="p-4 bg-blue-50 rounded-md whitespace-pre-wrap">
                {extractedText}
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleGenerateText} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Generate Text
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
