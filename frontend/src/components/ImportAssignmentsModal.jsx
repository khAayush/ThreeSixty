import React, { useState } from "react";
import {
  ArrowUpTrayIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/24/outline";

const API_URL = import.meta.env.VITE_API_URL;

const parseCSV = (text) => {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return { rows: [], error: "CSV must have a header row and at least one data row" };

  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, "").toLowerCase().replace(/[\s_]/g, ""));

  const nameIdx  = headers.findIndex((h) => h === "name");
  const emailIdx = headers.findIndex((h) => h === "email");
  const tagIdx   = headers.findIndex((h) => ["tag", "assettag", "itemtag"].includes(h));

  if (emailIdx === -1 || tagIdx === -1)
    return { rows: [], error: "Headers must include: email, tag  (name is optional)" };

  const rows = lines
    .slice(1)
    .filter((l) => l.trim())
    .map((line) => {
      const cols = line.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
      return {
        name:  nameIdx !== -1 ? (cols[nameIdx] || "") : "",
        email: cols[emailIdx] || "",
        tag:   cols[tagIdx]   || "",
      };
    });

  return { rows, error: "" };
};

const ImportAssignmentsModal = ({ isOpen, onClose, authHeaders, onImported }) => {
  const [rows, setRows]           = useState([]);
  const [parseError, setParseError] = useState("");
  const [results, setResults]     = useState(null);
  const [importing, setImporting] = useState(false);

  if (!isOpen) return null;

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith(".csv")) { setParseError("Please upload a .csv file"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const { rows, error } = parseCSV(ev.target.result);
      setParseError(error);
      setRows(rows);
      setResults(null);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const downloadTemplate = () => {
    const content = [
      "name,email,tag",
      "John Doe,john@company.com,DELL-LAP-01",
      ",jane@company.com,SONY-TV-02",
    ].join("\n");
    const blob = new Blob([content], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "assignments_import_template.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      const res = await fetch(`${API_URL}/assignments/import`, {
        method: "POST",
        credentials: "include",
        headers: authHeaders,
        body: JSON.stringify({ rows }),
      });
      const data = await res.json();
      if (data.success) { setResults(data); onImported(); }
      else setParseError(data.message || "Import failed");
    } catch {
      setParseError("Import failed. Please try again.");
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setRows([]);
    setResults(null);
    setParseError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl flex flex-col max-h-[85vh]">

        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand/10 rounded-xl flex items-center justify-center">
              <ArrowUpTrayIcon className="w-5 h-5 text-brand" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Import Assignments from CSV</h3>
              <p className="text-xs text-slate-400">Bulk-assign assets to employees in one go</p>
            </div>
          </div>
          <button onClick={handleClose} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {!results ? (
            <>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center">
                <ArrowUpTrayIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500 mb-1">Required columns:</p>
                <p className="font-mono text-xs font-semibold text-slate-700 mb-1">email, tag</p>
                <p className="text-xs text-slate-400 mb-3">
                  <span className="font-semibold">name</span> is optional ·{" "}
                  <span className="font-semibold">email</span> and{" "}
                  <span className="font-semibold">tag</span> are required
                </p>
                <div className="flex items-center justify-center gap-3">
                  <label className="cursor-pointer px-4 py-2 bg-brand text-white rounded-xl text-sm font-semibold hover:bg-brand/90 transition-colors">
                    Choose File
                    <input type="file" accept=".csv" className="hidden" onChange={handleFile} />
                  </label>
                  <button
                    onClick={downloadTemplate}
                    className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-colors"
                  >
                    Download Template
                  </button>
                </div>
              </div>

              {parseError && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
                  <ExclamationCircleIcon className="w-4 h-4 shrink-0" />
                  {parseError}
                </div>
              )}

              {rows.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    {rows.length} row{rows.length !== 1 ? "s" : ""} detected
                  </p>
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50">
                        <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          <th className="px-4 py-2.5">#</th>
                          <th className="px-4 py-2.5">Name</th>
                          <th className="px-4 py-2.5">Email</th>
                          <th className="px-4 py-2.5">Tag</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {rows.map((row, i) => {
                          const miss = (v) => v || <span className="text-red-400 italic">missing</span>;
                          return (
                            <tr key={i} className={!row.email || !row.tag ? "bg-red-50/60" : "hover:bg-slate-50"}>
                              <td className="px-4 py-2.5 text-slate-400 text-xs">{i + 1}</td>
                              <td className="px-4 py-2.5 text-slate-700">{row.name || <span className="text-slate-300 italic">—</span>}</td>
                              <td className="px-4 py-2.5 font-medium text-slate-800">{miss(row.email)}</td>
                              <td className="px-4 py-2.5 font-mono text-xs text-slate-600">{miss(row.tag)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${results.skipped === 0 ? "bg-emerald-50" : "bg-amber-50"}`}>
                  <CheckCircleIcon className={`w-5 h-5 ${results.skipped === 0 ? "text-emerald-500" : "text-amber-500"}`} />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">Import Complete</p>
                  <p className="text-xs text-slate-400">
                    {results.imported} imported, {results.skipped} skipped
                  </p>
                </div>
              </div>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="px-4 py-2.5">Email</th>
                      <th className="px-4 py-2.5">Tag</th>
                      <th className="px-4 py-2.5">Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {results.results.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-4 py-2.5 text-slate-600">{r.email}</td>
                        <td className="px-4 py-2.5 font-mono text-xs text-slate-600">{r.tag}</td>
                        <td className="px-4 py-2.5">
                          {r.status === "imported" ? (
                            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                              <CheckCircleIcon className="w-3.5 h-3.5 shrink-0" />
                              Imported
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-red-500 text-xs font-semibold">
                              <ExclamationCircleIcon className="w-3.5 h-3.5 shrink-0" />
                              {r.reason}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-3 border-t border-slate-100 shrink-0 flex items-center justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
          >
            {results ? "Close" : "Cancel"}
          </button>
          {!results && (
            <button
              onClick={handleImport}
              disabled={rows.length === 0 || !!parseError || importing}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand rounded-xl hover:bg-brand/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {importing ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <ArrowUpTrayIcon className="w-4 h-4" />
              )}
              Import {rows.length > 0 ? `${rows.length} Row${rows.length !== 1 ? "s" : ""}` : ""}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};

export default ImportAssignmentsModal;
