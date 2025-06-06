import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Mock auth hook — replace with your real auth context or state
function useAuth() {
  // For demo, let's assume user is logged in and has userId
  // Return null if not logged in
  return { user: { id: "user123", email: "user@example.com" } };
}

export default function ClientDashboard() {
  const auth = useAuth();
  const navigate = useNavigate();

  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [invoiceData, setInvoiceData] = useState(null);
  const [clientInvoices, setClientInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Redirect if not logged in
  useEffect(() => {
    if (!auth || !auth.user) {
      navigate("/login");
    }
  }, [auth, navigate]);

  // Fetch single invoice + client details by invoice number
  async function fetchInvoice() {
    setLoading(true);
    setError("");
    setInvoiceData(null);
    try {
      // Assume backend API requires userId to fetch user-specific data
      const res = await fetch(
        `/api/client/invoice/${invoiceNumber}`,
        {
          headers: {
            "Content-Type": "application/json",
            "x-user-id": auth.user.id, // or use Authorization: Bearer <token>
          },
        }
      );

      if (!res.ok) {
        throw new Error("Invoice not found or unauthorized");
      }

      const data = await res.json();
      setInvoiceData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Fetch all invoices for client email
  async function fetchInvoicesByEmail() {
    setLoading(true);
    setError("");
    setClientInvoices([]);
    try {
      const res = await fetch(
        `/api/client/invoices/${clientEmail}`,
        {
          headers: {
            "Content-Type": "application/json",
            "x-user-id": auth.user.id,
          },
        }
      );
      if (!res.ok) {
        throw new Error("No invoices found or unauthorized");
      }
      const data = await res.json();
      setClientInvoices(data.invoices || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Client Dashboard</h1>

      {/* Search by Invoice Number */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-3">Search by Invoice Number</h2>
        <input
          type="text"
          placeholder="Enter Invoice Number"
          className="border px-3 py-2 w-full max-w-sm"
          value={invoiceNumber}
          onChange={(e) => setInvoiceNumber(e.target.value)}
        />
        <button
          onClick={fetchInvoice}
          disabled={!invoiceNumber || loading}
          className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded disabled:bg-indigo-300"
        >
          Search
        </button>

        {error && <p className="text-red-600 mt-2">{error}</p>}

        {invoiceData && (
          <div className="mt-4 p-4 border rounded bg-white shadow">
            <h3 className="font-semibold text-lg mb-2">
              Invoice #{invoiceData.invoice.invoiceNumber}
            </h3>
            <p>
              <strong>Client Name:</strong> {invoiceData.client.clientName}
            </p>
            <p>
              <strong>Client Email:</strong> {invoiceData.client.clientEmail}
            </p>
            <p>
              <strong>Business Email:</strong> {invoiceData.client.businessEmail}
            </p>
            <p>
              <strong>Plan:</strong>{" "}
              {invoiceData.invoice.planId ? invoiceData.invoice.planId.name : "No plan assigned"}
            </p>
            {/* Add more invoice or reminder history details as needed */}
          </div>
        )}
      </section>

      {/* Search by Client Email */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Search Invoices by Client Email</h2>
        <input
          type="email"
          placeholder="Enter Client Email"
          className="border px-3 py-2 w-full max-w-sm"
          value={clientEmail}
          onChange={(e) => setClientEmail(e.target.value)}
        />
        <button
          onClick={fetchInvoicesByEmail}
          disabled={!clientEmail || loading}
          className="mt-2 px-4 py-2 bg-pink-600 text-white rounded disabled:bg-pink-300"
        >
          Search
        </button>

        {error && <p className="text-red-600 mt-2">{error}</p>}

        {clientInvoices.length > 0 && (
          <div className="mt-4 space-y-4">
            {clientInvoices.map((invoice) => (
              <div
                key={invoice._id}
                className="p-4 border rounded bg-white shadow"
              >
                <h3 className="font-semibold">
                  Invoice #{invoice.invoiceNumber} — Plan:{" "}
                  {invoice.planId ? invoice.planId.name : "No plan assigned"}
                </h3>
                <p>
                  <strong>Client Email:</strong> {invoice.clientEmail}
                </p>
                {/* Optionally show reminder history */}
              </div>
            ))}
          </div>
        )}

        {clientInvoices.length === 0 && !loading && (
          <p className="mt-4 text-gray-500">No invoices found.</p>
        )}
      </section>
    </div>
  );
}
