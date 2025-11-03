import { useState } from "react";
import supabase from "../supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("magic"); // "magic", "password", or "signup"
  const [loading, setLoading] = useState(false);

  const handleMagicLink = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    setLoading(false);
    if (error) alert(error.message);
    else alert("Check your email for the login link!");
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) alert(error.message);
    else window.location.href = "/";
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/` },
    });
    setLoading(false);
    if (error) alert(error.message);
    else alert("Check your email to confirm your new account!");
  };

  const handleGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/` },
    });
    if (error) alert(error.message);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-siena-darkGreen text-siena-white">
      <form
        onSubmit={
          mode === "magic"
            ? handleMagicLink
            : mode === "password"
            ? handlePasswordLogin
            : handleSignUp
        }
        className="bg-white text-siena-darkGreen p-8 rounded-lg shadow-md w-96"
      >
        <h1 className="text-2xl font-serif mb-4 text-center text-siena-green">
          {mode === "signup" ? "Create a SienaWorks Account" : "Sign in to SienaWorks"}
        </h1>

        <input
          type="email"
          required
          placeholder="Your Siena email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-gray-300 p-2 rounded w-full mb-4"
        />

        {(mode === "password" || mode === "signup") && (
          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 p-2 rounded w-full mb-4"
          />
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-siena-gold text-siena-darkGreen py-2 rounded font-semibold hover:bg-siena-green hover:text-siena-gold transition"
        >
          {loading
            ? "Loading..."
            : mode === "magic"
            ? "Send Magic Link"
            : mode === "password"
            ? "Sign In"
            : "Sign Up"}
        </button>

        <div className="flex flex-col gap-2 mt-4 text-center text-sm">
          {mode !== "magic" && (
            <button
              type="button"
              onClick={() => setMode("magic")}
              className="text-siena-green hover:underline"
            >
              Use Magic Link Instead
            </button>
          )}
          {mode === "magic" && (
            <button
              type="button"
              onClick={() => setMode("password")}
              className="text-siena-green hover:underline"
            >
              Sign In with Password
            </button>
          )}
          {mode !== "signup" && (
            <button
              type="button"
              onClick={() => setMode("signup")}
              className="text-siena-green hover:underline"
            >
              Create Account
            </button>
          )}
          {mode === "signup" && (
            <button
              type="button"
              onClick={() => setMode("password")}
              className="text-siena-green hover:underline"
            >
              Back to Sign In
            </button>
          )}
        </div>

        <hr className="my-4 border-gray-300" />

        <button
          type="button"
          onClick={handleGoogle}
          className="w-full border border-gray-300 py-2 rounded hover:bg-gray-100 transition"
        >
          Continue with Google
        </button>
      </form>
    </div>
  );
}