import { Link } from "react-router-dom";

const login = () => {
    return ( 
        <div className="min-h-screen flex flex-col bg-[#f7f8fa]">
      <div className="pt-6 pl-8">
        <Link to="/" className="flex items-center text-gray-400 hover:text-gray-900 text-sm font-medium">
          <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to home
        </Link>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center">
        
        <div className="mb-7 flex flex-col items-center">
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-blue-600 text-white font-medium text-lg">
              360°
            </div>
            <span className="text-gray-900 text-xl font-medium">ThreeSixty</span>
          </div>
        </div>

        
        <div className="w-full max-w-md mx-auto bg-white py-8 px-8 rounded-2xl shadow border border-gray-100">
          <h2 className="text-xl mb-2 font-normal text-center text-gray-700">Welcome back</h2>

          <form>
            <div className="mb-4">
              <label className="block mb-1 text-gray-700 font-medium">Email</label>
              <input
                type="email"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                placeholder="you@company.com"
                required
              />
            </div>
            <div className="mb-2">
              <label className="block mb-1 text-gray-700 font-medium">Password</label>
              <input
                type="password"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                placeholder="Enter your password"
                required
              />
            </div>
            <div className="flex items-center justify-between mb-5">
              <label className="flex items-center text-gray-600 text-sm">
                <input type="checkbox" className="mr-2 h-4 w-4 rounded border-gray-300" />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-blue-500 hover:underline text-sm font-medium">Forgot password?</Link>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium text-base transition"
            >
              Login
            </button>
          </form>
          
          <div className="flex items-center my-6">
            <span className="flex-1 h-px bg-gray-200"></span>
            <span className="flex-1 h-px bg-gray-200"></span>
          </div>

          <button className="w-full border border-gray-200 rounded-lg py-2.5 text-gray-700 text-base font-medium hover:bg-gray-50 transition mb-4">
            Login as an Administration
          </button>

          <div className="text-center text-sm text-gray-500 mt-2">
            Don't have an account?
            <Link to="/signup" className="text-blue-500 font-medium ml-1 hover:underline">Sign up</Link>
          </div>
        </div>

        <div className="mt-8 text-gray-400 text-sm text-center">
          &copy; 2025 ThreeSixty. All rights reserved.
        </div>
      </div>
    </div>
     );
}
 
export default login;