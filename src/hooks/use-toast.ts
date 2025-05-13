
// Re-export toast hooks from the UI components
import { useToast as useToastUI, toast as toastUI } from "@/components/ui/toast";

// Re-export with the same names
export const useToast = useToastUI;
export const toast = toastUI;
