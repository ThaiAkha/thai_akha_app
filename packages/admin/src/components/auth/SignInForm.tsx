import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { EyeOff, Eye } from "lucide-react";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import { useAuth } from "../../context/AuthContext";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await signIn(email, password);
      if (response?.user) {
        // We refetch/wait for profile in AuthContext, but here we can do a quick check
        // for a better UX if we want, or just wait for the context to update.
        // For now, let's keep it simple: if the user is an agency, they probably want the dashboard.
        // However, we don't know the role yet.
        // Let's use a small delay or a more robust way to check.

        // Better: navigate to "/" and let a logic in "/" or App.tsx handle it, or 
        // fetch individual profile here.
        navigate("/");
      }
    } catch (err: any) {
      console.error("Login failed:", err);
      setError(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar">
      <div className="flex flex-col justify-center flex-1 w-full max-w-lg mx-auto">
        <div className="glass-card p-6 sm:p-10 rounded-3xl border border-white/20 dark:border-white/10 shadow-brand">
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-black text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md uppercase tracking-tight">
              Sign In
            </h1>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Enter your email and password to sign in!
            </p>
          </div>

          <div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-5">
                <div>
                  <Label htmlFor="email">
                    Email<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    autoComplete="email"
                    placeholder="info@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="password">
                    Password<span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      autoComplete="current-password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <Eye className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeOff className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-error-500 font-bold bg-error-50 dark:bg-error-500/10 p-3 rounded-lg border border-error-100 dark:border-error-500/20">
                    {error}
                  </p>
                )}

                <div className="text-right">
                  <Link
                    to="/reset-password"
                    className="text-xs text-brand-500 hover:text-brand-600 dark:text-brand-400"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="brand-btn-animation flex items-center justify-center w-full px-4 py-4 text-sm font-black uppercase text-white rounded-2xl bg-brand-500 shadow-brand hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed tracking-wider"
                    disabled={loading}
                  >
                    {loading ? "Signing in..." : "Sign In"}
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-6 border-t border-gray-100 dark:border-white/5 pt-6 text-center">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Don&apos;t have an account? {""}
                <Link
                  to="/signup"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400 font-bold underline underline-offset-4"
                >
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}