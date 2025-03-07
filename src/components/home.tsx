import { Dashboard } from "./workers/Dashboard";
import { PageContainer } from "./layout/PageContainer";

function Home() {
  return (
    <PageContainer>
      <Dashboard />
    </PageContainer>
  );
}

export default Home;
