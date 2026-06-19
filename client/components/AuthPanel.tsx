import { useState, type SubmitEvent } from "react";

type AuthPanelProps = {
  mode: "login" | "register";
  onChangeMode: (mode: "login" | "register") => void;
  onSubmit: (
    values: { email: string; password: string; username?: string },
    mode: "login" | "register"
  ) => void;
  error: string | null;
  loading: boolean;
};

export default function AuthPanel({
  mode,
  onChangeMode,
  onSubmit,
  error,
  loading
}: Readonly<AuthPanelProps>) {
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleSubmit = (event: SubmitEvent) => {
    event.preventDefault();
    onSubmit(
      {
        username: username.trim(),
        email: email.trim(),
        password: password.trim()
      },
      mode
    );
  };

  return (
    <div className="p-8 border shadow-sm rounded-3xl border-slate-200 bg-slate-50">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h2 className="mt-2 text-2xl font-bold text-slate-900">
          {mode === "login" ? "Sign in" : "Create your account"}
        </h2>
        <div className="flex gap-2 p-1 bg-white rounded-full shadow-sm">
          <button
            type="button"
            onClick={() => onChangeMode("login")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${mode === "login" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"}`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => onChangeMode("register")}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${mode === "register" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"}`}
          >
            Register
          </button>
        </div>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        {mode === "register" && (
          <label className="block text-sm font-medium text-slate-700">
            <p>Username</p>
            <input
              className="w-full px-4 py-3 mt-2 text-sm transition bg-white border outline-none rounded-3xl border-slate-200 text-slate-900 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
              placeholder="Your name"
            />
          </label>
        )}

        <label className="block text-sm font-medium text-slate-700">
          <p>Email</p>
          <input
            className="w-full px-4 py-3 mt-2 text-sm transition bg-white border outline-none rounded-3xl border-slate-200 text-slate-900 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            placeholder="example@mail.com"
          />
        </label>

        <label className="block text-sm font-medium text-slate-700">
          <p>Password</p>
          <input
            className="w-full px-4 py-3 mt-2 text-sm transition bg-white border outline-none rounded-3xl border-slate-200 text-slate-900 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            placeholder="Enter password"
          />
        </label>

        {error && (
          <p className="px-4 py-3 text-sm rounded-3xl bg-rose-100 text-rose-700">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-3 text-sm font-semibold text-white transition rounded-3xl bg-slate-900 hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {loading
            ? "Working…"
            : mode === "login"
              ? "Sign in"
              : "Create account"}
        </button>
      </form>
    </div>
  );
}
