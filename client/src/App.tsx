// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { JobList } from "@/components";
import { JobDetail } from "@/pages";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/jobs" element={<JobList />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
