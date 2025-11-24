// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { JobDetail, JobList } from "@/pages";
import { TestJobService } from "@/test";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/test" element={<TestJobService />} />
        <Route path="/jobs" element={<JobList />} />
        <Route path="/jobs/:id" element={<JobDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
