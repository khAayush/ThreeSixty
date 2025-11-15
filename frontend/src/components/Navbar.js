import React, { useState, useEffect } from "react";

const Navbar = () => {
   const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);  
  
  return ( 
    <nav
      className={`transition-all duration-300 ${
        isSticky
          ? 'fixed flex items-center justify-between px-8 py-4 w-full z-50 bg-white shadow'
          : 'flex items-center justify-between px-8 py-4 bg-white shadow-sm'
      }`}
    >
        <div className="flex items-center gap-2">
        <div className="w-10 h-10 flex items-center justify-center bg-blue-600 rounded-full">
          <span className="text-white font-medium text-lg">360°</span>
        </div>
        <span className="text-gray-900 text-lg font-normal">ThreeSixty</span>
      </div>

      <div className="flex gap-12">
        <a href="/" className="text-gray-500 hover:text-gray-900 transition">Home</a>
        <a href="#features" className="text-gray-500 hover:text-gray-900 transition">Features</a>
        <a href="#testimonials" className="text-gray-500 hover:text-gray-900 transition">Testimonials</a>
        <a href="#footer" className="text-gray-500 hover:text-gray-900 transition">About</a>
      </div>

      <div className="flex items-center gap-4">
        <a href="/signin" className="text-gray-700 hover:text-gray-900 transition">Sign Up</a>
        <a href="/signup" className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-5 py-2 transition font-medium">
          Login
        </a>
      </div>
    </nav>

     );
}
 
export default Navbar;