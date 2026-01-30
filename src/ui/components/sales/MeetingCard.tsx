import { Card } from "@/ui/components/card";
import { ArrowRight, LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/ui/utils";

interface MeetingCardProps {
  title: string;
  description: string;
  route: string;
  icon: LucideIcon;
  colorClass: string;
  gradientClass: string;
}

const MeetingCard = ({ 
  title, 
  description, 
  route, 
  icon: Icon, 
  colorClass,
  gradientClass 
}: MeetingCardProps) => {
  return (
    <Link to={route} className="block group">
      <Card className="relative overflow-hidden border-2 hover:border-current transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <div className={cn("absolute inset-0 opacity-5", gradientClass)}></div>
        
        <div className="relative p-6">
          <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center mb-4", colorClass, "bg-opacity-10")}>
            <Icon className={cn("h-7 w-7", colorClass)} />
          </div>
          
          <h3 className={cn("text-xl font-bold mb-2", colorClass)}>
            {title}
          </h3>
          
          <p className="text-muted-foreground mb-4">
            {description}
          </p>
          
          <div className={cn("flex items-center text-sm font-semibold", colorClass)}>
            Enter Module
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-2" />
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default MeetingCard;
