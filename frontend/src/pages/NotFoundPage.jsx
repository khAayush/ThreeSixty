import React from 'react';
import { useNavigate } from 'react-router';
import { HomeIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="relative mb-8 flex justify-center">
          <div className="absolute inset-0 bg-brand/10 blur-3xl rounded-full scale-150"></div>
          <div className="relative bg-white p-6 rounded-3xl shadow-xl shadow-brand/10 border border-slate-100">
            <QuestionMarkCircleIcon className="w-20 h-20 text-brand animate-pulse" />
          </div>
        </div>

        <h1 className="text-8xl font-black text-slate-200 mb-2">404</h1>
        <h2 className="text-2xl font-bold text-slate-800 mb-4">Page Not Found</h2>
        <p className="text-slate-500 mb-8 leading-relaxed">
          Oops! The page you're looking for doesn't exist or has been moved. 
          Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => navigate(-1)}
            className="px-6 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all shadow-sm"
          >
            Go Back
          </button>
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-brand text-white font-bold rounded-xl hover:brightness-110 transition-all shadow-lg shadow-brand/20 flex items-center justify-center gap-2"
          >
            <HomeIcon className="w-5 h-5" />
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;