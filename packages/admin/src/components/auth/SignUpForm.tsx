import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { EyeOff, Eye } from "lucide-react";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import PhoneCountryInput from "../common/PhoneCountryInput";
import LegalModal from "../legal/LegalModal";
import { useAuth } from "../../context/AuthContext";
import { TERMS_OF_SERVICE, PRIVACY_POLICY } from "@thaiakha/shared/data";

export default function SignUpForm() {
  const { signUpAgency } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [legalModalOpen, setLegalModalOpen] = useState<'terms' | 'privacy' | null>(null);

  // Agency Fields
  const [contactName, setContactName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [taxId, setTaxId] = useState("");
  const [phone, setPhone] = useState("");
  const [lineId, setLineId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate all fields are filled
    if (!contactName.trim()) {
      setError("Contact Name is required");
      return;
    }
    if (!companyName.trim()) {
      setError("Company Name is required");
      return;
    }
    if (!taxId.trim()) {
      setError("Tax ID / VAT is required");
      return;
    }
    if (!phone.trim()) {
      setError("Phone Number is required");
      return;
    }
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (!password.trim()) {
      setError("Password is required");
      return;
    }
    if (!isChecked) {
      setError("Please accept the Terms and Conditions");
      return;
    }

    setLoading(true);

    try {
      await signUpAgency(email, password, contactName, companyName, taxId, phone);
      navigate("/"); // Redirect or show success message
    } catch (err: any) {
      console.error("Signup failed:", err);
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full overflow-y-auto lg:w-1/2 no-scrollbar">
      <div className="flex flex-col justify-center flex-1 w-full max-w-lg mx-auto">
        <div className="glass-card p-6 sm:p-10 rounded-3xl border border-white/20 dark:border-white/10 shadow-cherry">
          <div className="mb-8 sm:mb-10">
            <h1 className="mb-2 font-black text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md uppercase tracking-tight">
              Create New Account
            </h1>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Join the B2B portal for Thai Akha Kitchen.
            </p>
          </div>
          <div>
            <form onSubmit={handleSubmit}>
              <div className="space-y-5">
                {/* <!-- Company Name --> */}
                <div className="mb-5">
                  <Label htmlFor="companyName">
                    Company Name<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    id="companyName"
                    name="companyName"
                    autoComplete="organization"
                    placeholder="Enter Agency Name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>

                {/* <!-- Contact Name --> */}
                <div className="mb-5">
                  <Label htmlFor="contactName">
                    Contact Name<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    id="contactName"
                    name="contactName"
                    autoComplete="name"
                    placeholder="Enter Your Name"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                  />
                </div>

                {/* <!-- Tax ID --> */}
                <div className="mb-5">
                  <Label htmlFor="taxId">
                    Tax ID / VAT<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    id="taxId"
                    name="taxId"
                    autoComplete="off"
                    placeholder="Tax ID Number"
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                  />
                </div>

                {/* <!-- Email --> */}
                <div className="mb-5">
                  <Label htmlFor="email">
                    Email<span className="text-error-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    id="email"
                    name="email"
                    autoComplete="email"
                    placeholder="agency@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                {/* <!-- Password --> */}
                <div className="mb-5">
                  <Label htmlFor="password">
                    Password<span className="text-error-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      autoComplete="new-password"
                      placeholder="Enter your password"
                      type={showPassword ? "text" : "password"}
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

                {/* <!-- Phone Number & Line ID --> */}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {/* <!-- Phone --> */}
                  <div className="sm:col-span-1">
                    <Label htmlFor="phone">
                      Phone Number<span className="text-error-500">*</span>
                    </Label>
                    <PhoneCountryInput
                      value={phone}
                      onChange={setPhone}
                    />
                  </div>
                  {/* <!-- Line ID --> */}
                  <div className="sm:col-span-1">
                    <Label htmlFor="lineId">
                      Line ID
                    </Label>
                    <Input
                      type="text"
                      id="lineId"
                      name="lineId"
                      autoComplete="off"
                      placeholder="Enter Line ID"
                      value={lineId}
                      onChange={(e) => setLineId(e.target.value)}
                    />
                  </div>
                </div>
                {error && <p className="text-sm text-error-500 font-bold bg-error-50 dark:bg-error-500/10 p-3 rounded-lg border border-error-100 dark:border-error-500/20">{error}</p>}
                {/* <!-- Checkbox --> */}
                <div className="flex items-center gap-3">
                  <Checkbox
                    className="w-5 h-5"
                    checked={isChecked}
                    onChange={setIsChecked}
                  />
                  <p className="inline-block text-xs font-medium text-gray-500 dark:text-gray-400 leading-tight">
                    By creating an account means you agree to the{" "}
                    <button
                      type="button"
                      onClick={() => setLegalModalOpen('terms')}
                      className="text-gray-800 dark:text-white/90 font-bold underline underline-offset-2 hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
                    >
                      Terms and Conditions
                    </button>
                    {", and our "}
                    <button
                      type="button"
                      onClick={() => setLegalModalOpen('privacy')}
                      className="text-gray-800 dark:text-white font-bold underline underline-offset-2 hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
                    >
                      Privacy Policy
                    </button>
                  </p>
                </div>
                {/* <!-- Button --> */}
                <div className="pt-2">
                  <button className="cherry-btn-animation flex items-center justify-center w-full px-4 py-4 text-sm font-black uppercase text-white rounded-2xl bg-brand-500 shadow-cherry hover:bg-brand-600 tracking-wider" disabled={loading}>
                    {loading ? "Registering Agency..." : "Create Partner Account"}
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-6 border-t border-gray-100 dark:border-white/5 pt-6 text-center">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Already have an account? {""}
                <Link
                  to="/signin"
                  className="text-brand-500 hover:text-brand-600 dark:text-brand-400 font-bold underline underline-offset-4"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>

        <LegalModal
          document={
            legalModalOpen === 'terms'
              ? TERMS_OF_SERVICE
              : legalModalOpen === 'privacy'
                ? PRIVACY_POLICY
                : null
          }
          isOpen={legalModalOpen !== null}
          onClose={() => setLegalModalOpen(null)}
        />
      </div>
    </div>
  );
}
