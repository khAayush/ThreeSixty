const footerLinks = [
  {
    title: 'Product',
    links: ['Features', 'Manual', 'Security', 'Roadmap', 'Changelog'],
  },
  {
    title: 'Company',
    links: ['About', 'Blog', 'Careers', 'Press', 'Partners'],
  },
  {
    title: 'Resources',
    links: ['Documentation', 'API Reference', 'Community', 'Support', 'Status'],
  },
  {
    title: 'Legal',
    links: ['Privacy', 'Terms', 'Cookie Policy', 'Licenses', 'Security'],
  },
];

const socialIcons = [
  {
    href: 'https://github.com/khAayush',
    svg: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 text-gray-400 hover:text-white transition"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.12 3.28 9.46 7.83 10.99.57.11.78-.25.78-.56v-2.18c-3.18.69-3.85-1.34-3.85-1.34-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.69.08-.69 1.16.08 1.77 1.19 1.77 1.19 1.02 1.74 2.68 1.24 3.34.94.1-.74.4-1.24.71-1.53-2.54-.29-5.22-1.27-5.22-5.65 0-1.25.44-2.28 1.16-3.09-.12-.29-.5-1.46.11-3.05 0 0 .95-.3 3.1 1.18a10.44 10.44 0 012.82-.38c.96 0 1.93.13 2.82.38 2.16-1.48 3.11-1.18 3.11-1.18.61 1.59.23 2.76.12 3.05.72.81 1.16 1.84 1.16 3.09 0 4.39-2.69 5.35-5.24 5.63.41.35.77 1.05.77 2.12v3.15c0 .31.2.67.79.56C20.73 21.45 24 17.11 24 12c0-6.27-5.23-11.5-12-11.5z" />
      </svg>
    ),
  },
];

const Footer = () => {
  return (
    <footer className="bg-[#262930] text-gray-400 pt-12 pb-4 px-8" id="footer">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:justify-between md:items-start gap-12">
        <div className="flex-1 min-w-[250px] max-w-sm">
          <div className="flex items-center mb-3 gap-2">
            <div className="w-10 h-10 flex items-center justify-center bg-blue-600 rounded-full text-white text-lg font-medium">
              360°
            </div>
            <span className="text-white text-lg font-normal">ThreeSixty</span>
          </div>
          <div className="mb-5 text-gray-400 text-[15px] leading-relaxed">
            Complete IT management simplified.
            <br />
            Track assets, manage tickets, and collaborate in real-time.
          </div>
          <div className="mb-2 text-gray-300">Get our latest updates!</div>
          <form className="flex gap-2 mb-8">
            <input
              type="email"
              className="bg-[#2e323c] border border-gray-700 px-4 py-2 rounded-lg placeholder-gray-500 text-gray-100 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Enter your email"
            />

            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium shadow-sm transition"
            >
              Subscribe
            </button>
          </form>
        </div>

        <div className="flex flex-1 justify-between flex-wrap gap-8">
          {footerLinks.map((col) => (
            <div key={col.title}>
              <div className="mb-3 text-gray-100 font-semibold">{col.title}</div>
              <ul className="flex flex-col gap-2">
                {col.links.map((link) => (
                  <li key={link} className="hover:text-white cursor-pointer transition">
                    {link}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mt-10 pt-4 border-t border-[#353840] gap-4">
        <div className="text-gray-500 text-sm">&copy; 2025 ThreeSixty. All rights reserved.</div>
        <div className="flex gap-6">
          {socialIcons.map((icon, idx) => (
            <a
              key={idx}
              href={icon.href}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:scale-110 transition"
            >
              {icon.svg}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
