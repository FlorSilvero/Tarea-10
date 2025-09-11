"use client";
import React from "react";

// ==========================
// ⚙️ Configuración rápida
// Cambiá estas rutas si tu backend usa otros endpoints
const API_BASE = ""; // "" para relativo al mismo dominio, o "http://localhost:3000" etc.
const LOGIN_PATH = "/api/auth/login";      // POST {email, password}
const REGISTER_PATH = "/api/auth/register"; // POST {name, email, password}

// Claves en localStorage usadas por la app para saber el usuario logueado
const LS_USER_KEY = "auth:user"; // guarda { id, email, name, token? }

// ==========================
// 🧰 Helpers
function hex(n: number) {
  const chars = "0123456789abcdef";
  let out = "";
  for (let i = 0; i < n; i++) out += chars[Math.floor(Math.random() * 16)];
  return out;
}

// Genera un ObjectId válido (24 hex) para probar sin backend
function generateObjectId() {
  return hex(24);
}

function getUserIdFromPayload(data: any) {
  // tolera distintos formatos de respuesta del backend
  return (
    data?.user?.id ||
    data?.user?._id ||
    data?.userId ||
    data?._id ||
    data?.id ||
    null
  );
}

function getNameFromPayload(data: any) {
  return data?.user?.name || data?.name || data?.userName || "";
}

function getEmailFromPayload(data: any) {
  return data?.user?.email || data?.email || "";
}

function saveUserInLocalStorage(user: { id: string; email?: string; name?: string; token?: string }) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_USER_KEY, JSON.stringify(user));
  // Notificar a la app (por si otros componentes escuchan cambios)
  window.dispatchEvent(new Event("auth-changed"));
}

function readUser() {
  if (typeof window === "undefined") return null as any;
  try {
    const raw = localStorage.getItem(LS_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function logout() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LS_USER_KEY);
  // Llamar al backend para borrar la cookie
  fetch("/api/auth/logout", { method: "POST" });
  window.dispatchEvent(new Event("auth-changed"));
}

// ==========================
// 🎨 UI helpers
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="text-sm text-gray-700">{label}</span>
    <div className="mt-1">{children}</div>
  </label>
);

const Card = ({ children }: { children: React.ReactNode }) => (
  <div className="w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
    {children}
  </div>
);

const TabButton = ({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium rounded-xl transition ${
      active ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
    }`}
  >
    {children}
  </button>
);

const Submit = ({ children, disabled }: { children: React.ReactNode; disabled?: boolean }) => (
  <button
    type="submit"
    disabled={disabled}
    className="w-full rounded-xl bg-gray-900 px-4 py-2 font-semibold text-white disabled:opacity-50"
  >
    {children}
  </button>
);

// ==========================
// 🧩 Componente principal (ponelo en /app/auth/page.tsx)
export default function AuthPage() {
  const [tab, setTab] = React.useState<"login" | "register">("login");
  const [loading, setLoading] = React.useState(false);
  const [msg, setMsg] = React.useState<{ type: "success" | "error" | "", text: string }>({ type: "", text: "" });
  const [current, setCurrent] = React.useState<any>(null);
  // Limpia el usuario al cerrar sesión
  const handleLogout = () => {
    logout();
    setCurrent(null);
    setMsg({ type: "success", text: "Sesión cerrada." });
  };

  React.useEffect(() => {
    setCurrent(readUser());
    const onChange = () => setCurrent(readUser());
    window.addEventListener("auth-changed", onChange);
    return () => window.removeEventListener("auth-changed", onChange);
  }, []);

  return (
    <div className="min-h-[80vh] w-full bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
      <Card>
        <div className="mb-4 flex items-center gap-2">
          <TabButton active={tab === "login"} onClick={() => setTab("login")}>Ingresar</TabButton>
          <TabButton active={tab === "register"} onClick={() => setTab("register")}>Crear cuenta</TabButton>
        </div>

        {msg.text && (
          <div className={`mb-4 rounded-xl px-3 py-2 text-sm ${
            msg.type === "success" ? "bg-green-50 text-green-700" : msg.type === "error" ? "bg-red-50 text-red-700" : "hidden"
          }`}>
            {msg.text}
          </div>
        )}

        {current ? (
          <LoggedInView user={current} onLogout={handleLogout} />
        ) : tab === "login" ? (
          <LoginForm setLoading={setLoading} setMsg={setMsg} />
        ) : (
          <RegisterForm setLoading={setLoading} setMsg={setMsg} />
        )}

  {/* Modo demo eliminado */}
      </Card>
    </div>
  );
}

function LoggedInView({ user, onLogout }: { user: any; onLogout: () => void }) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Sesión iniciada</h2>
      <div className="grid grid-cols-1 gap-3 rounded-xl bg-gray-50 p-3 text-sm">
        <div><span className="text-gray-500">ID:</span> <code>{user?.id}</code></div>
        {user?.email && <div><span className="text-gray-500">Email:</span> {user.email}</div>}
        {user?.name && <div><span className="text-gray-500">Nombre:</span> {user.name}</div>}
        {user?.token && <div><span className="text-gray-500">Token:</span> <code className="break-all">{user.token}</code></div>}
      </div>
      <button onClick={onLogout} className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-50">
        Cerrar sesión
      </button>
    </div>
  );
}

function LoginForm({ setLoading, setMsg }: { setLoading: (v: boolean) => void; setMsg: (m: { type: "success" | "error" | "", text: string }) => void }) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg({ type: "", text: "" });


    if (!email || !password) {
      setMsg({ type: "error", text: "Completá email y contraseña." });
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}${LOGIN_PATH}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Error de autenticación");

      const id = getUserIdFromPayload(data);
      if (!id) throw new Error("La respuesta no contiene userId");

      const user = { id, email: getEmailFromPayload(data) || email, name: getNameFromPayload(data), token: data?.token };
  saveUserInLocalStorage(user);
  setMsg({ type: "success", text: "Sesión iniciada correctamente." });
  window.location.href = "/";
    } catch (err: any) {
      setMsg({ type: "error", text: err?.message || "No se pudo iniciar sesión" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Email">
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-gray-300" placeholder="tu@email.com" />
      </Field>
      <Field label="Contraseña">
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-gray-300" placeholder="••••••••" />
      </Field>
      <Submit>Ingresar</Submit>
    </form>
  );
}

function RegisterForm({ setLoading, setMsg }: { setLoading: (v: boolean) => void; setMsg: (m: { type: "success" | "error" | "", text: string }) => void }) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg({ type: "", text: "" });


    if (!name || !email || !password) {
      setMsg({ type: "error", text: "Completá nombre, email y contraseña." });
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}${REGISTER_PATH}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Error al crear usuario");

      const id = getUserIdFromPayload(data);
      const user = { id: id || generateObjectId(), email: getEmailFromPayload(data) || email, name: getNameFromPayload(data) || name, token: data?.token };
  saveUserInLocalStorage(user);
  setMsg({ type: "success", text: "Usuario creado e ingresado." });
  window.location.href = "/";
    } catch (err: any) {
      setMsg({ type: "error", text: err?.message || "No se pudo crear el usuario" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Nombre">
        <input value={name} onChange={e => setName(e.target.value)} className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-gray-300" placeholder="Tu nombre" />
      </Field>
      <Field label="Email">
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-gray-300" placeholder="tu@email.com" />
      </Field>
      <Field label="Contraseña">
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-gray-300" placeholder="••••••••" />
      </Field>
      <Submit>Crear cuenta</Submit>
    </form>
  );
}
