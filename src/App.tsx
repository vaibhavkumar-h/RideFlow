
import { useEffect, useState, type FormEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, CarFront, ChevronDown,
  Database, Menu, Route, ShieldCheck, Sparkles, X, Zap, Phone,
  UserRound, Eye, EyeOff, CheckCircle2, LoaderCircle
} from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import {
  BrowserRouter, Routes, Route as RouterRoute, Link,
  useNavigate
} from "react-router-dom";

import { AdsaPage, DbmsPage } from "./pages/StudyPages";
import BookingPage from "./pages/BookingPage";

// ======================================================
// CONFIGURATION
// ======================================================

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : null;

type AccountRole = "rider" | "driver";

type HeaderProps = {
  user: any;
  role: AccountRole | null;
  onLogout: () => void;
};

const MotionLink = motion(Link);

const navItems = [
  { label: "Ride", href: "#ride" },
  { label: "Drive", href: "#drive" },
  { label: "Travel", href: "#travel" },
  { label: "Business", href: "#business" },
];

const rise = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.12 },
  },
};

// ======================================================
// BRAND
// ======================================================

function Brand() {
  return (
    <Link className="brand" to="/" aria-label="RideFlow home">
      <span className="brand-mark" aria-hidden="true">
        <span className="brand-mark-core" />
        <span className="brand-mark-orbit orbit-one" />
        <span className="brand-mark-orbit orbit-two" />
      </span>
      <span className="brand-name">
        rideflow<span>.</span>
      </span>
    </Link>
  );
}

// ======================================================
// HEADER - AUTHENTICATED PROFILE MENU
// ======================================================

