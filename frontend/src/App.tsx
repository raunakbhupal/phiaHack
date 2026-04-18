import { GiftProvider, useGiftState } from "./store/giftStore";
import { SearchPage } from "./pages/SearchPage";
import { FollowUpPage } from "./pages/FollowUpPage";
import { ResultsPage } from "./pages/ResultsPage";
import { LoadingOverlay } from "./components/LoadingOverlay";

function AppInner() {
  const { phase } = useGiftState();

  if (phase === "followup") {
    return <FollowUpPage />;
  }
  if (phase === "parsing" || phase === "searching" || phase === "ranking") {
    return <LoadingOverlay phase={phase} />;
  }
  if (phase === "done") {
    return <ResultsPage />;
  }
  return <SearchPage />;
}

export default function App() {
  return (
    <GiftProvider>
      <AppInner />
    </GiftProvider>
  );
}
