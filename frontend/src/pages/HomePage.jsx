// src/pages/HomePage.jsx
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaFileInvoice, FaUsers } from "react-icons/fa";

export default function HomePage() {
  const navigate = useNavigate();

  const cards = [
    {
      title: "SMTP Setup",
      icon: <FaEnvelope size={28} />,
      path: "/smtp",
      color: "from-indigo-400 to-indigo-600",
    },
    {
      title: "Invoice Generation",
      icon: <FaFileInvoice size={28} />,
      path: "/invoice-setup", // updated here
      color: "from-emerald-400 to-emerald-600",
    },
    {
      title: "Client Dashboard",
      icon: <FaUsers size={28} />,
      path: "/clients",
      color: "from-pink-400 to-pink-600",
    },
  ];

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-gray-50 px-4 pt-10">
      <h1 className="text-gray-700 font-semibold text-xl md:text-2xl text-center mb-3">
        Welcome to Invoice Reminder System
      </h1>

      <div className="relative text-center mb-12">
        <span
          className="absolute inset-0 rounded-xl"
          style={{
            background:
              "radial-gradient(circle at center, rgba(56,189,248,0.5), transparent 70%)",
            filter: "blur(60px)",
            zIndex: -1,
          }}
          aria-hidden="true"
        />
        <h2 className="relative text-black font-extrabold text-[4rem] md:text-[6rem] leading-tight whitespace-pre-line">
          Automate your{"\n"}Reminders
        </h2>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 pb-16 w-full max-w-7xl">
        {cards.map(({ title, icon, path, color }) => (
          <Card
            key={title}
            title={title}
            icon={icon}
            onClick={() => navigate(path)}
            color={color}
          />
        ))}
      </section>
    </div>
  );
}

function Card({ title, icon, onClick, color }) {
  return (
    <div
      onClick={onClick}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      className={`w-72 sm:w-80 h-44 bg-gradient-to-br ${color}
                 rounded-xl shadow-md flex flex-col items-center justify-center
                 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300
                 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500`}
    >
      <div className="mb-2 text-white">{icon}</div>
      <h2 className="text-xl font-semibold text-white text-center">{title}</h2>
    </div>
  );
}
