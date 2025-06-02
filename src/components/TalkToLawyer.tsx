
import { Scale, MapPin, Star, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Lawyer {
  id: string;
  name: string;
  firm: string;
  city: string;
  state: string;
  rating: number;
  specialties: string[];
  consultType: "free-10min" | "paid";
  featured: boolean;
  profileUrl: string;
}

const TalkToLawyer = () => {
  // Mock data - in production this would come from your database
  const lawyers: Lawyer[] = [
    {
      id: "1",
      name: "Maria Rodriguez",
      firm: "Rodriguez Immigration Law",
      city: "Miami",
      state: "FL",
      rating: 4.9,
      specialties: ["Family Immigration", "Citizenship"],
      consultType: "free-10min",
      featured: true,
      profileUrl: "#"
    },
    {
      id: "2",
      name: "David Chen",
      firm: "Chen & Associates",
      city: "San Francisco",
      state: "CA",
      rating: 4.8,
      specialties: ["Business Immigration", "H1B Visas"],
      consultType: "free-10min",
      featured: false,
      profileUrl: "#"
    },
    {
      id: "3",
      name: "Ahmed Hassan",
      firm: "Hassan Law Group",
      city: "New York",
      state: "NY",
      rating: 4.7,
      specialties: ["Asylum", "Deportation Defense"],
      consultType: "free-10min",
      featured: true,
      profileUrl: "#"
    }
  ];

  const handleConsultClick = (lawyer: Lawyer) => {
    // This would integrate with scheduling system
    console.log(`Scheduling consultation with ${lawyer.name}`);
    window.open(lawyer.profileUrl, "_blank");
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <Scale className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Talk to a Lawyer
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get personalized legal advice from vetted immigration attorneys. Free 10-minute consultations available.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lawyers.map((lawyer) => (
            <Card key={lawyer.id} className={`relative ${lawyer.featured ? 'border-emerald-500 shadow-lg' : 'border-gray-200'}`}>
              {lawyer.featured && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-emerald-500 text-white">
                    Featured
                  </Badge>
                </div>
              )}
              
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-900">
                      {lawyer.name}
                    </CardTitle>
                    <p className="text-sm text-gray-600">{lawyer.firm}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">{lawyer.rating}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <MapPin className="w-4 h-4" />
                  {lawyer.city}, {lawyer.state}
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Specialties:</p>
                  <div className="flex flex-wrap gap-1">
                    {lawyer.specialties.map((specialty, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <Button 
                  onClick={() => handleConsultClick(lawyer)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  {lawyer.consultType === "free-10min" ? "Free 10-min Consult" : "Schedule Consultation"}
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500 mb-4">
            Are you an immigration lawyer? Join our network and help people navigate their immigration journey.
          </p>
          <Button variant="outline" className="border-emerald-600 text-emerald-600 hover:bg-emerald-50">
            Become a Partner Lawyer
          </Button>
        </div>
      </div>
    </section>
  );
};

export default TalkToLawyer;
