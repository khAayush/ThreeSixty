const FeatureCard = ( { icon, title, description, color } ) => {
    return ( 
        <div className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100 flex flex-col items-start gap-4 min-h-[200px] hover:shadow-lg transition">
      <div className={`rounded-xl p-3 bg-opacity-20`} style={{ backgroundColor: color }}>
        {icon}
      </div>
      <div className="font-semibold text-gray-900">{title}</div>
      <div className="text-gray-500 text-sm">{description}</div>
    </div>
     );
}
 
export default FeatureCard;