
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Search, Phone } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  availability: "Available" | "Busy" | "Away";
  image: string;
  rating: number;
  experience: string;
  phone: string;
}

interface DoctorListProps {
  doctors: Doctor[];
  selectedDoctor: Doctor | null;
  onDoctorSelect: (doctor: Doctor) => void;
}

const DoctorList = ({ 
  doctors, 
  selectedDoctor, 
  onDoctorSelect 
}: DoctorListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [callingDoctor, setCallingDoctor] = useState<Doctor | null>(null);
  const [showCallDialog, setShowCallDialog] = useState(false);
  const { toast } = useToast();
  
  const filteredDoctors = doctors.filter(doctor => 
    doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    doctor.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCallDoctor = (doctor: Doctor, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card selection when clicking call button
    
    if (doctor.availability !== "Available") {
      toast({
        title: "Doctor Unavailable",
        description: `${doctor.name} is currently ${doctor.availability.toLowerCase()}. Please try again later.`,
        variant: "destructive",
      });
      return;
    }
    
    setCallingDoctor(doctor);
    setShowCallDialog(true);
  };

  const handleWhatsAppCall = () => {
    if (callingDoctor) {
      const whatsappLink = `https://wa.me/${callingDoctor.phone}`;
      window.open(whatsappLink, "_blank");
      setShowCallDialog(false);
    }
  };

  const handleDirectCall = () => {
    if (callingDoctor) {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        window.location.href = `tel:${callingDoctor.phone}`;
      } else {
        toast({
          title: "Desktop Detected",
          description: "Direct calling is only available on mobile devices.",
        });
      }
      setShowCallDialog(false);
    }
  };

  return (
    <>
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-xl">Available Doctors</CardTitle>
          <CardDescription>
            Select a doctor to connect with
          </CardDescription>
          <div className="relative mt-2">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search doctors or specialties"
              className="pl-8 h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px] pr-4">
            <div className="px-4 pb-4 space-y-4">
              {filteredDoctors.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No doctors found matching your search.
                </div>
              ) : (
                filteredDoctors.map((doctor) => (
                  <Card 
                    key={doctor.id} 
                    className={`cursor-pointer hover:shadow-md transition-shadow ${
                      selectedDoctor?.id === doctor.id ? 'border-doctalk-purple ring-1 ring-doctalk-purple' : ''
                    }`}
                    onClick={() => onDoctorSelect(doctor)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <Avatar className="h-12 w-12 mr-4">
                          <AvatarImage src={doctor.image} alt={doctor.name} />
                          <AvatarFallback>
                            {doctor.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-grow">
                          <h3 className="font-semibold">{doctor.name}</h3>
                          <p className="text-sm text-gray-500">{doctor.specialty}</p>
                          <div className="flex items-center mt-1">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <svg 
                                  key={i} 
                                  className={`h-3 w-3 ${i < Math.floor(doctor.rating) ? 'text-yellow-400' : 'text-gray-300'}`} 
                                  fill="currentColor" 
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <span className="text-xs ml-1">{doctor.rating}</span>
                            <span className="text-xs text-gray-500 ml-2">• {doctor.experience}</span>
                          </div>
                        </div>
                        <Badge 
                          className={`
                            ${doctor.availability === 'Available' ? 'bg-green-500' : 
                              doctor.availability === 'Busy' ? 'bg-amber-500' : 'bg-gray-500'}
                          `}
                        >
                          {doctor.availability}
                        </Badge>
                      </div>
                      <div className="mt-3 flex space-x-2">
                        <Button 
                          size="sm" 
                          className="flex-1"
                          variant={selectedDoctor?.id === doctor.id ? "default" : "outline"}
                          disabled={doctor.availability !== "Available"}
                        >
                          {doctor.availability === "Available" ? "Connect Now" : "Unavailable"}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-none"
                          onClick={(e) => handleCallDoctor(doctor, e)}
                          disabled={doctor.availability !== "Available"}
                        >
                          <Phone className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog open={showCallDialog} onOpenChange={setShowCallDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Call {callingDoctor?.name}</DialogTitle>
            <DialogDescription>
              Choose how you would like to connect with {callingDoctor?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col space-y-3 py-4">
            <div className="flex justify-center">
              <Avatar className="h-20 w-20">
                {callingDoctor && (
                  <>
                    <AvatarImage src={callingDoctor.image} alt={callingDoctor.name} />
                    <AvatarFallback>
                      {callingDoctor.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </>
                )}
              </Avatar>
            </div>
            <p className="text-center text-sm text-gray-500">
              {callingDoctor?.specialty} • {callingDoctor?.experience}
            </p>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-center gap-2">
            <Button 
              onClick={handleWhatsAppCall}
              className="sm:flex-1 bg-green-500 hover:bg-green-600"
            >
              WhatsApp Call
            </Button>
            <Button 
              onClick={handleDirectCall}
              className="sm:flex-1"
            >
              Direct Call
            </Button>
            <Button 
              onClick={() => setShowCallDialog(false)}
              variant="outline"
              className="sm:flex-1"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DoctorList;
