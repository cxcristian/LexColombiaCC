"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  FileText,
  Pin,
  BookOpen,
  Gavel,
  Plus,
  User,
  Calendar,
  Loader2,
  Shield,
  Bell,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabaseClient } from "@/lib/supabase/client";
import type { Note } from "@/types/database";

export default function DashboardPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) router.push("/");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    supabaseClient
      .from("notes")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .then(({ data }) => {
        setNotes(data ?? []);
        setLoading(false);
      });
  }, [user]);

  if (authLoading || loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 size={28} className="animate-spin text-navy-400" />
      </div>
    );
  if (!user) return null;

  const pinnedCount = notes.filter((n) => n.is_pinned).length;
  const withLaw = notes.filter((n) => n.related_law_id).length;
  const withPrec = notes.filter((n) => n.related_precedent_id).length;
  const recent = notes.slice(0, 5);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Profile header */}
      <div className="lex-card overflow-hidden mb-8">
        <div
          className="h-20 w-full"
          style={{
            background:
              "linear-gradient(135deg, var(--navy-900), var(--navy-700))",
          }}
        />
        <div className="px-6 sm:px-8 pb-6 -mt-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              {profile?.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt="Avatar"
                  width={64}
                  height={64}
                  className="rounded-2xl border-4 border-white shadow-card"
                />
              ) : (
                <div
                  className="w-16 h-16 rounded-2xl border-4 border-white shadow-card flex items-center justify-center text-xl font-bold text-white"
                  style={{ background: "var(--navy-700)" }}
                >
                  {(profile?.full_name ?? user.email ?? "U")[0].toUpperCase()}
                </div>
              )}
              <div className="mb-1">
                <h1 className="font-display font-bold text-xl text-white">
                  {profile?.full_name ?? "Usuario"}
                </h1>
                <p className="text-sm text-slate-500">{user.email}</p>
                <span
                  className={`badge mt-1 ${profile?.role === "admin" ? "badge-gold" : "badge-navy"}`}
                >
                  {profile?.role === "admin" ? (
                    <>
                      <Shield size={10} /> Admin
                    </>
                  ) : (
                    <>
                      <User size={10} /> Usuario
                    </>
                  )}
                </span>
              </div>
            </div>
            <Link
              href="/notas/nueva"
              className="btn-primary inline-flex items-center gap-2 px-4 py-2.5 text-sm self-end"
            >
              <Plus size={14} />
              Nueva nota
            </Link>
          </div>
          <p className="text-xs text-slate-400 mt-3 flex items-center gap-1">
            <Calendar size={11} />
            Miembro desde{" "}
            {new Date(profile?.created_at ?? "").toLocaleDateString("es-CO", {
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          {
            icon: FileText,
            label: "Notas",
            value: notes.length,
            color: "var(--navy-800)",
          },
          {
            icon: Pin,
            label: "Ancladas",
            value: pinnedCount,
            color: "#d97706",
          },
          {
            icon: BookOpen,
            label: "Con ley",
            value: withLaw,
            color: "var(--navy-600)",
          },
          {
            icon: Gavel,
            label: "Con precedente",
            value: withPrec,
            color: "#dc2626",
          },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="lex-card p-5 text-center">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2"
              style={{ background: `${color}15` }}
            >
              <Icon size={17} style={{ color }} />
            </div>
            <div className="font-display font-bold text-2xl text-navy-900">
              {value}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Calendar quick access */}
      <Link
        href="/calendario"
        className="lex-card flex items-center gap-4 px-6 py-4 mb-8 hover:border-navy-200 transition-all group"
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-navy-50 border border-navy-100 group-hover:bg-navy-100 transition-colors">
          <Calendar size={18} className="text-navy-700" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-navy-900">Mi calendario</p>
          <p className="text-xs text-slate-500">Gestiona recordatorios y fechas importantes</p>
        </div>
        <Bell size={15} className="text-slate-300 group-hover:text-navy-400 transition-colors" />
      </Link>

      {/* Recent notes */}
      <div className="lex-card overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-display font-bold text-lg text-navy-900">
            Notas recientes
          </h2>
          <Link
            href="/notas"
            className="text-sm font-medium text-navy-700 hover:text-navy-900 transition-colors"
          >
            Ver todas →
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={32} className="mx-auto mb-3 text-slate-300" />
            <p className="font-display font-semibold text-navy-900 mb-1">
              Sin notas aún
            </p>
            <p className="text-sm text-slate-500 mb-4">
              Crea tu primera nota judicial
            </p>
            <Link
              href="/notas/nueva"
              className="btn-primary inline-flex items-center gap-2 px-5 py-2 text-sm"
            >
              <Plus size={14} />
              Crear nota
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recent.map((note) => (
              <Link
                key={note.id}
                href={`/notas/${note.id}`}
                className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50 transition-colors group"
              >
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{
                    background: note.is_pinned
                      ? "var(--navy-700)"
                      : "var(--slate-200)",
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-navy-900 truncate group-hover:text-navy-700">
                    {note.title}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {note.content?.slice(0, 60) || "Sin contenido"}
                  </p>
                </div>
                <span className="text-xs text-slate-400 flex-shrink-0">
                  {new Date(note.updated_at).toLocaleDateString("es-CO", {
                    day: "2-digit",
                    month: "short",
                  })}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
