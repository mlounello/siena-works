import supabase from "../supabaseClient";

export default function LogoutButton() {
  const logout = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <button
      onClick={logout}
      className="mt-4 bg-siena-gold text-siena-darkGreen px-3 py-1 rounded hover:bg-siena-green hover:text-siena-gold transition text-xs font-medium"
    >
      Logout
    </button>
  );
}