import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import { SEVERITY_META, SYMPTOM_OPTIONS } from "../lib/triage";
import { PushAlertToggle } from "../components/PushAlertToggle";
import { CaseListPane } from "../components/dashboard/CaseListPane";
import { CaseDetailPane } from "../components/dashboard/CaseDetailPane";
import { StatsRow } from "../components/dashboard/StatsRow";
import { BellIcon, ChartIcon } from "../components/icons";
import { useTranslation } from "../lib/i18n";
import { SettingsComponent } from "../components/SettingsComponent";

function sortActive(rows) {
  return [...rows].sort((a, b) => {
    const orderDiff =
      SEVERITY_META[a.severity].order - SEVERITY_META[b.severity].order;
    if (orderDiff !== 0) return orderDiff;
    return new Date(b.created_at) - new Date(a.created_at);
  });
}

function sortResolved(rows) {
  return [...rows].sort(
    (a, b) =>
      new Date(b.resolved_at ?? b.created_at) -
      new Date(a.resolved_at ?? a.created_at),
  );
}

function matchesQuery(row, query) {
  if (!query.trim()) return true;
  const q = query.toLowerCase();
  const symptomText = (row.symptoms ?? [])
    .map((k) => {
      const opt = SYMPTOM_OPTIONS.find((o) => o.key === k);
      return opt ? `${opt.label} ${opt.labelId}` : k;
    })
    .join(" ")
    .toLowerCase();
  return (
    row.patient_name?.toLowerCase().includes(q) ||
    row.notes?.toLowerCase().includes(q) ||
    row.address?.toLowerCase().includes(q) ||
    row.complaint_history?.toLowerCase().includes(q) ||
    symptomText.includes(q)
  );
}

export function DashboardPage() {
  const { session, loading } = useAuth();
  const { t } = useTranslation();
  const [rows, setRows] = useState([]);
  const [loadingRows, setLoadingRows] = useState(true);
  const [resolvedRows, setResolvedRows] = useState([]);
  const [loadingResolved, setLoadingResolved] = useState(false);
  const [resolvedLoaded, setResolvedLoaded] = useState(false);
  const [viewMode, setViewMode] = useState("active");
  const [displayMode, setDisplayMode] = useState("list");
  const [selectedId, setSelectedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAlertMenu, setShowAlertMenu] = useState(false);

  useEffect(() => {
    if (!session) return;

    let channel;

    async function load() {
      const { data } = await supabase
        .from("triage_submissions")
        .select("*")
        .neq("status", "resolved")
        .order("created_at", { ascending: true });
      setRows(data ?? []);
      setLoadingRows(false);
    }

    load();

    channel = supabase
      .channel("triage_submissions_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "triage_submissions" },
        (payload) => {
          setRows((current) => {
            if (payload.eventType === "INSERT") {
              return [...current, payload.new];
            }
            if (payload.eventType === "UPDATE") {
              const updated = payload.new;
              if (updated.status === "resolved") {
                return current.filter((r) => r.id !== updated.id);
              }
              const exists = current.some((r) => r.id === updated.id);
              if (!exists) return [...current, updated];
              return current.map((r) => (r.id === updated.id ? updated : r));
            }
            if (payload.eventType === "DELETE") {
              return current.filter((r) => r.id !== payload.old.id);
            }
            return current;
          });
        },
      )
      .subscribe();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [session]);

  const loadResolved = async () => {
    setLoadingResolved(true);
    const { data } = await supabase
      .from("triage_submissions")
      .select("*")
      .eq("status", "resolved")
      .order("resolved_at", { ascending: false })
      .limit(200);
    setResolvedRows(data ?? []);
    setResolvedLoaded(true);
    setLoadingResolved(false);
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    setSelectedId(null);
    if (mode === "resolved" && !resolvedLoaded) loadResolved();
  };

  const activeRowSet = viewMode === "active" ? rows : resolvedRows;
  useEffect(() => {
    if (selectedId && !activeRowSet.some((r) => r.id === selectedId))
      setSelectedId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRowSet, selectedId]);

  if (!loading && !session) return <Navigate to="/login" replace />;

  const updateStatus = async (id, status) => {
    const patch = {
      status,
      resolved_at: status === "resolved" ? new Date().toISOString() : null,
    };
    await supabase.from("triage_submissions").update(patch).eq("id", id);
  };

  const reopenCase = async (id) => {
    await supabase
      .from("triage_submissions")
      .update({ status: "pending", resolved_at: null })
      .eq("id", id);
    setResolvedRows((current) => current.filter((r) => r.id !== id));
    setSelectedId(null);
  };

  const deleteCase = async (id) => {
    await supabase.from("triage_submissions").delete().eq("id", id);
    setResolvedRows((current) => current.filter((r) => r.id !== id));
    setSelectedId(null);
  };

  const sortedRows = sortActive(rows);
  const sortedResolvedRows = sortResolved(resolvedRows);
  const currentRows = viewMode === "active" ? sortedRows : sortedResolvedRows;
  const visibleRows = currentRows.filter((r) => matchesQuery(r, searchQuery));
  const selectedRow = currentRows.find((r) => r.id === selectedId) ?? null;

  return (
    <div className="h-dvh flex flex-col">
      <header className="flex items-center justify-between px-4 py-3 bg-brand-deep shrink-0">
        <div>
          <h1 className="text-lg font-bold text-white">TriagePeace</h1>
          <p className="text-xs text-white/70">
            {t("active_cases", sortedRows.length)}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <div className="relative">
            <button
              onClick={() => setShowAlertMenu((v) => !v)}
              aria-label={t("notification_settings")}
              className="p-2 rounded-lg transition-colors hover:bg-white/10"
            >
              <BellIcon className="h-5 w-5 text-white" />
            </button>
            {showAlertMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowAlertMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-64 rounded-lg border border-line bg-paper shadow-lg p-3 z-20 animate-fade-in">
                  <PushAlertToggle />
                </div>
              </>
            )}
          </div>
          <Link
            to="/analytics"
            aria-label={t("analytics_title")}
            className="p-2 rounded-lg transition-colors hover:bg-white/10 text-white"
          >
            <ChartIcon className="h-5 w-5" />
          </Link>
          <SettingsComponent
            triggerClassName="border-transparent text-white hover:bg-white/10"
            showSignOut
          />
        </div>
      </header>

      {viewMode === "active" && <StatsRow rows={rows} />}

      <div className="flex-1 min-h-0 flex md:grid md:grid-cols-[360px_minmax(0,1fr)] overflow-hidden">
        <CaseListPane
          rows={visibleRows}
          selectedId={selectedId}
          onSelect={setSelectedId}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          loading={viewMode === "active" ? loadingRows : loadingResolved}
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          displayMode={displayMode}
          onDisplayModeChange={setDisplayMode}
          className={`${selectedId ? "hidden" : "flex"} md:flex w-full md:border-r md:border-line`}
        />
        <CaseDetailPane
          row={selectedRow}
          mode={viewMode}
          onBack={() => setSelectedId(null)}
          onUpdateStatus={updateStatus}
          onReopen={reopenCase}
          onDelete={deleteCase}
          className={`${selectedId ? "flex" : "hidden"} md:flex w-full`}
        />
      </div>
    </div>
  );
}
