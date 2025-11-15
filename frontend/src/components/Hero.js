const Hero = () => {
    return ( 
        <section className="flex flex-col md:flex-row justify-between items-center px-8 py-12 bg-[#f7f8fa]">
      
      <div className="flex-1 flex flex-col gap-7 max-w-xl">
        <div className="flex items-center gap-2 bg-white rounded-full px-3 py-1 w-max shadow-sm text-sm font-medium text-gray-600">
          <span className="h-2 w-2 bg-yellow-400 rounded-full inline-block"></span>
          Trusted by 500+ IT Teams
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-1">
            Complete IT Management,<br />
            Simplified
          </h1>
          <p className="mt-4 text-gray-600">
            ThreeSixty brings your entire IT ecosystem into one intuitive platform.
            Track assets, manage tickets, and collaborate in real-time—all from a single dashboard.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium shadow focus:outline-none transition">
            Get Started
          </button>
          <button className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-5 py-3 rounded-lg font-semibold hover:shadow transition">
            <svg width="20" height="20" fill="none" stroke="currentColor" className="mr-1" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" strokeWidth="2"/><polygon points="10,8 16,12 10,16 10,8" fill="currentColor"/></svg>
            Watch Demo
          </button>
        </div>
        <div className="flex gap-10 mt-7">
          <div>
            <div className="text-lg font-semibold text-gray-900">50K+</div>
            <div className="text-gray-500 text-sm">Assets Tracked</div>
          </div>
          <div className="border-l-2 border-gray-300 h-12 mx-4"></div>
          <div>
            <div className="text-lg font-semibold text-gray-900">99.9%</div>
            <div className="text-gray-500 text-sm">Uptime</div>
          </div>
          <div className="border-l-2 border-gray-300 h-12 mx-4"></div>
          <div>
            <div className="text-lg font-semibold text-gray-900">24/7</div>
            <div className="text-gray-500 text-sm">Support</div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex justify-center mt-10 md:mt-0 relative">

        <div className="bg-white rounded-2xl shadow-lg w-[700px] h-[500px] flex items-center justify-center overflow-hidden relative">
          <img
            src="https://www.eturns.com/media/3zplwqov/cmi-tips-cover.png?width=1400&height=700&v=1da6e60e34b4e50"
            alt="asset-management-illustration"
            className="object-cover w-full h-full"
          />

          <div className="absolute top-4 right-4 flex items-center bg-white px-4 py-2 rounded-xl text-sm shadow-md">
            <span className="h-3 w-3 bg-green-500 rounded-full block mr-2"></span>
            All Tickets Solved
          </div>

          <div className="absolute bottom-4 left-4 bg-blue-600 text-white px-5 py-2 rounded-xl font-medium text-sm shadow">
            +127<br />
            <span className="font-normal text-xs">Assets Added Today</span>
          </div>
        </div>
      </div>
    </section>
     );
}
 
export default Hero;