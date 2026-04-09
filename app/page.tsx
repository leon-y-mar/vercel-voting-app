"use client";

import { useState, useEffect } from "react";

interface VoteCounts {
  A: number;
  B: number;
}

function Spinner() {
  return (
    <div
      role="status"
      aria-label="Cargando"
      className="w-10 h-10 rounded-full border-[3px] border-secondary border-t-primary animate-spin"
    />
  );
}

function PodiumBar({
  src,
  label,
  count,
  pct,
  place,
}: {
  src: string;
  label: string;
  count: number;
  pct: number;
  place: 1 | 2;
}) {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const t = requestAnimationFrame(() =>
      requestAnimationFrame(() => setHeight(place === 1 ? 180 : 120))
    );
    return () => cancelAnimationFrame(t);
  }, [place]);

  const isFirst = place === 1;

  return (
    <div className="flex flex-col items-center gap-3 w-40 sm:w-48">
      {/* Medal */}
      <div
        className={[
          "flex items-center justify-center w-10 h-10 rounded-full font-bold text-lg shadow",
          isFirst
            ? "bg-yellow-400 text-yellow-900"
            : "bg-gray-300 text-gray-700",
        ].join(" ")}
      >
        {place}
      </div>

      {/* Image thumbnail */}
      <div className="w-20 h-16 rounded-xl overflow-hidden border-2 border-gray-100 shadow-sm flex-shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={label} className="w-full h-full object-cover" />
      </div>

      {/* Podium block */}
      <div
        className={[
          "w-full rounded-t-2xl flex flex-col items-center justify-center gap-1 transition-all duration-700 ease-out shadow-md",
          isFirst ? "bg-primary text-white" : "bg-gray-200 text-gray-700",
        ].join(" ")}
        style={{ height, transitionProperty: "height" }}
      >
        <span className="font-bold text-2xl">{pct}%</span>
        <span className="text-xs opacity-80">
          {count === 1 ? "1 voto" : `${count} votos`}
        </span>
      </div>

      {/* Label below */}
      <span className="font-semibold text-gray-800 text-sm text-center">
        {label}
      </span>
    </div>
  );
}

export default function ClosedPage() {
  const [counts, setCounts] = useState<VoteCounts | null>(null);

  useEffect(() => {
    fetch("/api/vote?session_id=closed")
      .then((r) => r.json())
      .then((d) => setCounts(d.counts ?? { A: 0, B: 0 }))
      .catch(() => setCounts({ A: 0, B: 0 }));
  }, []);

  const total = counts ? counts.A + counts.B : 0;
  const pctA = total > 0 ? Math.round((counts!.A / total) * 100) : 50;
  const pctB = total > 0 ? 100 - pctA : 50;

  const aWins = (counts?.A ?? 0) >= (counts?.B ?? 0);

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 bg-white">
      <div className="w-full max-w-xl flex flex-col items-center gap-10">

        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-secondary-light rounded-full mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-7 h-7 text-primary"
              aria-hidden="true"
            >
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            La votación se ha cerrado
          </h1>
          <p className="text-gray-500 text-sm sm:text-base">
            Gracias por participar.{" "}
            {total > 0 && (
              <span>{total === 1 ? "1 voto registrado." : `${total} votos registrados.`}</span>
            )}
          </p>
        </div>

        {/* Podium */}
        {!counts ? (
          <Spinner />
        ) : (
          <div className="flex items-end justify-center gap-4 sm:gap-8 w-full">
            {aWins ? (
              <>
                <PodiumBar
                  src="/image-b.png"
                  label="Opción B"
                  count={counts.B}
                  pct={pctB}
                  place={2}
                />
                <PodiumBar
                  src="/image-a.png"
                  label="Opción A"
                  count={counts.A}
                  pct={pctA}
                  place={1}
                />
              </>
            ) : (
              <>
                <PodiumBar
                  src="/image-a.png"
                  label="Opción A"
                  count={counts.A}
                  pct={pctA}
                  place={2}
                />
                <PodiumBar
                  src="/image-b.png"
                  label="Opción B"
                  count={counts.B}
                  pct={pctB}
                  place={1}
                />
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
