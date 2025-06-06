import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import SMTPSetup from "./pages/SMTPSetup";
import InvoiceSetup from "./pages/InvoiceSetup";
import ClientDashboard from "./pages/ClientDashboard";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function App() {
  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-112px)]">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/smtp" element={<SMTPSetup />} />
          <Route path="/invoice-setup" element={<InvoiceSetup />} />
          <Route path="/clients" element={<ClientDashboard />} />
        </Routes>
      </main>
      <Footer />
      <ToastContainer position="top-center" autoClose={3000} />
    </>
  );
}
