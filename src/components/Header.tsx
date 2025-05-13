import { Button } from "@/components/ui/button";
import { HelpCircle, Settings, ExternalLink } from "lucide-react";
const Header = () => {
  return <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-2 rounded-md shadow-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
          </div>
          <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">InstructAI</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100">
            <HelpCircle size={20} />
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100">
            <Settings size={20} />
          </Button>
          
        </div>
      </div>
    </header>;
};
export default Header;