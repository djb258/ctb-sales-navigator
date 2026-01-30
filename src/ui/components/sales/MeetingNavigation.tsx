import { Link, useLocation } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/ui/components/card";
import { Users, LineChart, Gauge, PresentationIcon, Wrench } from "lucide-react";

const MeetingNavigation = () => {
  const location = useLocation();
  
  const navItems = [
    { 
      title: "Meeting 1", 
      path: "/sales/meeting1", 
      icon: Users,
      color: "meeting1-emerald"
    },
    { 
      title: "Meeting 2", 
      path: "/sales/meeting2", 
      icon: LineChart,
      color: "meeting2-royal"
    },
    { 
      title: "M2 Workbench", 
      path: "/sales/meeting2-workbench", 
      icon: Wrench,
      color: "meeting2-royal"
    },
    { 
      title: "Meeting 3", 
      path: "/sales/meeting3", 
      icon: Gauge,
      color: "meeting3-crimson"
    },
    { 
      title: "Meeting 4", 
      path: "/sales/meeting4", 
      icon: PresentationIcon,
      color: "meeting4-gold"
    },
  ];

  return (
    <div className="fixed left-4 top-20 z-50 w-48">
      <Card className="border-border/50 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Meetings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link key={item.path} to={item.path}>
                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                    isActive
                      ? `bg-${item.color}/10 text-${item.color} font-medium`
                      : "hover:bg-muted text-muted-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </div>
              </Link>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default MeetingNavigation;
