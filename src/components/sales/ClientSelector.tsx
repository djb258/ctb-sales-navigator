import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2 } from "lucide-react";

interface ClientSelectorProps {
  value?: string;
  onValueChange?: (value: string) => void;
}

const ClientSelector = ({ value, onValueChange }: ClientSelectorProps) => {
  // Placeholder clients - will be connected to Firebase later
  const mockClients = [
    { uid: "client_001", name: "Acme Corporation" },
    { uid: "client_002", name: "TechStart Industries" },
    { uid: "client_003", name: "Global Solutions LLC" },
    { uid: "client_004", name: "Innovation Partners" },
  ];

  return (
    <div className="flex items-center gap-3">
      <Building2 className="h-5 w-5 text-muted-foreground" />
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-64 bg-card">
          <SelectValue placeholder="Select client..." />
        </SelectTrigger>
        <SelectContent>
          {mockClients.map((client) => (
            <SelectItem key={client.uid} value={client.uid}>
              {client.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default ClientSelector;
