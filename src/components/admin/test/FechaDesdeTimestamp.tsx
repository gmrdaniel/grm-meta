
import { format } from "date-fns";

interface FechaDesdeTimestampProps {
  timestamp: string | number;
  formatString?: string;
}

const FechaDesdeTimestamp = ({ timestamp, formatString = "dd/MM/yyyy" }: FechaDesdeTimestampProps) => {
  try {
    let date: Date;
    
    if (typeof timestamp === 'number') {
      // If timestamp is a number, determine if it's in seconds or milliseconds
      date = timestamp > 10000000000 
        ? new Date(timestamp) // Already in milliseconds
        : new Date(timestamp * 1000); // Convert seconds to milliseconds
    } else {
      // Handle string timestamps (ISO format)
      date = new Date(timestamp);
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Fecha inválida";
    }
    
    return format(date, formatString);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Fecha inválida";
  }
};

export default FechaDesdeTimestamp;