function Header({ user, role, onLogout }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setProfileOpen(false);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const name =
    user?.user_metadata?.full_name ||
    user?.phone ||
    "My Account";

  return (
    <header className="site-header">
      <Brand />

      <nav className="desktop-nav" aria-label="Main navigation">
        {navItems.map((item) => (
          <a href={item.href} key={item.label}>
            {item.label}
          </a>
        ))}
        <a className="nav-about" href="#about">
          About <ChevronDown size={14} />
        </a>
      </nav>

      <div className="header-actions">
        {user ? (
          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((v) => !v)}
              className="flex items-center gap-2 rounded-full border border-white/15 px-4 py-2 text-sm font-medium"
            >
              {role === "driver" ? (
                <CarFront size={18} />
              ) : (
                <UserRound size={18} />
              )}
              <span className="max-w-32 truncate">{name}</span>
              <ChevronDown size={15} />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-full z-50 mt-3 w-56 rounded-2xl border border-white/10 bg-[#111] p-2 shadow-2xl">
                <div className="border-b border-white/10 px-3 py-3">
                  <p className="truncate text-sm font-semibold text-white">
                    {name}
                  </p>
                  <p className="mt-1 text-xs capitalize text-white/40">
                    {role || "Account"} account
                  </p>
                </div>

                <Link
                  to="/profile"
                  onClick={() => setProfileOpen(false)}
                  className="block rounded-lg px-3 py-3 text-sm text-white/70 hover:bg-white/10 hover:text-white"
                >
                  My Profile
                </Link>

                <Link
                  to={role === "driver" ? "/driver" : "/book"}
                  onClick={() => setProfileOpen(false)}
                  className="block rounded-lg px-3 py-3 text-sm text-white/70 hover:bg-white/10 hover:text-white"
                >
                  {role === "driver" ? "Driver Dashboard" : "My Rides"}
                </Link>

                <button
                  type="button"
                  onClick={onLogout}
                  className="w-full rounded-lg px-3 py-3 text-left text-sm text-rose-400 hover:bg-white/10"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link className="login-link" to="/login">
              Log in
            </Link>
            <Link className="button button-outline header-cta" to="/signup">
              Sign up <ArrowUpRight size={16} />
            </Link>
          </>
        )}
      </div>

      <button
        className="mobile-menu-button"
        type="button"
        aria-label={open ? "Close navigation" : "Open navigation"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X size={21} /> : <Menu size={21} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.nav
            className="mobile-nav"
            aria-label="Mobile navigation"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
          >
            {[...navItems, { label: "About", href: "#about" }].map((item) => (
              <a
                href={item.href}
                key={item.label}
                onClick={() => setOpen(false)}
              >
                {item.label}
                <ArrowUpRight size={15} />
              </a>
            ))}

            {user ? (
              <>
                <Link
                  className="mobile-nav-cta"
                  to="/profile"
                  onClick={() => setOpen(false)}
                >
                  My Profile
                </Link>
                <button
                  className="mobile-nav-cta"
                  onClick={() => {
                    setOpen(false);
                    onLogout();
                  }}
                >
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  className="mobile-nav-cta"
                  to="/login"
                  onClick={() => setOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  className="mobile-nav-cta"
                  to="/signup"
                  onClick={() => setOpen(false)}
                >
                  Sign up <ArrowRight size={16} />
                </Link>
              </>
            )}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

// ======================================================
// HOMEPAGE ARTWORK
// ======================================================

function IntelligenceArtwork() {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className="artwork-wrap"
      aria-label="Abstract animated route network visualization"
    >
      <div className="artwork-glow glow-violet" />
      <div className="artwork-glow glow-teal" />

      <video
        className="artwork-video"
        autoPlay={!reduceMotion}
        muted
        loop={!reduceMotion}
        playsInline
        preload="metadata"
        poster="https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/782a4a52-4c1e-4471-bb0c-aa232927f4a6.webp"
        aria-hidden="true"
      >
        <source
          src="https://d2ol7oe51mr4n9.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/435a4fe7-e43b-4e7c-af78-0be083e73569.mp4"
          type="video/mp4"
        />
      </video>

      <div className="artwork-vignette" />
      <div className="artwork-grid-overlay" />

      <motion.div
        className="route-orbit orbit-a"
        animate={reduceMotion ? { rotate: 0 } : { rotate: 360 }}
        transition={{
          duration: reduceMotion ? 0 : 42,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <span />
      </motion.div>

      <motion.div
        className="route-orbit orbit-b"
        animate={reduceMotion ? { rotate: 0 } : { rotate: -360 }}
        transition={{
          duration: reduceMotion ? 0 : 58,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <span />
      </motion.div>

      <div className="artwork-caption">
        <span className="caption-pulse" />
        DIJKSTRA ROUTE ENGINE
      </div>

      <div className="artwork-coordinate">
        30° 42' N&nbsp;&nbsp; 76° 43' E
      </div>
    </div>
  );
}

// ======================================================
// HERO
// ======================================================

function Hero() {
  const reduceMotion = useReducedMotion();

  const motionProps = reduceMotion
    ? {}
    : {
        initial: "hidden" as const,
        animate: "visible" as const,
        variants: stagger,
      };

  return (
    <main className="hero-shell" id="ride">
      <div className="hero-grid" aria-hidden="true" />
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />

      <motion.section className="hero-copy" {...motionProps}>
        <motion.div className="eyebrow" variants={rise}>
          <span className="eyebrow-icon">
            <Sparkles size={13} />
          </span>
          INTELLIGENCE IN EVERY JOURNEY
          <span className="eyebrow-line" />
        </motion.div>

        <motion.h1 variants={rise}>
          Move smarter.
          <br />
          <span className="headline-muted">Go further.</span>
          <br />
          <span className="headline-accent">Flow better.</span>
        </motion.h1>

        <motion.p className="hero-description" variants={rise}>
          A connected mobility platform that brings people, drivers and
          intelligent route technology together — one seamless journey at a
          time.
        </motion.p>

        <motion.div className="hero-actions" variants={rise}>
          <Link className="button button-primary" to="/book">
            Start your journey <ArrowUpRight size={17} />
          </Link>

          <a className="button button-quiet" href="#how-it-works">
            Explore RideFlow
            <span className="quiet-icon">
              <ArrowDownRight size={16} />
            </span>
          </a>
        </motion.div>

        <motion.div className="hero-proof" variants={rise}>
          <div className="proof-item">
            <span className="proof-number">
              2.1<span>M</span>
            </span>
            <span className="proof-label">routes mapped</span>
          </div>
          <span className="proof-divider" />
          <div className="proof-item">
            <span className="proof-number">
              400<span>+</span>
            </span>
            <span className="proof-label">connected zones</span>
          </div>
          <span className="proof-divider" />
          <div className="proof-item">
            <span className="proof-number">
              99.9<span>%</span>
            </span>
            <span className="proof-label">platform uptime</span>
          </div>
        </motion.div>
      </motion.section>

      <motion.section
        className="hero-visual"
        initial={reduceMotion ? false : { opacity: 0, scale: 0.96, x: 24 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{
          duration: 1.1,
          delay: 0.25,
          ease: [0.22, 1, 0.36, 1],
        }}
        aria-label="RideFlow route intelligence"
      >
        <IntelligenceArtwork />

        <MotionLink
          to="/adsa"
          className="floating-card card-top"
          variants={rise}
          initial={reduceMotion ? false : "hidden"}
          animate="visible"
          whileHover={{ y: -5, scale: 1.015 }}
          whileTap={{ scale: 0.985 }}
          transition={{ delay: 0.8, duration: 0.7 }}
          aria-label="Explore ADSA and Dijkstra algorithm"
        >
          <div className="floating-icon">
            <Route size={22} />
          </div>
          <div>
            <p className="floating-kicker">ADSA · DIJKSTRA</p>
            <h3>Shortest-path routing.</h3>
            <p className="floating-sub">Weighted graphs. Optimal paths.</p>
          </div>
          <span className="floating-status">
            <span /> ACTIVE
          </span>
        </MotionLink>

        <MotionLink
          to="/dbms"
          className="floating-card card-bottom"
          variants={rise}
          initial={reduceMotion ? false : "hidden"}
          animate="visible"
          whileHover={{ y: -5, scale: 1.015 }}
          whileTap={{ scale: 0.985 }}
          transition={{ delay: 1.05, duration: 0.7 }}
          aria-label="Explore RideFlow DBMS concepts"
        >
          <div className="floating-icon violet-icon">
            <Database size={22} />
          </div>
          <div>
            <p className="floating-kicker">DBMS</p>
            <h3>Intelligent data systems.</h3>
            <p className="floating-sub">Transactions. Consistency. Scale.</p>
          </div>
          <span className="card-arrow">
            <ArrowUpRight size={17} />
          </span>
        </MotionLink>
      </motion.section>

      <div className="hero-bottom">
        <div className="bottom-note">
          <span className="bottom-note-dot" />
          BUILT FOR THE WAY INDIA MOVES
        </div>
        <a href="#how-it-works" className="scroll-link">
          Scroll to explore
          <span>
            <ArrowDownRight size={15} />
          </span>
        </a>
      </div>
    </main>
  );
}

// ======================================================
// BRAND STRIP
// ======================================================

function BrandStrip() {
  return (
    <section className="brand-strip" aria-label="RideFlow platform capabilities">
      <span className="strip-label">ONE PLATFORM, MANY POSSIBILITIES</span>
      <div className="strip-items">
        <span><CarFront size={17} /> Passenger-first</span>
        <span><Route size={17} /> Route intelligence</span>
        <span><ShieldCheck size={17} /> Trusted network</span>
        <span><Zap size={17} /> Real-time mobility</span>
      </div>
    </section>
  );
}

function HomePage(props: HeaderProps) {
  return (
    <div className="app">
      <Header {...props} />
      <Hero />
      <BrandStrip />
    </div>
  );
}

// ======================================================
// AUTH INPUT
// ======================================================

function AuthInput({
  label,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block space-y-2 text-sm font-medium text-white">
      {label}
      <div className="flex h-12 items-center gap-3 rounded-xl bg-[#1A1A1A] px-4 focus-within:ring-2 focus-within:ring-white/20">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-full min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/25"
        />
      </div>
    </label>
  );
}

// ======================================================
// AUTH PAGE - EMBEDDED IN THIS FILE
// ======================================================

function AuthPage({ signup }: { signup: boolean }) {
  const navigate = useNavigate();

  const [role, setRole] = useState<AccountRole>("rider");
  const [step, setStep] = useState<"details" | "otp" | "success">("details");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  const [license, setLicense] = useState("");
  const [vehicleType, setVehicleType] = useState("Bike");
  const [registration, setRegistration] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [color, setColor] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showOtp, setShowOtp] = useState(false);

  const fullPhone = `+91${phone}`;
  const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

  const inputClass =
    "h-12 w-full rounded-xl border border-white/10 bg-[#1A1A1A] px-4 text-sm text-white outline-none placeholder:text-white/25 focus:border-white/40 focus:ring-2 focus:ring-white/10";

  const sendOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!supabase) {
      setError("Supabase configuration missing. Check frontend .env.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(phone)) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (signup && (!firstName.trim() || !lastName.trim())) {
      setError("Please enter your first and last name.");
      return;
    }

    if (
      signup &&
      role === "driver" &&
      (!license.trim() || !registration.trim() ||
        !make.trim() || !model.trim() || !color.trim())
    ) {
      setError("Please complete all driver and vehicle details.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: fullPhone,
        options: {
          shouldCreateUser: signup,
          ...(signup
            ? {
                data: {
                  full_name: fullName,
                  role,
                  ...(role === "driver"
                    ? {
                        license_number: license.trim(),
                        vehicle_type: vehicleType,
                        registration_number: registration.trim(),
                        vehicle_make: make.trim(),
                        vehicle_model: model.trim(),
                        vehicle_color: color.trim(),
                      }
                    : {}),
                },
              }
            : {}),
        },
      });

      if (error) throw error;

      setStep("otp");
      setError(`OTP sent to ${fullPhone}. Enter your verification code.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    if (!supabase) {
      setError("Supabase configuration missing.");
      return;
    }

    if (!/^\d{6}$/.test(otp)) {
      setError("Enter your 6-digit OTP.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: fullPhone,
        token: otp,
        type: "sms",
      });

      if (error) throw error;

      if (!data.user || !data.session) {
        throw new Error("Unable to retrieve your authenticated session.");
      }

      const registeredRole = data.user.user_metadata?.role;

      if (registeredRole && registeredRole !== role) {
        await supabase.auth.signOut();
        throw new Error(
          `This number belongs to a ${registeredRole} account. Select the correct account type.`
        );
      }

      const profileResponse = await fetch(`${API_URL}/api/auth/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.session.access_token}`,
        },
        body: JSON.stringify({
          role,
          signup,
          fullName,
          license,
          vehicleType,
          registration,
          make,
          model,
          color,
        }),
      });

      const result = await profileResponse.json();

      if (!profileResponse.ok || !result.success) {
        throw new Error(result.message || "Unable to save your profile.");
      }

      setError("Phone verified and RideFlow profile saved successfully.");
      setStep("success");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "OTP verification failed."
      );
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (!supabase) return;

    setLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: fullPhone,
        options: { shouldCreateUser: signup },
      });

      if (error) throw error;
      setError("A new OTP has been sent.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen w-full bg-black p-2 text-white selection:bg-white/30 lg:min-h-screen lg:p-4">
      {/* LEFT VIDEO PANEL */}
      <section className="relative hidden min-h-[calc(100vh-2rem)] w-[52%] flex-col justify-end overflow-hidden rounded-3xl px-12 pb-32 shadow-2xl lg:flex">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260506_081238_406ed0e3-5d83-436e-a512-0bbff7ec5b95.mp4"
            type="video/mp4"
          />
        </video>

        <motion.div
          className="z-10 w-full max-w-xs space-y-8"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.15, delayChildren: 0.2 },
            },
          }}
        >
          <motion.div
            variants={rise}
            className="flex items-center gap-2"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-xl font-bold">
              R
            </span>
            <span className="text-xl font-semibold tracking-tight">
              rideflow<span className="text-teal-300">.</span>
            </span>
          </motion.div>

          <motion.div variants={rise} className="space-y-3">
            <h1 className="text-4xl font-medium tracking-tight">
              {signup ? "Join RideFlow" : "Welcome back"}
            </h1>
            <p className="px-1 text-sm leading-relaxed text-white/70">
              {signup
                ? "Follow these quick steps to activate your RideFlow account."
                : "Your next journey is just one step away."}
            </p>
          </motion.div>

          {[
            "Register your identity",
            "Verify your phone number",
            "Start your journey",
          ].map((label, index) => (
            <motion.div
              key={label}
              variants={rise}
              className="flex items-center gap-3 rounded-xl border border-white/20 bg-black/20 p-3"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-xs text-white/70">
                0{index + 1}
              </span>
              <span className="text-sm font-medium">{label}</span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* RIGHT AUTH FORM */}
      <section className="flex flex-1 flex-col items-center justify-center overflow-y-auto px-4 py-12 sm:px-12 lg:px-16 lg:py-6 xl:px-24">
        <motion.div
          className="w-full max-w-xl space-y-7"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-white/50 transition hover:text-white"
          >
            <ArrowDownRight className="rotate-135" size={17} />
            Back to RideFlow
          </Link>

          <AnimatePresence mode="wait">
            {step === "details" && (
              <motion.div
                key="details"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-7"
              >
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/40">
                    RIDEFLOW ACCOUNT
                  </p>
                  <h2 className="text-3xl font-medium tracking-tight">
                    {signup ? "Create New Account" : "Welcome back"}
                  </h2>
                  <p className="text-sm text-white/40">
                    {signup
                      ? "Enter your details to begin your journey."
                      : "Sign in to your RideFlow account using OTP."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("rider")}
                    className={`flex h-14 items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition ${
                      role === "rider"
                        ? "border-white bg-white text-black"
                        : "border-white/10 bg-[#1A1A1A] text-white/60 hover:border-white/30"
                    }`}
                  >
                    <UserRound size={19} /> Rider
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("driver")}
                    className={`flex h-14 items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition ${
                      role === "driver"
                        ? "border-white bg-white text-black"
                        : "border-white/10 bg-[#1A1A1A] text-white/60 hover:border-white/30"
                    }`}
                  >
                    <CarFront size={19} /> Driver
                  </button>
                </div>

                <form onSubmit={sendOtp} className="space-y-5">
                  {signup && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <AuthInput
                          label="First name"
                          placeholder="First name"
                          value={firstName}
                          onChange={setFirstName}
                        />
                        <AuthInput
                          label="Last name"
                          placeholder="Last name"
                          value={lastName}
                          onChange={setLastName}
                        />
                      </div>

                      {role === "driver" && (
                        <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                          <h3 className="flex items-center gap-2 font-medium">
                            <CarFront size={18} />
                            Driver and vehicle details
                          </h3>

                          <AuthInput
                            label="Driving licence number"
                            placeholder="Enter licence number"
                            value={license}
                            onChange={setLicense}
                          />

                          <label className="block space-y-2 text-sm font-medium">
                            Vehicle type
                            <select
                              value={vehicleType}
                              onChange={(e) => setVehicleType(e.target.value)}
                              className={inputClass}
                            >
                              {["Bike", "Auto", "Mini", "Sedan", "SUV"].map(
                                (type) => (
                                  <option key={type} value={type}>
                                    {type}
                                  </option>
                                )
                              )}
                            </select>
                          </label>

                          <AuthInput
                            label="Registration number"
                            placeholder="e.g. PB10AB1234"
                            value={registration}
                            onChange={setRegistration}
                          />

                          <div className="grid grid-cols-2 gap-4">
                            <AuthInput
                              label="Vehicle make"
                              placeholder="e.g. Honda"
                              value={make}
                              onChange={setMake}
                            />
                            <AuthInput
                              label="Vehicle model"
                              placeholder="e.g. Activa"
                              value={model}
                              onChange={setModel}
                            />
                          </div>

                          <AuthInput
                            label="Vehicle colour"
                            placeholder="e.g. Black"
                            value={color}
                            onChange={setColor}
                          />
                        </div>
                      )}
                    </>
                  )}

                  <label className="block space-y-2 text-sm font-medium">
                    Phone number
                    <div className="flex h-12 items-center gap-3 rounded-xl bg-[#1A1A1A] px-4 focus-within:ring-2 focus-within:ring-white/20">
                      <Phone size={17} className="text-white/40" />
                      <span className="border-r border-white/10 pr-3 text-white/50">
                        +91
                      </span>
                      <input
                        className="h-full min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/25"
                        placeholder="Enter 10-digit mobile number"
                        inputMode="numeric"
                        autoComplete="tel-national"
                        value={phone}
                        onChange={(e) =>
                          setPhone(
                            e.target.value.replace(/\D/g, "").slice(0, 10)
                          )
                        }
                      />
                    </div>
                  </label>

                  {error && (
                    <p className="break-words text-sm text-rose-400">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-white font-semibold text-black transition hover:bg-white/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <LoaderCircle className="animate-spin" size={20} />
                    ) : (
                      <>Send OTP <ArrowRight size={18} /></>
                    )}
                  </button>
                </form>

                <p className="text-center text-sm text-white/50">
                  {signup ? "Already a member?" : "New to RideFlow?"}{" "}
                  <Link
                    className="font-semibold text-white hover:underline"
                    to={signup ? "/login" : "/signup"}
                  >
                    {signup ? "Log in" : "Create account"}
                  </Link>
                </p>
              </motion.div>
            )}

            {step === "otp" && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-7"
              >
                <button
                  type="button"
                  onClick={() => {
                    setStep("details");
                    setOtp("");
                    setError("");
                  }}
                  className="flex items-center gap-2 text-sm text-white/50 hover:text-white"
                >
                  <ArrowDownRight className="rotate-135" size={17} />
                  Back
                </button>

                <div className="space-y-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                    <ShieldCheck size={24} />
                  </div>
                  <h2 className="text-3xl font-medium tracking-tight">
                    Verify your number
                  </h2>
                  <p className="text-sm leading-relaxed text-white/40">
                    Enter the 6-digit verification code sent to{" "}
                    <span className="text-white">{fullPhone}</span>.
                  </p>
                </div>

                <form onSubmit={verifyOtp} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      One-time password
                    </label>
                    <div className="relative">
                      <input
                        type={showOtp ? "text" : "password"}
                        value={otp}
                        onChange={(e) =>
                          setOtp(
                            e.target.value.replace(/\D/g, "").slice(0, 6)
                          )
                        }
                        placeholder="Enter 6-digit OTP"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        className={`${inputClass} h-14 pr-12 text-lg tracking-[0.4em]`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowOtp((v) => !v)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                        aria-label={showOtp ? "Hide OTP" : "Show OTP"}
                      >
                        {showOtp ? <EyeOff size={19} /> : <Eye size={19} />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <p className="break-words text-sm text-white/60">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-white font-semibold text-black transition hover:bg-white/90 disabled:opacity-60"
                  >
                    {loading ? (
                      <LoaderCircle className="animate-spin" size={20} />
                    ) : (
                      <>Verify and continue <ArrowRight size={18} /></>
                    )}
                  </button>
                </form>

                <p className="text-center text-sm text-white/40">
                  Didn't receive the code?{" "}
                  <button
                    type="button"
                    onClick={resendOtp}
                    disabled={loading}
                    className="font-semibold text-white hover:underline disabled:opacity-50"
                  >
                    Resend OTP
                  </button>
                </p>
              </motion.div>
            )}

            {step === "success" && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 text-center"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-400">
                  <CheckCircle2 size={34} />
                </div>

                <h2 className="text-3xl font-medium tracking-tight">
                  Account ready!
                </h2>

                <p className="text-sm leading-relaxed text-white/50">
                  Your {role} phone number {fullPhone} has been verified and
                  your RideFlow profile has been saved.
                </p>

                {signup && (
                  <p className="text-sm text-white/60">
                    Welcome to RideFlow, {fullName}.
                  </p>
                )}

                <button
                  type="button"
                  onClick={() =>
                    navigate(role === "rider" ? "/book" : "/driver")
                  }
                  className="flex h-14 w-full items-center justify-center rounded-xl bg-white font-semibold text-black transition hover:bg-white/90"
                >
                  {role === "rider" ? "Start booking" : "Open driver dashboard"}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="border-t border-white/10 pt-5 text-center text-xs text-white/25">
            By continuing, you agree to RideFlow's Terms of Service and
            Privacy Policy.
          </div>
        </motion.div>
      </section>
    </main>
  );
}

// ======================================================
// PROFILE PAGE
// ======================================================

function AccountPage({
  user,
  role,
}: {
  user: any;
  role: AccountRole | null;
}) {
  return (
    <main className="min-h-screen bg-black p-8 text-white">
      <div className="mx-auto max-w-3xl space-y-6">
        <Brand />
        <h1 className="mt-12 text-3xl font-semibold">My Profile</h1>

        <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div>
            <p className="text-sm text-white/40">Full name</p>
            <p>{user?.user_metadata?.full_name || "RideFlow User"}</p>
          </div>
          <div>
            <p className="text-sm text-white/40">Phone number</p>
            <p>{user?.phone || "Not available"}</p>
          </div>
          <div>
            <p className="text-sm text-white/40">Account type</p>
            <p className="capitalize">{role || "Unknown"}</p>
          </div>
          <div>
            <p className="text-sm text-white/40">Account status</p>
            <p className="text-emerald-400">Phone verified</p>
          </div>
        </div>

        <Link
          to={role === "driver" ? "/driver" : "/book"}
          className="inline-flex rounded-xl bg-white px-6 py-3 font-semibold text-black"
        >
          {role === "driver" ? "Driver dashboard" : "Book a ride"}
        </Link>
      </div>
    </main>
  );
}

// ======================================================
// ROUTES AND SESSION MANAGEMENT
// ======================================================

function AppRoutes() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    let mounted = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (error) console.error("Session restore error:", error.message);

      if (mounted) {
        setUser(data.session?.user ?? null);
        setAuthLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const role: AccountRole | null =
    user?.user_metadata?.role === "rider" ||
    user?.user_metadata?.role === "driver"
      ? user.user_metadata.role
      : null;

  const handleLogout = async () => {
    if (!supabase) return;

    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error.message);
      return;
    }

    setUser(null);
    navigate("/");
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <LoaderCircle className="animate-spin" size={28} />
      </div>
    );
  }

  return (
    <Routes>
      <RouterRoute
        path="/"
        element={
          <HomePage user={user} role={role} onLogout={handleLogout} />
        }
      />

      <RouterRoute path="/login" element={<AuthPage signup={false} />} />
      <RouterRoute path="/signup" element={<AuthPage signup={true} />} />

      <RouterRoute
        path="/profile"
        element={
          user
            ? <AccountPage user={user} role={role} />
            : <AuthPage signup={false} />
        }
      />

      <RouterRoute path="/book" element={<BookingPage />} />
      <RouterRoute path="/adsa" element={<AdsaPage />} />
      <RouterRoute path="/dbms" element={<DbmsPage />} />

      <RouterRoute
        path="/driver"
        element={
          user && role === "driver"
            ? <AccountPage user={user} role={role} />
            : <AuthPage signup={false} />
        }
      />

      <RouterRoute
        path="*"
        element={
          <HomePage user={user} role={role} onLogout={handleLogout} />
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
