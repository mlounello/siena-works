import { useState } from "react";
import supabase from "../supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ email });
    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      alert("Check your email for the login link!");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-siena-darkGreen text-siena-white">
      <form
        onSubmit={handleLogin}
        className="bg-white text-siena-darkGreen p-8 rounded-lg shadow-md w-96"
      >
        <h1 className="text-2xl font-serif mb-4 text-center text-siena-green">
          Sign in to SienaWorks
        </h1>
        <input
          type="email"
          required
          placeholder="Your Siena email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-300 p-2 rounded w-full mb-4"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-siena-gold text-siena-darkGreen py-2 rounded font-semibold hover:bg-siena-green hover:text-siena-gold transition"
        >
          {loading ? "Sending link..." : "Send magic link"}
        </button>
      </form>
    </div>
  );
}