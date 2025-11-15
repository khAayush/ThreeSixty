const TestimonialCard = ( { stars, text, name, title, company, initial, color } ) => {
    return ( 
        <div className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100 min-h-[240px] flex flex-col gap-6 hover:shadow-lg transition">
      <div className="flex items-center justify-center gap-1">
        {[...Array(stars)].map((_, i) => (
          <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
            <polygon points="9.9,1.1 12.3,6.9 18.6,7.3 13.7,11.5 15.5,17.6 9.9,14.1 4.3,17.6 6.1,11.5 1.2,7.3 7.5,6.9 " />
          </svg>
        ))}
      </div>
      <div className="text-gray-800 text-base font-normal leading-relaxed">
        "{text}"
      </div>
      <div className="flex items-center gap-4 mt-2">
        <div className={`w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-lg font-semibold`}>
          {initial}
        </div>
        <div>
          <div className="font-medium text-gray-900 text-left">{name}</div>
          <div className="text-gray-500 text-sm">{title}{company ? `, ${company}` : ""}</div>
        </div>
      </div>
    </div>
     );
}
 
export default TestimonialCard;