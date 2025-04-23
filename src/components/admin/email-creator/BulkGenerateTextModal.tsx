
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
import { Loader2, Check, AlertCircle } from "lucide-react";
import { EmailCreator } from "@/types/email-creator";
import { toast } from "sonner";
import { updateEmailCreatorPrompt } from "@/services/emailCreatorService";
import { Progress } from "@/components/ui/progress";

interface BulkGenerateTextModalProps {
  creators: EmailCreator[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function BulkGenerateTextModal({
  creators,
  open,
  onOpenChange,
  onSuccess
}: BulkGenerateTextModalProps) {
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState("");
  const [progress, setProgress] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [ineligibleCreators, setIneligibleCreators] = useState<EmailCreator[]>([]);

  // Filter out creators that are already completed
  const eligibleCreators = creators.filter(c => c.status !== 'completed');

  // Load the template description
  useEffect(() => {
    // This is the same template as in GenerateTextModal
    setDescription("Help me research and include a paragraph about a creator within a template that I will provide. Do not change the template. Only add your paragraph (2 lines max) in the section marked with [ ] and add the name of the creator in the section { }. Make sure to get rid of the [ ] and { } once you insert the content so it looks natural. \nMake sure the text included has the same tone, language, and structure so it feels seamless to a reader.\nThe paragraph that you should include should analyze a tiktok or youtube user and provide some pointers that will demonstrate an interest from the sender about the user.  \nAnalyze the following TikTok or YouTube user profile:\nCreator Name: {nombre} \nYouTube or TikTok Profile:  {link_red_social}\nTemplate here:\n\nHi {INSERT NAME HERE},\n\nI'm Nicole Kressler from La Neta — we're an influencer marketing agency partnering with Meta to invite creators like you to the Meta Creator Breakthrough Program.\n\nWe've been checking out your content —  [INSERT CONTENT HERE]. We think it's a great fit for what Meta is supporting right now.\n\nThis program is built to help creators grow and get paid for doing what they already do.\n\nHere's what you'd get if accepted:\n\n-Instant access to Facebook Monetization\n-Up to $5,000 in extra bonuses (first 90 days)\n-Free Meta Verified\n-Support directly from us and Meta in your journey\n\nWhen you join the Meta Creator Breakthrough Bonus Program through us, you're not doing it alone. We'll walk you through setup, help you optimize your content, and get you monetizing faster. You'll also get priority access to Meta's team, plus support if anything comes up during onboarding process.\n\nPlease reach out to me if you have any questions. Alternatively, if you are ready to start please complete your application below and we'll get ready to work!");
  }, []);

  // Function to generate a prompt based on creator data
  const generatePrompt = (creator: EmailCreator) => {
    let prompt = description;
    prompt = prompt.replace(/{nombre}/g, creator.full_name || "{nombre}");
    prompt = prompt.replace(/{link_red_social}/g, creator.tiktok_link || "{link_red_social}");
    return prompt;
  };

  // Function to extract plain text from API response - copied from GenerateTextModal
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

  const generateTextForSingleCreator = async (creator: EmailCreator) => {
    try {
      const prompt = generatePrompt(creator);
      const response = await fetch('https://chatgpt-42.p.rapidapi.com/gpt4', {
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
      
      // Extract the plain text and apply double newlines
      const plainText = extractPlainText(data.result);
      
      // Update the email creator with the prompt, result and change status to 'completed'
      await updateEmailCreatorPrompt(creator.id, prompt, plainText);
      
      return true;
    } catch (error) {
      console.error(`Error generating text for ${creator.full_name}:`, error);
      return false;
    }
  };

  const handleBulkGenerate = async () => {
    if (eligibleCreators.length === 0) {
      toast.error("No eligible creators to process");
      return;
    }
    
    setLoading(true);
    setProgress(0);
    setProcessedCount(0);
    setFailedCount(0);
    
    // Find creators that are already completed
    const alreadyCompletedCreators = creators.filter(c => c.status === 'completed');
    setIneligibleCreators(alreadyCompletedCreators);
    
    try {
      // Process creators sequentially to avoid API rate limits
      for (let i = 0; i < eligibleCreators.length; i++) {
        const creator = eligibleCreators[i];
        const success = await generateTextForSingleCreator(creator);
        
        if (success) {
          setProcessedCount(prev => prev + 1);
        } else {
          setFailedCount(prev => prev + 1);
        }
        
        // Update progress
        setProgress(((i + 1) / eligibleCreators.length) * 100);
      }
      
      if (failedCount > 0) {
        toast.warning(`Generated texts for ${processedCount} creators with ${failedCount} failures`);
      } else {
        toast.success(`Successfully generated texts for all ${processedCount} creators`);
      }
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error in bulk generation:", error);
      toast.error("Failed to complete bulk text generation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Generate Text Notifications In Bulk</DialogTitle>
          <DialogDescription>
            Generate personalized notifications for {eligibleCreators.length} selected creators.
            {ineligibleCreators.length > 0 && (
              <div className="mt-2 p-2 bg-yellow-50 rounded-md flex items-center gap-2 text-yellow-700">
                <AlertCircle className="h-4 w-4" />
                <span>{ineligibleCreators.length} creators already have completed status and will be skipped.</span>
              </div>
            )}
          </DialogDescription>
        </DialogHeader>
        
        {loading && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Processing creators...</span>
                <span className="text-sm font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Processed: {processedCount}</span>
                <span>Failed: {failedCount}</span>
                <span>Total: {eligibleCreators.length}</span>
              </div>
            </div>
          </div>
        )}
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleBulkGenerate} 
            disabled={loading || eligibleCreators.length === 0}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Generate {eligibleCreators.length} Notifications
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
