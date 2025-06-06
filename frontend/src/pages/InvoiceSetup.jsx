import { useState, useEffect } from "react";
import { toast } from "react-toastify";

export default function InvoiceSetup() {
  const [activeTab, setActiveTab] = useState("invoice");

  // Plan states
  const [planName, setPlanName] = useState("");
  const [planDays, setPlanDays] = useState("");
  const [planLoading, setPlanLoading] = useState(false);

  // Invoice states
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [businessEmail, setBusinessEmail] = useState("");
  const [service, setService] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [invoiceLoading, setInvoiceLoading] = useState(false);

  // Plans data fetched from backend
  const [plans, setPlans] = useState([]);

  // Fetch plans on component mount
  useEffect(() => {
    async function fetchPlans() {
      try {
        const res = await fetch("/api/plans", {
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok) {
          setPlans(data.plans || data);
        } else {
          toast.error(data.message || "Failed to load plans");
        }
      } catch (error) {
        toast.error("Network error while loading plans");
      }
    }
    fetchPlans();
  }, []);

  // Handle plan creation submit
  const handlePlanSubmit = async (e) => {
    e.preventDefault();
    setPlanLoading(true);

    // Validate and parse days
    const daysArray = planDays
      .split(",")
      .map((d) => Number(d.trim()))
      .filter((d) => !isNaN(d) && d >= 0);

    if (!planName.trim() || daysArray.length === 0) {
      toast.error("Please enter a valid plan name and reminder days");
      setPlanLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: planName.trim(), days: daysArray }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Plan created successfully");
        // Append new plan to list
        setPlans((prev) => [...prev, data.plan || data]);
        // Reset form
        setPlanName("");
        setPlanDays("");
        // Switch to invoice tab
        setActiveTab("invoice");
      } else {
        toast.error(data.message || "Failed to create plan");
      }
    } catch {
      toast.error("Network error");
    }
    setPlanLoading(false);
  };

  // Handle invoice creation submit
  const handleInvoiceSubmit = async (e) => {
    e.preventDefault();
    setInvoiceLoading(true);

    if (
      !invoiceNumber.trim() ||
      !clientName.trim() ||
      !clientEmail.trim() ||
      !businessEmail.trim() ||
      !service.trim() ||
      !amount
    ) {
      toast.error("Please fill all invoice fields");
      setInvoiceLoading(false);
      return;
    }

    try {
      // Create the invoice first
      const createResponse = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          invoiceNumber: invoiceNumber.trim(),
          clientName: clientName.trim(),
          clientEmail: clientEmail.trim(),
          businessEmail: businessEmail.trim(),
          service: service.trim(),
          amount: Number(amount),
        }),
      });

      const createData = await createResponse.json();

      if (!createResponse.ok) {
        toast.error(createData.message || "Failed to create invoice");
        setInvoiceLoading(false);
        return;
      }

      // Assign reminder plan if selected
      if (selectedPlanId) {
        const assignResponse = await fetch(
          `/api/invoices/${createData.invoice._id}/assign-plan`,
          {
            method: "POST", // Adjust to PUT if your backend expects that
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ planId: selectedPlanId }),
          }
        );

        const assignData = await assignResponse.json();

        if (!assignResponse.ok) {
          toast.error(assignData.message || "Failed to assign plan");
          setInvoiceLoading(false);
          return;
        }
      }

      toast.success("Invoice created successfully");

      // Reset invoice form fields
      setInvoiceNumber("");
      setClientName("");
      setClientEmail("");
      setBusinessEmail("");
      setService("");
      setAmount("");
      setSelectedPlanId("");
    } catch (error) {
      toast.error("Network error");
    }
    setInvoiceLoading(false);
  };

  // Tab button class for active/inactive states
  const tabClass = (tab) =>
    `cursor-pointer px-4 py-2 font-semibold transition-all duration-300 ${
      activeTab === tab
        ? "border-b-4 border-blue-600 text-blue-600 scale-110"
        : "text-gray-600 hover:text-blue-500"
    }`;

  return (
    <div className="max-w-3xl mx-auto p-6 mt-10 bg-white rounded-xl shadow-md">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Invoice & Plan Setup
      </h1>

      {/* Tabs */}
      <div className="flex justify-center space-x-6 border-b border-gray-300 mb-8">
        <button
          className={tabClass("invoice")}
          onClick={() => setActiveTab("invoice")}
        >
          Create Invoice
        </button>
        <button
          className={tabClass("plan")}
          onClick={() => setActiveTab("plan")}
        >
          Create Plan
        </button>
      </div>

      <div className="transition-all duration-500 ease-in-out" style={{ minHeight: 450 }}>
        {activeTab === "plan" && (
          <form onSubmit={handlePlanSubmit} className="space-y-6 animate-fadeIn">
            <div>
              <label className="block mb-1 font-medium">Plan Name</label>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-400 transition"
                value={planName}
                onChange={(e) => setPlanName(e.target.value)}
                placeholder="Example: Plan A"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">
                Reminder Days (comma separated)
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-400 transition"
                value={planDays}
                onChange={(e) => setPlanDays(e.target.value)}
                placeholder="Example: 1, 6, 10"
                required
              />
            </div>
            <button
              type="submit"
              disabled={planLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md disabled:opacity-50 transition"
            >
              {planLoading ? "Creating Plan..." : "Create Plan"}
            </button>
          </form>
        )}

        {activeTab === "invoice" && (
          <form onSubmit={handleInvoiceSubmit} className="animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Left column */}
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 font-medium">Invoice Number</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-400 transition"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    placeholder="Example: INV-001"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Client Email</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-400 transition"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="client@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Service Description</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-400 transition"
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    placeholder="Service provided"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Amount</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-400 transition"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="1000"
                    required
                  />
                </div>
              </div>

              {/* Right column */}
              <div className="space-y-4">
                <div>
                  <label className="block mb-1 font-medium">Client Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-400 transition"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Client's full name"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">Business Email</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-400 transition"
                    value={businessEmail}
                    onChange={(e) => setBusinessEmail(e.target.value)}
                    placeholder="business@example.com"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 font-medium">
                    Assign Reminder Plan (optional)
                  </label>
                  <select
                    className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-green-400 transition"
                    value={selectedPlanId}
                    onChange={(e) => setSelectedPlanId(e.target.value)}
                  >
                    <option value="">-- No Plan --</option>
                    {plans.map((plan) => (
                      <option key={plan._id} value={plan._id}>
                        {plan.name} ({plan.days.join(", ")})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={invoiceLoading}
              className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-md disabled:opacity-50 transition"
            >
              {invoiceLoading ? "Creating Invoice..." : "Create Invoice"}
            </button>
          </form>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease forwards;
        }
      `}</style>
    </div>
  );
}
