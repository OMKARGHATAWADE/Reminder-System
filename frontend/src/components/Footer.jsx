// src/components/Footer.jsx
export default function Footer() {
  return (
    <footer className="bg-gray-100 py-4 text-center mt-10">
      <p className="text-gray-600 text-sm">
        © {new Date().getFullYear()} InvoiceReminder. All rights reserved.
      </p>
    </footer>
  );
}
