import React from 'react';
import { useNavigate } from 'react-router';
import { ShieldExclamationIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white rounded-4xl border border-slate-200 shadow-2xl shadow-slate-200/50 p-8 md:p-12 text-center">
        
        {/* Warning Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-50 text-red-500 rounded-2xl mb-8">
          <ShieldExclamationIcon className="w-12 h-12" />
        </div>

        <h2 className="text-3xl font-bold text-slate-800 mb-4">Access Denied</h2>
        <p className="text-slate-500 mb-2">
          You don't have the necessary permissions to view this page.
        </p>
        <p className="text-sm text-slate-400 mb-10 italic">
          Please contact your administrator if you believe this is an error.
        </p>

        <div className="pt-6 border-t border-slate-50">
          <button 
            onClick={() => navigate('/employee-dashboard')}
            className="w-full flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-slate-800 transition-all shadow-xl"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Return to Dashboard
          </button>
        </div>

        <div className="mt-8">
          <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">
            ThreeSixty Security Protocol
          </p>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;