import TestimonialCard from "./TestimonialCard";

const testimonials = [
  {
    stars: 5,
    text: "ThreeSixty has completely transformed how we manage our IT infrastructure. The asset tracking alone has saved us countless hours.",
    name: "Sabin Nepal",
    title: "IT & NOC Officer",
    company: "Herald College Kathmandu",
    initial: "SN",
    color: "#3485fd"
  },
  {
    stars: 5,
    text: "The real-time communication features have brought our distributed team together. We're resolving tickets 40% faster than before.",
    name: "Rochak Basnet",
    title: "Operations Manager",
    company: "Informatics",
    initial: "RB",
    color: "#3485fd"
  },
  {
    stars: 5,
    text: "Best decision we've made in IT tooling. The automation features alone justify the application. Highly recommended!",
    name: "Samip Gyawali",
    title: "CTO",
    company: "InnovateLabs",
    initial: "SG",
    color: "#3485fd"
  }
];

const companies = ["TechCorp", "Herald College", "InnovateLabs", "Informatics", "DataStream", "Islington College"];

const TestimonialSection = () => {
    return ( 
        <section className="py-16 px-4 md:px-10 lg:px-28 bg-[#fafbfc] text-center" id="testimonials">
      <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-600 rounded-full font-medium text-sm mb-5">
        Testimonials
      </span>
      <div className="text-xl font-medium text-gray-900 mb-2">
        Trusted by IT Leaders Worldwide
      </div>
      <div className="text-gray-500 text-base mb-12">
        See what our customers have to say about their experience with ThreeSixty.
      </div>

      <div className="flex flex-col md:flex-row gap-8 justify-center items-stretch mb-10">
        {testimonials.map((t, i) => (
          <TestimonialCard {...t} key={i} />
        ))}
      </div>

      <div className="text-gray-400 text-sm mb-3">
        Powering IT teams at leading companies
      </div>
      <div className="flex flex-wrap justify-center gap-8 text-gray-500 text-base">
        {companies.map((company, i) => (
          <span key={i}>{company}</span>
        ))}
      </div>
    </section>
     );
}
 
export default TestimonialSection;