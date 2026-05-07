import { Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import History from "./pages/History";
import Home from "./pages/Home";
import Memory from "./pages/Memory";

export default function App() {
  return (
    <div className="min-h-screen bg-bg text-white font-sans">
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 pb-12 pt-6 md:px-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/history" element={<History />} />
          <Route path="/memory" element={<Memory />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
