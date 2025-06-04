
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Share2, MessageSquare, Facebook, Linkedin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SocialShareButtonProps {
  title: string;
  url: string;
  className?: string;
}

const SocialShareButton = ({ title, url, className }: SocialShareButtonProps) => {
  const { toast } = useToast();

  const shareOnTwitter = () => {
    const text = `${title} #ImmigrationNews #Immigro`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, '_blank', 'width=550,height=420');
  };

  const shareOnFacebook = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(facebookUrl, '_blank', 'width=550,height=420');
  };

  const shareOnLinkedIn = () => {
    const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(linkedinUrl, '_blank', 'width=550,height=420');
  };

  const shareOnWhatsApp = () => {
    const text = `${title} - ${url}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const shareViaText = async () => {
    const shareText = `Check out this immigration news: ${title}\n\n${url}`;
    const smsUrl = `sms:?body=${encodeURIComponent(shareText)}`;
    
    // Try to open SMS app directly
    try {
      window.open(smsUrl, '_self');
    } catch (error) {
      // Fallback: use Web Share API or copy to clipboard
      if (navigator.share) {
        try {
          await navigator.share({
            title: title,
            text: `Check out this immigration news: ${title}`,
            url: url,
          });
        } catch (shareError) {
          console.error('Error sharing:', shareError);
          copyToClipboard(shareText);
        }
      } else {
        copyToClipboard(shareText);
      }
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: "Article link copied! You can now share it via text message.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy link. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={shareOnTwitter}>
          <MessageSquare className="w-4 h-4 mr-2" />
          Share on X (Twitter)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareOnFacebook}>
          <Facebook className="w-4 h-4 mr-2" />
          Share on Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareOnLinkedIn}>
          <Linkedin className="w-4 h-4 mr-2" />
          Share on LinkedIn
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareOnWhatsApp}>
          <MessageSquare className="w-4 h-4 mr-2" />
          Share on WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareViaText}>
          <MessageSquare className="w-4 h-4 mr-2" />
          Send via Text
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => copyToClipboard(`${title}\n\n${url}`)}>
          <Share2 className="w-4 h-4 mr-2" />
          Copy Link
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SocialShareButton;
