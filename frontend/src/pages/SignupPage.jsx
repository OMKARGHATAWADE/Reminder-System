import { useForm } from "react-hook-form";
import { signup } from "../api/auth";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function SignupPage() {
  const { register, handleSubmit, reset } = useForm();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    console.log("Form submitted with data:", data); // DEBUG log

    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    try {
      const response = await signup({
        name: data.name,
        email: data.email,
        password: data.password,
      });

      console.log("Signup success response:", response); // DEBUG log
      toast.success("Signup successful! Redirecting to login...");
      reset();
      navigate("/login");
    } catch (error) {
      // More robust error handling
      console.error("Signup error:", error);

      if (error.response) {
        // Server responded with status code out of 2xx range
        toast.error(error.response.data?.message || "Signup failed. Please try again.");
      } else if (error.request) {
        // Request was made but no response received
        toast.error("No response from server. Please check your network.");
      } else {
        // Something else caused the error
        toast.error("Error: " + error.message);
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 rounded shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-semibold mb-4 text-center">Signup</h2>
        <input
          {...register("name")}
          type="text"
          placeholder="Full Name"
          className="w-full mb-3 p-2 border rounded"
          required
        />
        <input
          {...register("email")}
          type="email"
          placeholder="Email"
          className="w-full mb-3 p-2 border rounded"
          required
        />
        <input
          {...register("password")}
          type="password"
          placeholder="Password"
          className="w-full mb-3 p-2 border rounded"
          required
        />
        <input
          {...register("confirmPassword")}
          type="password"
          placeholder="Confirm Password"
          className="w-full mb-4 p-2 border rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
        >
          Signup
        </button>
      </form>
    </div>
  );
}
