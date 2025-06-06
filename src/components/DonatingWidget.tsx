
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Gift, Heart, Coffee, Star, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface DonatingWidgetProps {
  upiId: string;
  name: string;
  amount: number;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  primaryColor?: string;
  buttonText?: string;
  theme?: "modern" | "classic";
  icon?: "gift" | "heart" | "coffee" | "star" | "zap";
  showPulse?: boolean;
  showGradient?: boolean;
  title?: string;
  description?: string;
}

const DonatingWidget = ({
  upiId,
  name,
  amount,
  position = "bottom-right",
  primaryColor = "#8B5CF6",
  buttonText = "Donate",
  theme = "modern",
  icon = "gift",
  showPulse = true,
  showGradient = true,
  title = "Support Us",
  description = "Scan this QR code to make a donation"
}: DonatingWidgetProps) => {
  const [open, setOpen] = useState(false);

  // Generate UPI QR code link
  const upiQrLink = `upi://pay?pa=${upiId}&am=${amount}&cu=INR&tn=${encodeURIComponent(`Donation to ${name}`)}`;
  
  // Generate QR code image URL
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiQrLink)}`;

  const getIcon = () => {
    switch (icon) {
      case "heart": return Heart;
      case "coffee": return Coffee;
      case "star": return Star;
      case "zap": return Zap;
      default: return Gift;
    }
  };

  const IconComponent = getIcon();

  const positionClasses = {
    "bottom-right": "fixed bottom-4 right-4",
    "bottom-left": "fixed bottom-4 left-4",
    "top-right": "fixed top-4 right-4",
    "top-left": "fixed top-4 left-4"
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <>
      <div className={cn(positionClasses[position], "z-50")}>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              className={cn(
                "rounded-full shadow-lg transition-all duration-300 hover:scale-110",
                showPulse && "animate-pulse",
                showGradient && "bg-gradient-to-r from-purple-500 to-pink-500",
                theme === "modern" && "backdrop-blur-sm"
              )}
              style={{ backgroundColor: !showGradient ? primaryColor : undefined }}
              size="lg"
            >
              <IconComponent size={20} className="mr-2" />
              {buttonText}
            </Button>
          </DialogTrigger>
          
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <IconComponent className="text-purple-500" size={24} />
                {title}
              </DialogTitle>
              <DialogDescription>
                {description}
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex flex-col items-center space-y-4 py-4">
              <div className="bg-white p-4 rounded-lg border shadow-sm">
                <img 
                  src={qrCodeUrl} 
                  alt="UPI Payment QR Code" 
                  className="w-48 h-48 object-contain"
                />
              </div>
              
              <div className="text-center space-y-2">
                <p className="font-medium">{name}</p>
                <p className="text-sm text-gray-600 break-all bg-gray-50 p-2 rounded cursor-pointer" 
                   onClick={() => copyToClipboard(upiId)}>
                  {upiId}
                </p>
                <p className="text-lg font-semibold text-purple-600">₹{amount}</p>
                
                <Button 
                  onClick={() => window.open(upiQrLink, '_blank')}
                  className="mt-4"
                  style={{ backgroundColor: primaryColor }}
                >
                  Open UPI App
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default DonatingWidget;
