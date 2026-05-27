import React, { useState, useEffect, useRef } from "react";
import Layout from "../components/Layout";
import {
  BuildingOffice2Icon,
  EnvelopeIcon,
  NoSymbolIcon,
  PlusIcon,
  XMarkIcon,
  SwatchIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL;

const PRESET_COLORS = [
  { name: "Orange", value: "#FF5C00" },
  { name: "Blue", value: "#3B82F6" },
  { name: "Indigo", value: "#6366F1" },
  { name: "Purple", value: "#8B5CF6" },
  { name: "Green", value: "#10B981" },
  { name: "Red", value: "#EF4444" },
  { name: "Pink", value: "#EC4899" },
  { name: "Teal", value: "#14B8A6" },
];

const TagInput = ({ tags, onAdd, onRemove, placeholder, saving }) => {
  const [input, setInput] = useState("");

  const commit = () => {
    const value = input.trim();
    if (value && !tags.includes(value)) {
      onAdd(value);
      setInput("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit();
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-3 py-1 text-sm"
          >
            {tag}
            <button
              type="button"
              onClick={() => onRemove(tag)}
              disabled={saving}
              className="ml-1 text-blue-400 hover:text-blue-700 disabled:opacity-40"
            >
              <XMarkIcon className="w-3.5 h-3.5" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={saving}
          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 outline-none disabled:opacity-50"
        />
        <button
          type="button"
          onClick={commit}
          disabled={saving || !input.trim()}
          className="flex items-center gap-1 px-3 py-2 bg-brand text-white rounded-lg text-sm hover:bg-brand/90 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          <PlusIcon className="w-4 h-4" />
          {saving ? "Saving…" : "Add"}
        </button>
      </div>
    </div>
  );
};

const SettingsPage = ({ onLogout }) => {
  const [loading, setLoading] = useState(true);

  const [organizationName, setOrganizationName] = useState("");
  const [savingOrg, setSavingOrg] = useState(false);

  const [brandColor, setBrandColor] = useState("#FF5C00");
  const [customColor, setCustomColor] = useState(
    () => localStorage.getItem("customBrandColor") || "#FF5C00"
  );
  const [savingColor, setSavingColor] = useState(false);

  const [allowedEmailDomains, setAllowedEmailDomains] = useState([]);
  const [savingDomains, setSavingDomains] = useState(false);

  const [filteredEmailNames, setFilteredEmailNames] = useState([]);
  const [savingNames, setSavingNames] = useState(false);

  const colorInputRef = useRef(null);

  const token = localStorage.getItem("token");
  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_URL}/settings`, {
          credentials: "include",
          headers: authHeaders,
        });
        if (!res.ok) throw new Error();
        const data = await res.json();
        setOrganizationName(data.settings.organizationName || "");
        setAllowedEmailDomains(data.settings.allowedEmailDomains || []);
        setFilteredEmailNames(data.settings.filteredEmailNames || []);
        setBrandColor(data.settings.brandColor || "#FF5C00");
      } catch {
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const patch = async (fields) => {
    const res = await fetch(`${API_URL}/settings`, {
      method: "PATCH",
      credentials: "include",
      headers: authHeaders,
      body: JSON.stringify(fields),
    });
    if (!res.ok) throw new Error();
  };

  const saveOrgName = async () => {
    if (!organizationName.trim()) {
      toast.error("Organization name cannot be empty");
      return;
    }
    setSavingOrg(true);
    try {
      await patch({ organizationName: organizationName.trim() });
      toast.success("Organization name saved");
    } catch {
      toast.error("Failed to save organization name");
    } finally {
      setSavingOrg(false);
    }
  };

  // Used by color options
  const previewColor = (color) => {
    setBrandColor(color);
    document.documentElement.style.setProperty("--color-brand", color);
  };

  // Used by the color picker
  const handleCustomColorChange = (color) => {
    setCustomColor(color);
    localStorage.setItem("customBrandColor", color);
    previewColor(color);
  };

  const applyBrandColor = async () => {
    setSavingColor(true);
    try {
      await patch({ brandColor });
      localStorage.setItem("brandColor", brandColor);
      toast.success("Brand color applied");
    } catch {
      toast.error("Failed to apply brand color");
    } finally {
      setSavingColor(false);
    }
  };

  const handleAddDomain = async (value) => {
    const updated = [...allowedEmailDomains, value];
    setAllowedEmailDomains(updated);
    setSavingDomains(true);
    try {
      await patch({ allowedEmailDomains: updated });
      toast.success("Domain added");
    } catch {
      setAllowedEmailDomains(allowedEmailDomains);
      toast.error("Failed to add domain");
    } finally {
      setSavingDomains(false);
    }
  };

  const handleRemoveDomain = async (value) => {
    const updated = allowedEmailDomains.filter((d) => d !== value);
    setAllowedEmailDomains(updated);
    setSavingDomains(true);
    try {
      await patch({ allowedEmailDomains: updated });
      toast.success("Domain removed");
    } catch {
      setAllowedEmailDomains(allowedEmailDomains);
      toast.error("Failed to remove domain");
    } finally {
      setSavingDomains(false);
    }
  };

  const handleAddName = async (value) => {
    const updated = [...filteredEmailNames, value];
    setFilteredEmailNames(updated);
    setSavingNames(true);
    try {
      await patch({ filteredEmailNames: updated });
      toast.success("Prefix blocked");
    } catch {
      setFilteredEmailNames(filteredEmailNames);
      toast.error("Failed to add prefix");
    } finally {
      setSavingNames(false);
    }
  };

  const handleRemoveName = async (value) => {
    const updated = filteredEmailNames.filter((n) => n !== value);
    setFilteredEmailNames(updated);
    setSavingNames(true);
    try {
      await patch({ filteredEmailNames: updated });
      toast.success("Prefix unblocked");
    } catch {
      setFilteredEmailNames(filteredEmailNames);
      toast.error("Failed to remove prefix");
    } finally {
      setSavingNames(false);
    }
  };

  const isPresetActive = PRESET_COLORS.some(
    (c) => c.value.toLowerCase() === brandColor.toLowerCase()
  );
  const customSelected =
    !isPresetActive && brandColor.toLowerCase() === customColor.toLowerCase();

  return (
    <Layout onLogout={onLogout}>
      <div className="max-w-2xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Settings</h1>
        <p className="text-gray-500 text-sm mb-8">
          Manage organization-wide configuration. Changes take effect immediately.
        </p>

        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading settings…</div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-blue-50">
                  <BuildingOffice2Icon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-base font-medium text-gray-800">Organization Name</h2>
                  <p className="text-xs text-gray-400">Displayed in the app header</p>
                </div>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveOrgName()}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 outline-none"
                  placeholder="e.g. Herald College Kathmandu"
                />
                <button
                  type="button"
                  onClick={saveOrgName}
                  disabled={savingOrg}
                  className="px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand/90 disabled:opacity-60 disabled:cursor-not-allowed transition"
                >
                  {savingOrg ? "Saving…" : "Save"}
                </button>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-orange-50">
                  <SwatchIcon className="w-5 h-5 text-orange-500" />
                </div>
                <div>
                  <h2 className="text-base font-medium text-gray-800">Brand Color</h2>
                  <p className="text-xs text-gray-400">
                    Primary color used for buttons, links, and highlights
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mb-4">
                {PRESET_COLORS.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    title={c.name}
                    onClick={() => previewColor(c.value)}
                    className="relative w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 outline-none"
                    style={{
                      backgroundColor: c.value,
                      borderColor:
                        brandColor.toLowerCase() === c.value.toLowerCase()
                          ? c.value
                          : "transparent",
                      boxShadow:
                        brandColor.toLowerCase() === c.value.toLowerCase()
                          ? `0 0 0 3px white, 0 0 0 5px ${c.value}`
                          : "none",
                    }}
                  >
                    {brandColor.toLowerCase() === c.value.toLowerCase() && (
                      <CheckIcon className="w-4 h-4 text-white absolute inset-0 m-auto drop-shadow" />
                    )}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      previewColor(customColor);
                      colorInputRef.current?.click();
                    }}
                    className="relative w-10 h-10 rounded-xl border-2 cursor-pointer hover:border-gray-400 transition shadow-sm overflow-hidden shrink-0"
                    style={{
                      backgroundColor: customColor,
                      borderColor: customSelected ? customColor : "#e5e7eb",
                      boxShadow: customSelected
                        ? `0 0 0 3px white, 0 0 0 5px ${customColor}`
                        : "none",
                    }}
                    title="Pick a custom color"
                  >
                    {customSelected && (
                      <CheckIcon className="w-4 h-4 text-white absolute inset-0 m-auto drop-shadow" />
                    )}
                  </button>
                  <input
                    ref={colorInputRef}
                    type="color"
                    value={customColor}
                    onChange={(e) => handleCustomColorChange(e.target.value)}
                    className="sr-only"
                  />
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Select Custom color</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={applyBrandColor}
                  disabled={savingColor}
                  className="px-4 py-2 bg-brand text-white rounded-lg text-sm font-medium hover:bg-brand/90 disabled:opacity-60 disabled:cursor-not-allowed transition shrink-0"
                >
                  {savingColor ? "Applying…" : "Apply"}
                </button>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-green-50">
                  <EnvelopeIcon className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h2 className="text-base font-medium text-gray-800">Allowed Email Domains</h2>
                  <p className="text-xs text-gray-400">
                    Only users with these domains can register via Google. Leave empty to allow all.
                  </p>
                </div>
              </div>
              <TagInput
                tags={allowedEmailDomains}
                onAdd={handleAddDomain}
                onRemove={handleRemoveDomain}
                placeholder="e.g. heraldcollege.edu.np  (Enter or , to add)"
                saving={savingDomains}
              />
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-50">
                  <NoSymbolIcon className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h2 className="text-base font-medium text-gray-800">Blocked Email Prefixes</h2>
                  <p className="text-xs text-gray-400">
                    Email usernames (before @) that are blocked from registering or logging in.
                  </p>
                </div>
              </div>
              <TagInput
                tags={filteredEmailNames}
                onAdd={handleAddName}
                onRemove={handleRemoveName}
                placeholder="e.g. test, np03  (Enter or , to add)"
                saving={savingNames}
              />
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SettingsPage;
