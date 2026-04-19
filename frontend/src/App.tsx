import { useState } from "react";
import { GiftProvider, useGiftState } from "./store/giftStore";
import { SearchPage } from "./pages/SearchPage";
import { FollowUpPage } from "./pages/FollowUpPage";
import { ResultsPage } from "./pages/ResultsPage";
import { WishlistPage } from "./pages/WishlistPage";
import { LoadingOverlay } from "./components/LoadingOverlay";

function AppInner() {
  const { phase } = useGiftState();
  const [showWishlist, setShowWishlist] = useState(false);

  if (showWishlist) {
    return <WishlistPage onBack={() => setShowWishlist(false)} />;
  }
  if (phase === "followup") {
    return <FollowUpPage />;
  }
  if (phase === "parsing" || phase === "searching" || phase === "ranking") {
    return <LoadingOverlay phase={phase} />;
  }
  if (phase === "done") {
    return <ResultsPage onShowWishlist={() => setShowWishlist(true)} />;
  }
  return <SearchPage onShowWishlist={() => setShowWishlist(true)} />;
}

export default function App() {
  return (
    <GiftProvider>
      <AppInner />
    </GiftProvider>
  );
}
