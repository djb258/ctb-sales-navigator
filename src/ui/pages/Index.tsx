import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <div className="container mx-auto px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8 inline-block">
            <div className="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-semibold">
              CTB Sales Process Management
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-meeting2-royal bg-clip-text text-transparent">
            Sales Process Hub
          </h1>
          
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            A structured approach to client engagement following the CTB doctrine. 
            Navigate through discovery, presentation, operations, and finalization seamlessly.
          </p>
          
          <Link to="/sales/hub">
            <Button size="lg" className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 group">
              Enter Sales Hub
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>

          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-xl bg-card border border-border hover:border-meeting1-emerald/50 transition-all">
              <div className="w-12 h-12 rounded-lg bg-meeting1-emerald/10 flex items-center justify-center mb-4 mx-auto">
                <div className="w-6 h-6 rounded-full bg-meeting1-emerald"></div>
              </div>
              <h3 className="font-semibold text-meeting1-emerald mb-2">Discovery</h3>
              <p className="text-sm text-muted-foreground">Client intake & needs analysis</p>
            </div>

            <div className="p-6 rounded-xl bg-card border border-border hover:border-meeting2-royal/50 transition-all">
              <div className="w-12 h-12 rounded-lg bg-meeting2-royal/10 flex items-center justify-center mb-4 mx-auto">
                <div className="w-6 h-6 rounded-full bg-meeting2-royal"></div>
              </div>
              <h3 className="font-semibold text-meeting2-royal mb-2">Presentation</h3>
              <p className="text-sm text-muted-foreground">Calculator & compliance tools</p>
            </div>

            <div className="p-6 rounded-xl bg-card border border-border hover:border-meeting3-crimson/50 transition-all">
              <div className="w-12 h-12 rounded-lg bg-meeting3-crimson/10 flex items-center justify-center mb-4 mx-auto">
                <div className="w-6 h-6 rounded-full bg-meeting3-crimson"></div>
              </div>
              <h3 className="font-semibold text-meeting3-crimson mb-2">Operations</h3>
              <p className="text-sm text-muted-foreground">Service metrics & dashboards</p>
            </div>

            <div className="p-6 rounded-xl bg-card border border-border hover:border-meeting4-gold/50 transition-all">
              <div className="w-12 h-12 rounded-lg bg-meeting4-gold/10 flex items-center justify-center mb-4 mx-auto">
                <div className="w-6 h-6 rounded-full bg-meeting4-gold"></div>
              </div>
              <h3 className="font-semibold text-meeting4-gold mb-2">Finalization</h3>
              <p className="text-sm text-muted-foreground">Cost presentation & ROI</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
