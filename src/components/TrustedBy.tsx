
const TrustedBy = () => {
  const sources = [
    { name: "USCIS", logo: "🏛️" },
    { name: "Department of State", logo: "🇺🇸" },
    { name: "Migration Policy Institute", logo: "📊" },
    { name: "American Immigration Council", logo: "⚖️" },
    { name: "Immigration Prof", logo: "📚" },
    { name: "The Washington Post", logo: "📰" },
  ];

  return (
    <section className="bg-gray-900 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-8">
            Trusted Sources Include
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 items-center">
          {sources.map((source, index) => (
            <div
              key={source.name}
              className="flex flex-col items-center justify-center p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors duration-300"
            >
              <div className="text-3xl mb-3">{source.logo}</div>
              <span className="text-gray-300 font-medium text-sm text-center">
                {source.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustedBy;
