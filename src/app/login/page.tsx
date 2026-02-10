"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import { loginAction } from "@/actions/auth";
import { User, Shield, GraduationCap, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const [state, action, isPending] = useActionState(loginAction, undefined);
  const [selectedRole, setSelectedRole] = useState<"admin" | "faculty" | "student" | null>(null);
  const blobRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (blobRef.current) {
        blobRef.current.animate(
          {
            transform: `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`,
          },
          { duration: 450, fill: "forwards", easing: "ease-out" }
        );
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const roles = [
    {
      id: "admin",
      title: "Admin",
      icon: Shield,
      description: "Manage system and data",
      color: "from-purple-500 to-indigo-600",
    },
    {
      id: "faculty",
      title: "Faculty",
      icon: User,
      description: "Mark attendance and marks",
      color: "from-pink-500 to-rose-600",
    },
    {
      id: "student",
      title: "Student",
      icon: GraduationCap,
      description: "View results and attendance",
      color: "from-cyan-500 to-blue-600",
    },
  ] as const;

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Blob Cursor Background */}
      <div
        ref={blobRef}
        className="fixed top-0 left-0 w-[650px] h-[650px] rounded-full blur-[250px] pointer-events-none z-0 opacity-40"
        style={{
          background: "linear-gradient(to right, #1100ff 10%, #ff00f2)",
          transform: "translate(-50%, -50%)",
        }}
      />

      <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl z-10 relative">
        <div className="text-center mb-8">
          <div className="flex flex-col gap-1">
            {selectedRole ? (
              <h1 className="text-2xl font-bold text-white">
                Welcome, {selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}
              </h1>
            ) : (
              <>
                <h1 className="text-lg md:text-xl font-bold text-white leading-tight">
                  SVR Engineering College
                </h1>
                <p className="text-xs md:text-sm text-slate-300 font-medium leading-tight">
                  (Autonomous), Nandyal
                </p>
                <p className="text-[10px] md:text-xs text-slate-400 capitalize pt-1">
                  Department of CSE - Artificial Intelligence
                </p>
              </>
            )}
          </div>

        </div>

        <div className="w-full border-t border-white/10 mb-6" />

        {!selectedRole ? (
          <div className="space-y-4">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className="w-full group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 transition-all hover:bg-white/10 hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/10 active:scale-[0.98]"
              >
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-r ${role.color}`} />
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${role.color} shadow-inner`}>
                    <role.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-white text-lg">{role.title}</h3>
                    <p className="text-sm text-slate-400">{role.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <form action={action} className="space-y-6 animate-in slide-in-from-right-8 fade-in duration-300">
            {/* Hidden input to pass the role if needed, currently valid handled by email lookup usually, but UI clarity helps */}

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 block">
                {selectedRole === "student" ? "Student Id" : selectedRole === "faculty" ? "Employee ID" : "Email Address"}
              </label>
              <input
                name="identifier"
                type="text"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                placeholder={
                  selectedRole === "student" ? "Enter Student Id" :
                    selectedRole === "faculty" ? "Enter Employee ID" :
                      `${selectedRole}@svr.edu`
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 block">Password</label>
              <input
                name="password"
                type="password"
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all"
                placeholder={
                  selectedRole === "student" ? "Enter Student Password" :
                    selectedRole === "faculty" ? "Enter Employee Password" :
                      "••••••••"
                }
              />
            </div>

            {selectedRole !== "admin" && (
              <div className="flex items-center gap-2">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  className="w-4 h-4 rounded border-white/10 bg-white/5 text-purple-600 focus:ring-2 focus:ring-purple-500/50"
                />
                <label htmlFor="rememberMe" className="text-sm text-slate-300">
                  Remember me for 30 days
                </label>
              </div>
            )}

            {state?.error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {state.error}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className={`w-full py-3.5 px-4 rounded-xl font-medium text-white shadow-lg shadow-purple-500/25 transition-all hover:shadow-purple-500/40 active:scale-[0.98] disabled:opacity-70 bg-gradient-to-r ${roles.find((r) => r.id === selectedRole)?.color
                }`}
            >
              {isPending ? "Signing in..." : "Sign In"}
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole(null)}
              className="w-full py-2 text-sm text-slate-400 hover:text-white flex items-center justify-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Switch Role
            </button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-white/10 flex justify-center w-full">
          <p className="text-[10px] text-slate-400 flex items-center gap-1.5 opacity-80">
            🔒 Secure Login • Your data is protected
          </p>
        </div>
      </div>
    </div>
  );
}
