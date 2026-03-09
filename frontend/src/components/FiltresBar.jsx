import { RESPONSABLES, PRIORITES } from "../utils.js";

export default function FiltresBar({
  search,
  onSearch,
  filtreResponsable,
  onFiltreResponsable,
  filtrePriorite,
  onFiltrePriorite,
}) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px] max-w-xs">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Rechercher une tâche..."
          className="w-full pl-9 pr-4 py-2 bg-dark-700 border border-dark-600 rounded-lg text-sm text-gray-200 placeholder-dark-500 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-colors"
        />
        {search && (
          <button
            onClick={() => onSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-gray-400"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Responsable filter */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-dark-500 font-medium">Par :</span>
        <button
          onClick={() => onFiltreResponsable("")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            filtreResponsable === ""
              ? "bg-dark-600 text-gray-200"
              : "text-dark-500 hover:text-gray-300 hover:bg-dark-700"
          }`}
        >
          Tous
        </button>
        {RESPONSABLES.map((r) => (
          <button
            key={r}
            onClick={() =>
              onFiltreResponsable(filtreResponsable === r ? "" : r)
            }
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filtreResponsable === r
                ? r === "Ilias"
                  ? "bg-blue-600/30 text-blue-300 border border-blue-500/30"
                  : "bg-purple-600/30 text-purple-300 border border-purple-500/30"
                : "text-dark-500 hover:text-gray-300 hover:bg-dark-700"
            }`}
          >
            {r}
          </button>
        ))}
        <button
          onClick={() =>
            onFiltreResponsable(filtreResponsable === "Commun" ? "" : "Commun")
          }
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            filtreResponsable === "Commun"
              ? "bg-[#D88D23]/20 text-[#E7B54C] border border-[#D88D23]/30"
              : "text-dark-500 hover:text-gray-300 hover:bg-dark-700"
          }`}
        >
          Commun
        </button>
      </div>

      {/* Priorité filter */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-dark-500 font-medium">Priorité :</span>
        <button
          onClick={() => onFiltrePriorite("")}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            filtrePriorite === ""
              ? "bg-dark-600 text-gray-200"
              : "text-dark-500 hover:text-gray-300 hover:bg-dark-700"
          }`}
        >
          Toutes
        </button>
        {PRIORITES.map((p) => (
          <button
            key={p.value}
            onClick={() =>
              onFiltrePriorite(filtrePriorite === p.value ? "" : p.value)
            }
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
              filtrePriorite === p.value
                ? p.className
                : "border-transparent text-dark-500 hover:text-gray-300 hover:bg-dark-700"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
