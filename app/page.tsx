"use client";

import { useState, useEffect, useCallback } from "react";
import ImageCard from "@/components/ImageCard";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type AppState = "loading" | "voting" | "submitting" | "results";

interface VoteCounts {
  A: number;
  B: number;
}

// ---------------------------------------------------------------------------
// Spinner — shared loading indicator
// ---------------------------------------------------------------------------
function Spinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dims =
    size === "sm"
      ? "w-4 h-4 border-2"
      : size === "lg"
        ? "w-12 h-12 border-[3px]"
        : "w-8 h-8 border-[3px]";
  return (
    <div
      role="status"
      aria-label="Cargando"
      className={`${dims} rounded-full border-secondary border-t-primary animate-spin flex-shrink-0`}
    />
  );
}

// ---------------------------------------------------------------------------
// Loading screen
// ---------------------------------------------------------------------------
function LoadingScreen() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center gap-4 bg-white px-4">
      <Spinner size="lg" />
      <p className="text-sm text-gray-400 tracking-wide">Verificando sesión…</p>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Result bar — animates on mount
// ---------------------------------------------------------------------------
function ResultBar({
  pct,
  isWinner,
}: {
  pct: number;
  isWinner: boolean;
}) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const t = requestAnimationFrame(() => {
      requestAnimationFrame(() => setWidth(pct));
    });
    return () => cancelAnimationFrame(t);
  }, [pct]);

  return (
    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
      <div
        className={`h-full rounded-full ${isWinner ? "bg-primary" : "bg-secondary"}`}
        style={{ width: `${width}%`, transition: "width 700ms cubic-bezier(0.22, 1, 0.36, 1)" }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Result card — one row per option
// ---------------------------------------------------------------------------
function ResultCard({
  src,
  label,
  count,
  pct,
  isWinner,
  userVoted,
  total,
}: {
  src: string;
  label: string;
  count: number;
  pct: number;
  isWinner: boolean;
  userVoted: boolean;
  total: number;
}) {
  return (
    <div
      className={[
        "flex items-center gap-5 p-4 sm:p-5 rounded-2xl border-2 transition-colors duration-200",
        isWinner && total > 0
          ? "border-primary bg-secondary-light"
          : "border-gray-100 bg-white",
      ].join(" ")}
    >
      {/* Thumbnail */}
      <div className="relative w-20 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={label} className="w-full h-full object-cover" />
        {isWinner && total > 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg" aria-label="Ganador">🏆</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-semibold text-gray-900 text-sm sm:text-base truncate">
              {label}
            </span>
            {userVoted && (
              <span className="text-xs font-medium bg-primary text-white px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
                Tu voto
              </span>
            )}
          </div>
          <span className="font-bold text-gray-900 text-sm sm:text-base flex-shrink-0">
            {pct}%
          </span>
        </div>

        <ResultBar pct={pct} isWinner={isWinner} />

        <p className="text-xs text-gray-400 mt-1.5">
          {count === 1 ? "1 voto" : `${count} votos`}
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Results screen
// ---------------------------------------------------------------------------
function ResultsScreen({
  counts,
  selected,
}: {
  counts: VoteCounts;
  selected: "A" | "B" | null;
}) {
  const total = counts.A + counts.B;
  const pctA = total > 0 ? Math.round((counts.A / total) * 100) : 0;
  const pctB = total > 0 ? 100 - pctA : 0;
  const winnerA = counts.A > counts.B;
  const winnerB = counts.B > counts.A;
  const tie = counts.A === counts.B && total > 0;

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 bg-white">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-secondary-light rounded-full mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-7 h-7 text-primary"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.491 4.491 0 0 1-3.497-1.307 4.491 4.491 0 0 1-1.307-3.497A4.49 4.49 0 0 1 2.25 12a4.49 4.49 0 0 1 1.549-3.397 4.491 4.491 0 0 1 1.307-3.497 4.491 4.491 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
            ¡Gracias por votar!
          </h1>
          <p className="text-gray-500 text-sm sm:text-base">
            {tie
              ? "¡Empate! Ambas opciones tienen los mismos votos."
              : total === 0
                ? "Aún no hay votos registrados."
                : `${total === 1 ? "1 voto total" : `${total} votos totales`}`}
          </p>
        </div>

        {/* Result cards */}
        <div className="space-y-3">
          <ResultCard
            src="/image-a.png"
            label="Opción A"
            count={counts.A}
            pct={pctA}
            isWinner={winnerA}
            userVoted={selected === "A"}
            total={total}
          />
          <ResultCard
            src="/image-b.png"
            label="Opción B"
            count={counts.B}
            pct={pctB}
            isWinner={winnerB}
            userVoted={selected === "B"}
            total={total}
          />
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-gray-300 mt-8">
          Tu voto queda registrado de forma anónima en este dispositivo.
        </p>
      </div>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Voting screen
// ---------------------------------------------------------------------------
function VotingScreen({
  onVote,
  disabled,
  selected,
}: {
  onVote: (choice: "A" | "B") => void;
  disabled: boolean;
  selected: "A" | "B" | null;
}) {
  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 bg-white">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            ¿Cuál logotipo prefieres?
          </h1>
          <p className="text-gray-500 text-sm sm:text-base">
            Elige el que te transmita más: Innovación. Comunidad. Producto. Tecnología. Compartir. Growth. Experimentos. Equipo. Data, etc. Solo un voto por dispositivo.
          </p>
        </div>

        {/* Submitting banner */}
        {disabled && (
          <div
            role="status"
            aria-live="polite"
            className="flex items-center justify-center gap-2.5 mb-6 py-2.5 px-4 bg-secondary-light rounded-full w-fit mx-auto text-primary text-sm font-medium"
          >
            <Spinner size="sm" />
            <span>Registrando tu voto…</span>
          </div>
        )}

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
          <ImageCard
            src="/image-a.png"
            label="Opción A"
            onClick={() => onVote("A")}
            disabled={disabled}
            selected={selected === "A"}
          />
          <ImageCard
            src="/image-b.png"
            label="Opción B"
            onClick={() => onVote("B")}
            disabled={disabled}
            selected={selected === "B"}
          />
        </div>

        {/* Keyboard hint */}
        {!disabled && (
          <p className="text-center text-xs text-gray-300 mt-8">
            Puedes navegar con el teclado — Tab para moverte, Enter para votar.
          </p>
        )}
      </div>
    </main>
  );
}

// ---------------------------------------------------------------------------
// Main page — orchestrates the 4 states
// ---------------------------------------------------------------------------
export default function VotingPage() {
  const [appState, setAppState] = useState<AppState>("loading");
  const [sessionId, setSessionId] = useState<string>("");
  const [selected, setSelected] = useState<"A" | "B" | null>(null);
  const [counts, setCounts] = useState<VoteCounts>({ A: 0, B: 0 });

  const checkVoted = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/vote?session_id=${encodeURIComponent(id)}`);
      if (!res.ok) throw new Error("Network error");
      const data: { voted: boolean; counts: VoteCounts } = await res.json();
      if (data.voted) {
        setCounts(data.counts);
        setAppState("results");
      } else {
        setAppState("voting");
      }
    } catch {
      // Fail open: let user vote even if check fails
      setAppState("voting");
    }
  }, []);

  useEffect(() => {
    let id = localStorage.getItem("voting_session_id");
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem("voting_session_id", id);
    }
    setSessionId(id);
    checkVoted(id);
  }, [checkVoted]);

  const handleVote = useCallback(
    async (choice: "A" | "B") => {
      setSelected(choice);
      setAppState("submitting");

      try {
        const res = await fetch("/api/vote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ choice, session_id: sessionId }),
        });
        const data: { success: boolean; counts?: VoteCounts; already_voted?: boolean } =
          await res.json();
        if (data.counts) {
          setCounts(data.counts);
        }
      } catch {
        // If request fails, still show results with best available data
      }

      setAppState("results");
    },
    [sessionId]
  );

  if (appState === "loading") return <LoadingScreen />;

  if (appState === "results") {
    return <ResultsScreen counts={counts} selected={selected} />;
  }

  return (
    <VotingScreen
      onVote={handleVote}
      disabled={appState === "submitting"}
      selected={appState === "submitting" ? selected : null}
    />
  );
}
