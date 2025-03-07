import { Navbar } from "./Navbar";

interface PageContainerProps {
  children: React.ReactNode;
}

export function PageContainer({ children }: PageContainerProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="pt-16 pb-8">{children}</div>
    </div>
  );
}
