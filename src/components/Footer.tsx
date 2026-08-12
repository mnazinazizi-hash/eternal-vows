"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Footer() {
  const router = useRouter();

  const [showAdminLogin, setShowAdminLogin] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Prevent the page behind the modal from scrolling.
  useEffect(() => {
    if (!showAdminLogin) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [showAdminLogin]);

  const openAdminLogin = () => {
    setError("");
    setEmail("");
    setPassword("");
    setShowPassword(false);
    setShowAdminLogin(true);
  };

  const closeAdminLogin = () => {
    setShowAdminLogin(false);
    setError("");
  };

  const handleAdminLogin = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError("");

    if (!email.trim() || !password.trim()) {
      setError(
        "Please enter your admin email and password."
      );
      return;
    }

    try {
      setLoading(true);

      /*
       * FRONTEND DEMO ONLY
       *
       * We will replace this with real authentication later.
       */

      await new Promise((resolve) =>
        setTimeout(resolve, 700)
      );

      if (
        email === "admin@example.com" &&
        password === "admin123"
      ) {
        setShowAdminLogin(false);
        router.push("/admin");
        return;
      }

      setError(
        "Invalid admin credentials. This area is restricted to authorized administrators."
      );
    } catch (error) {
      console.error(error);
      setError(
        "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* =========================================================
          FOOTER
      ========================================================= */}
      <footer className="bg-surface-container-low border-t border-outline-variant/15">
        <div className="max-w-6xl mx-auto px-container-padding py-12">
          <div className="text-center">

            {/* Wedding name */}
            <h2 className="font-headline-sm text-primary">
              Elena &amp; Marcus
            </h2>

            {/* Admin login trigger */}
            <div className="mt-5">
              <button
                type="button"
                onClick={openAdminLogin}
                className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-surface px-5 py-2.5 text-primary font-label-caps text-label-caps hover:bg-primary hover:text-on-primary transition-all duration-300"
              >
                <span className="material-symbols-outlined text-base">
                  admin_panel_settings
                </span>

                Admin Login
              </button>
            </div>

            {/* Closing message */}
            <div className="mt-8 pt-6 border-t border-outline-variant/15">
              <p className="font-body-sm text-on-surface-variant">
                With love, Elena &amp; Marcus
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* =========================================================
          FLOATING ADMIN LOGIN MODAL
      ========================================================= */}
      {showAdminLogin && (
        <div
          className="fixed inset-0 z-[999] flex items-center justify-center p-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-login-title"
        >
          {/* Blurred background */}
          <div
            className="absolute inset-0 bg-black/25 backdrop-blur-md"
            onClick={closeAdminLogin}
          />

          {/* Floating login card */}
          <div className="relative z-10 w-full max-w-md">
            <div className="rounded-[28px] bg-surface/95 backdrop-blur-xl border border-white/70 shadow-[0_25px_80px_rgba(0,0,0,0.25)] p-6 md:p-8">

              {/* Close */}
              <button
                type="button"
                onClick={closeAdminLogin}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:text-primary transition"
                aria-label="Close admin login"
              >
                <span className="material-symbols-outlined text-lg">
                  close
                </span>
              </button>

              {/* =================================================
                  HEADER
              ================================================= */}
              <div className="flex items-center gap-4 mb-7 pr-8">

                <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-2xl">
                    admin_panel_settings
                  </span>
                </div>

                <div>
                  <p
                    id="admin-login-title"
                    className="font-label-caps text-label-caps text-secondary"
                  >
                    ADMIN LOGIN ONLY
                  </p>

                  <p className="font-body-md text-on-surface-variant">
                    Wedding management access
                  </p>
                </div>
              </div>

              {/* =================================================
                  FORM
              ================================================= */}
              <form
                onSubmit={handleAdminLogin}
                className="space-y-5"
              >

                {/* Email */}
                <div>
                  <label
                    htmlFor="admin-email"
                    className="block font-body-sm text-on-surface-variant mb-2"
                  >
                    Admin Email
                  </label>

                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
                      mail
                    </span>

                    <input
                      id="admin-email"
                      type="email"
                      value={email}
                      onChange={(e) =>
                        setEmail(e.target.value)
                      }
                      placeholder="Enter your admin email"
                      autoComplete="email"
                      required
                      className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest pl-12 pr-4 py-3.5 font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="admin-password"
                    className="block font-body-sm text-on-surface-variant mb-2"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
                      lock
                    </span>

                    <input
                      id="admin-password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                      className="w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest pl-12 pr-12 py-3.5 font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (current) => !current
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      <span className="material-symbols-outlined text-lg">
                        {showPassword
                          ? "visibility_off"
                          : "visibility"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="rounded-xl bg-red-50 border border-red-100 px-4 py-3">
                    <p className="font-body-sm text-red-700">
                      {error}
                    </p>
                  </div>
                )}

                {/* Admin login */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-on-primary font-label-caps text-label-caps py-3.5 rounded-full hover:brightness-110 transition-all duration-300 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <span className="material-symbols-outlined text-lg animate-spin">
                        progress_activity
                      </span>

                      Signing in...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-lg">
                        login
                      </span>

                      Admin Login
                    </>
                  )}
                </button>

                {/* Security message */}
                <div className="pt-4 border-t border-outline-variant/15">
                  <div className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-tertiary text-lg">
                      verified_user
                    </span>

                    <p className="font-body-sm text-on-surface-variant leading-relaxed">
                      Authorized administrators only
                    </p>
                  </div>
                </div>

                {/* Back to wedding */}
                <button
                  type="button"
                  onClick={closeAdminLogin}
                  className="w-full text-center font-body-sm text-primary hover:underline pt-1"
                >
                  ← Back
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}