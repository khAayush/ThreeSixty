import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  XMarkIcon,
  MapPinIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";
import { showLoading, showSuccess, showError } from "../utils/toast";
import ConfirmModal from "../components/ConfirmModal";

const API_URL = import.meta.env.VITE_API_URL;

const Modal = ({ isOpen, onClose, title, subtitle, children, submitText, isDisabled, onSubmit }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden border border-slate-100">
        <div className="p-6 border-b border-slate-50 flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h3>
            <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
            <XMarkIcon className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          {children}
        </div>
        <div className="p-6 bg-slate-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-6 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-all">
            Cancel
          </button>
          <button 
            disabled={isDisabled}
            onClick={onSubmit}
            className={`px-6 py-2.5 text-sm font-bold text-white rounded-xl transition-all shadow-md 
              ${isDisabled ? 'bg-slate-300 cursor-not-allowed' : 'bg-brand hover:brightness-110 shadow-brand/20'}`}
          >
            {submitText}
          </button>
        </div>
      </div>
    </div>
  );
};

const EmployeeLostFound = ({ onLogout }) => {
  const [isLostModalOpen, setIsLostModalOpen] = useState(false);
  const [isFoundModalOpen, setIsFoundModalOpen] = useState(false);
  const [lostAssets, setLostAssets] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    assetCode: "",
    assetName: "",
    location: ""
  });
  const [submittingLost, setSubmittingLost] = useState(false);
  const [submittingFound, setSubmittingFound] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/lostandfound?myReports=true&status=open`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
      });
      if (!res.ok) throw new Error("Failed to fetch reports");

      const data = await res.json();
      if (data.success) {
        const lost = data.data.filter(item => item.type === "lost");
        const found = data.data.filter(item => item.type === "found");
        setLostAssets(lost);
        setFoundItems(found);
      }
    } catch (err) {
      showError("Failed to load reports");
      console.error("Fetch reports error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const closeModal = () => {
    setIsLostModalOpen(false);
    setIsFoundModalOpen(false);
    setFormData({ assetCode: "", assetName: "", location: "" });
  };

  const handleReportLost = async () => {
    const toastId = showLoading("Reporting lost asset...");
    setSubmittingLost(true);
    try {
      const res = await fetch(`${API_URL}/lostandfound`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        credentials: "include",
        body: JSON.stringify({
          assetCode: formData.assetCode,
          assetName: formData.assetName,
          location: formData.location,
          type: "lost"
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showError(data.message || "Failed to report asset", toastId);
        return;
      }
      const newItem = {
        id: data.data.id,
        assetCode: data.data.assetCode,
        assetName: data.data.assetName,
        location: data.data.location,
        type: "lost",
        createdAt: data.data.createdAt,
        status: "open"
      };
      setLostAssets([newItem, ...lostAssets]);
      showSuccess("Asset reported successfully!", toastId);
      closeModal();
    } catch (err) {
      showError("Failed to report asset", toastId);
      console.error("Report lost error:", err);
    } finally {
      setSubmittingLost(false);
    }
  };

  const handleReportFound = async () => {
    const toastId = showLoading("Reporting found item...");
    setSubmittingFound(true);
    try {
      const res = await fetch(`${API_URL}/lostandfound`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        credentials: "include",
        body: JSON.stringify({
          assetCode: formData.assetCode,
          assetName: formData.assetName,
          location: formData.location,
          type: "found"
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showError(data.message || "Failed to report item", toastId);
        return;
      }
      const newItem = {
        id: data.data.id,
        assetCode: data.data.assetCode,
        assetName: data.data.assetName,
        location: data.data.location,
        type: "found",
        createdAt: data.data.createdAt,
        status: "open"
      };
      setFoundItems([newItem, ...foundItems]);
      showSuccess("Item reported successfully!", toastId);
      closeModal();
    } catch (err) {
      showError("Failed to report item", toastId);
      console.error("Report found error:", err);
    } finally {
      setSubmittingFound(false);
    }
  };

  const cancelReport = (id) => {
    setConfirm({
      title: "Cancel Report",
      message: "Are you sure you want to cancel this report?",
      confirmLabel: "Yes, Cancel",
      danger: true,
      onConfirm: async () => {
        const toastId = showLoading("Cancelling report...");
        try {
          const res = await fetch(`${API_URL}/lostandfound/${id}/cancel`, {
            method: "PATCH",
            headers: {
              "Authorization": `Bearer ${localStorage.getItem("token")}`
            },
            credentials: "include"
          });
          if (!res.ok) throw new Error("Failed to cancel report");
          setLostAssets(lostAssets.filter(asset => asset.id !== id));
          setFoundItems(foundItems.filter(item => item.id !== id));
          showSuccess("Report cancelled successfully!", toastId);
        } catch (err) {
          showError("Failed to cancel report", toastId);
          console.error("Cancel report error:", err);
        }
      },
    });
  };

  const isLostFormValid =
    formData.assetCode.trim().length > 0 && 
    formData.assetName.trim().length > 0 && 
    formData.location.trim().length > 0;

  const isFoundFormValid = 
    formData.assetName.trim().length > 0 && 
    formData.location.trim().length > 0;

  return (
    <Layout onLogout={onLogout} >
      <main className="p-4 md:p-8 max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-800">Lost & Found</h2>
          <p className="text-slate-500 text-sm">Report lost assets or found items within the organization</p>
        </div>

        <div className="flex flex-wrap gap-4 mb-10">
          <button
            onClick={() => setIsLostModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
          >
            <MagnifyingGlassIcon className="w-5 h-5 text-slate-400" />
            Report Lost Asset
          </button>
          <button
            onClick={() => setIsFoundModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand text-white rounded-xl text-sm font-bold hover:brightness-110 transition-all shadow-md shadow-brand/20"
          >
            <PlusIcon className="w-5 h-5 stroke-2" />
            Report Found Item
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin">
                <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-500 rounded-full" />
              </div>
              <p className="text-slate-500">Loading reports...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-12">
          
          <div>
            <h3 className="text-[17px] font-bold text-[#1F2937] mb-5">My Lost Assets</h3>
            {lostAssets.length === 0 ? (
              <div className="bg-white border border-slate-100 rounded-3xl p-16 flex flex-col items-center justify-center text-center shadow-sm">
                <div className="mb-4">
                  <MagnifyingGlassIcon className="w-12 h-12 text-slate-400 stroke-1" />
                </div>
                <h4 className="text-sm font-medium text-slate-700 mb-2">No lost assets</h4>
                <p className="text-sm text-slate-400">You haven't reported any lost assets</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {lostAssets.map((asset) => (
                  <div key={asset.id} className="bg-white border border-slate-200 rounded-3xl flex flex-col shadow-sm hover:shadow-md transition-shadow">
                    
                    <div className="px-6 pt-6 pb-3 flex justify-between items-center">
                      <span className="text-[11px] font-bold text-blue-500 bg-blue-50 px-3 py-1 rounded-full tracking-wide">
                        {asset.assetCode}
                      </span>
                      <span className="text-[11px] font-bold text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full tracking-wide">
                        {asset.type.toUpperCase()}
                      </span>
                    </div>

                    <div className="px-6 py-2 grow">
                      <h4 className="text-[17px] font-bold text-[#1F2937] mb-2">{asset.assetName}</h4>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <MapPinIcon className="w-4.5 h-4.5 text-slate-400" />
                        <span>Last seen in {asset.location}</span>
                      </div>
                    </div>

                    <div className="px-6 py-4 mt-4 border-t border-slate-100 flex justify-between items-center">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reported On</span>
                        <span className="text-[11px] font-bold text-slate-600">{asset.createdAt}</span>
                      </div>
                      <button
                        onClick={() => cancelReport(asset.id)}
                        className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-[17px] font-bold text-[#1F2937] mb-5">Found Items I Reported</h3>
            {foundItems.length === 0 ? (
              <div className="bg-white border border-slate-100 rounded-3xl p-16 flex flex-col items-center justify-center text-center shadow-sm">
                <div className="mb-4">
                  <PlusIcon className="w-12 h-12 text-slate-400 stroke-1" />
                </div>
                <h4 className="text-sm font-medium text-slate-700 mb-2">No found items</h4>
                <p className="text-sm text-slate-400">You haven't reported any found items yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {foundItems.map((item) => (
                  <div key={item.id} className="bg-white border border-slate-200 rounded-3xl flex flex-col shadow-sm hover:shadow-md transition-shadow">
                    
                    <div className="px-6 pt-6 pb-3 flex justify-between items-center">
                      <span className="text-[11px] font-bold text-blue-500 bg-blue-50 px-3 py-1 rounded-full tracking-wide">
                        {item.assetCode !== "-" ? item.assetCode : "NO TAG"}
                      </span>
                      <span className="text-[11px] font-bold text-[#10b981] bg-green-50 px-3 py-1 rounded-full tracking-wide">
                        {item.type.toUpperCase()}
                      </span>
                    </div>

                    <div className="px-6 py-2 grow">
                      <h4 className="text-[17px] font-bold text-[#1F2937] mb-2">{item.assetName}</h4>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <MapPinIcon className="w-4.5 h-4.5 text-slate-400" />
                        <span>Found in {item.location}</span>
                      </div>
                    </div>

                    <div className="px-6 py-4 mt-4 border-t border-slate-100 flex justify-between items-center">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reported On</span>
                        <span className="text-[11px] font-bold text-slate-600">{item.createdAt}</span>
                      </div>
                      <button
                        onClick={() => cancelReport(item.id)}
                        className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          </div>
        )}

        <Modal
          isOpen={isLostModalOpen}
          onClose={closeModal}
          title="Report Lost Asset"
          subtitle="All fields are required to process your report"
          submitText="Report Lost"
          isDisabled={!isLostFormValid || submittingLost}
          onSubmit={handleReportLost}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Asset Code <span className="text-red-500">*</span></label>
              <input 
                name="assetCode" 
                value={formData.assetCode} 
                onChange={handleInputChange} 
                type="text" 
                placeholder="e.g., HER/IT/MOB-001" 
                className="w-full bg-slate-50 border-none rounded-xl p-3.5 text-sm outline-none transition-all" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Asset Name <span className="text-red-500">*</span></label>
              <input 
                name="assetName" 
                value={formData.assetName} 
                onChange={handleInputChange} 
                type="text" 
                placeholder="e.g., Samsung Galaxy S24" 
                className="w-full bg-slate-50 border-none rounded-xl p-3.5 text-sm outline-none transition-all" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Last Known Location <span className="text-red-500">*</span></label>
              <input 
                name="location" 
                value={formData.location} 
                onChange={handleInputChange} 
                type="text" 
                placeholder="e.g., Academics A" 
                className="w-full bg-slate-50 border-none rounded-xl p-3.5 text-sm outline-none transition-all" 
              />
            </div>
          </div>
        </Modal>

        <Modal
          isOpen={isFoundModalOpen}
          onClose={closeModal}
          title="Report Found Item"
          subtitle="Fields with * are required"
          submitText="Report Found"
          isDisabled={!isFoundFormValid || submittingFound}
          onSubmit={handleReportFound}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Asset Code (if visible)</label>
              <input 
                name="assetCode" 
                value={formData.assetCode} 
                onChange={handleInputChange} 
                type="text" 
                placeholder="e.g., HER/IT/HUB-001 (optional)" 
                className="w-full bg-slate-50 border-none rounded-xl p-3.5 text-sm outline-none transition-all" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Asset Name / Description <span className="text-red-500">*</span></label>
              <input 
                name="assetName" 
                value={formData.assetName} 
                onChange={handleInputChange} 
                type="text" 
                placeholder="Describe the item..." 
                className="w-full bg-slate-50 border-none rounded-xl p-3.5 text-sm outline-none transition-all" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5">Where You Found It <span className="text-red-500">*</span></label>
              <input 
                name="location" 
                value={formData.location} 
                onChange={handleInputChange} 
                type="text" 
                placeholder="e.g., LT-04" 
                className="w-full bg-slate-50 border-none rounded-xl p-3.5 text-sm outline-none transition-all" 
              />
            </div>
          </div>
        </Modal>
      </main>

      {confirm && (
        <ConfirmModal
          {...confirm}
          onClose={() => setConfirm(null)}
        />
      )}
    </Layout>
  );
};

export default EmployeeLostFound;