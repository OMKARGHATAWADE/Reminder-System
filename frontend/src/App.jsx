import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import SMTPSetup from "./pages/SMTPSetup";  // <-- Import SMTPSetup page

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  return (
    <>
      <Navbar /> {/* Navbar visible on all pages */}
      <main className="min-h-[calc(100vh-112px)]">
        {/* adjust min height for footer */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/smtp" element={<SMTPSetup />} />  {/* Added SMTP route */}
        </Routes>
      </main>
      <Footer /> {/* Footer visible on all pages */}
      <ToastContainer position="top-center" autoClose={3000} />
    </>
  );
}
