import { Link } from 'react-router-dom';

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#f7f8fa]">
      <div className="pt-6 pl-8">
        <Link
          to="/"
          className="flex items-center text-gray-400 hover:text-gray-900 text-sm font-medium"
        >
          <svg
            className="mr-2 h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to home
        </Link>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="mb-7 flex flex-col items-center">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-blue-600 text-white font-medium text-lg">
              360
            </div>
            <span className="text-gray-900 text-xl font-medium">ThreeSixty</span>
          </div>
        </div>

        {children}

        <div className="mt-8 text-gray-400 text-sm text-center">
          &copy; 2025 ThreeSixty. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
