import { useState } from "react";
import { Dashboard } from "./workers/Dashboard";
import { PageContainer } from "./layout/PageContainer";
import { AnalyticsDashboard } from "./analytics/AnalyticsDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, BarChart, HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function Home() {
  const [activeTab, setActiveTab] = useState("workers");

  return (
    <PageContainer>
      <div className="container mx-auto py-4 sm:py-6 px-2 sm:px-6 max-w-7xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-4">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-green-800">
                {activeTab === "workers"
                  ? "Worker Management"
                  : "Farm Analytics"}
              </h1>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-5 w-5 text-gray-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p>
                      {activeTab === "workers"
                        ? "Manage workers, track shifts, and record payments"
                        : "View farm performance metrics and worker statistics"}
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <TabsList className="self-start sm:self-auto">
              <TabsTrigger
                value="workers"
                className="flex items-center gap-1 sm:gap-2"
              >
                <Users className="h-4 w-4" />
                <span>Workers</span>
              </TabsTrigger>
              <TabsTrigger
                value="analytics"
                className="flex items-center gap-1 sm:gap-2"
              >
                <BarChart className="h-4 w-4" />
                <span>Analytics</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="workers" className="mt-0">
            <Dashboard />
          </TabsContent>

          <TabsContent value="analytics" className="mt-0">
            <AnalyticsDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}

export default Home;
