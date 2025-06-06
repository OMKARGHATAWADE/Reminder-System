import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";  // <-- Import useNavigate

export default function SMTPSetup() {
  const [form, setForm] = useState({
    host: "",
    port: "",
    secure: true,
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text: string }
  const [isLoggedIn, setIsLoggedIn] = useState(null); // null = loading, true/false = known

  const navigate = useNavigate();  // <-- Initialize navigate

  // Check login status on mount
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/check", {
          credentials: "include", // send cookies automatically
        });
        setIsLoggedIn(res.ok);
      } catch (err) {
        setIsLoggedIn(false);
      }
    }
    checkAuth();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (!isLoggedIn) {
      setMessage({ type: "error", text: "You must be logged in to perform this action." });
      setLoading(false);
      return;
    }

    if (!form.host.trim() || !form.port || !form.email.trim() || !form.password.trim()) {
      setMessage({ type: "error", text: "Please fill in all required fields." });
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/smtp/smtpSetup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          host: form.host.trim(),
          port: Number(form.port),
          secure: form.secure,
          email: form.email.trim(),
          password: form.password,
        }),
      });

      let data = null;
      let text = null;

      try {
        text = await response.text();
        data = JSON.parse(text);
      } catch (jsonErr) {
        console.error("Response is not valid JSON:", text, jsonErr);
      }

      console.log("Response status:", response.status);
      console.log("Response body:", text);

      if (response.ok) {
        setMessage({ type: "success", text: data?.message || "SMTP configuration saved successfully." });

        // Redirect to home page after a short delay (1.5 seconds)
        setTimeout(() => {
          navigate("/");
        }, 1500);

      } else {
        setMessage({
          type: "error",
          text: data?.message || `Failed to save SMTP config. Status: ${response.status}`,
        });
        console.error("SMTP Setup error:", data?.message || `Status ${response.status}`);
      }
    } catch (err) {
      setMessage({ type: "error", text: "Network error. Please try again." });
      console.error("Network error during SMTP setup:", err);
    }

    setLoading(false);
  };

  if (isLoggedIn === null) {
    return (
      <div className="max-w-lg mx-auto p-6 mt-10 bg-white rounded-xl shadow-md text-center">
        Checking login status...
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="max-w-lg mx-auto p-6 mt-10 bg-white rounded-xl shadow-md text-center text-red-600">
        You must be logged in to access SMTP Setup.
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-6 mt-10 bg-white rounded-xl shadow-md">
      <h1 className="text-2xl font-semibold mb-6 text-center">SMTP Setup</h1>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div>
          <label htmlFor="host" className="block mb-1 font-medium text-gray-700">
            SMTP Host <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="host"
            name="host"
            value={form.host}
            onChange={handleChange}
            placeholder="smtp.gmail.com"
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <div>
          <label htmlFor="port" className="block mb-1 font-medium text-gray-700">
            SMTP Port <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="port"
            name="port"
            value={form.port}
            onChange={handleChange}
            placeholder="465"
            required
            min={1}
            max={65535}
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="secure"
            name="secure"
            checked={form.secure}
            onChange={handleChange}
            className="w-5 h-5"
          />
          <label htmlFor="secure" className="font-medium text-gray-700 select-none">
            Use SSL (Secure Connection)
          </label>
        </div>

        <div>
          <label htmlFor="email" className="block mb-1 font-medium text-gray-700">
            Email Address <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="your-email@example.com"
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <div>
          <label htmlFor="password" className="block mb-1 font-medium text-gray-700">
            Password / App Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
            autoComplete="current-password"
          />
        </div>

        {message && (
          <p
            className={`text-center mt-2 font-semibold ${
              message.type === "success" ? "text-green-600" : "text-red-600"
            }`}
            role="alert"
          >
            {message.text}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-3 rounded-md hover:bg-indigo-700 transition disabled:opacity-60"
        >
          {loading ? "Saving..." : "Save & Test SMTP"}
        </button>
      </form>
    </div>
  );
}
