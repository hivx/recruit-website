// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TestJobService } from "@/test";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/test" element={<TestJobService />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
