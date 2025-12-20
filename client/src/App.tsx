// src/App.tsx
import { BrowserRouter } from "react-router-dom";
import { AppRouter } from "@/routers";
import { ScrollToTop } from "@/utils";

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AppRouter />
    </BrowserRouter>
  );
}

export default App;
