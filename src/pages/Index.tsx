import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import pic1 from '../../public/profile(1).png'
import pic2 from '../../public/profile(2).png'
import pic3 from '../../public/profile(3).png'
import pic4 from '../../public/profile(4).png'
import pic5 from '../../public/profile(5).png'
// Developer data array for easier management
const developers = [
  { name: "AJ Nhlapho", role: "Fullstack Developer", image: pic2 },
  { name: "FC Shabangu", role: "Backend Developer", image: pic3 },
  { name: "MATLOU NM", role: "Backend Developer", image: pic4 },
  { name: "MAKGATO TJ", role: "Frontend Developer", image: pic1 },
  { name: "NKOSI RAQ", role: "Frontend Developer", image: pic5 },
];

const Index = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-health-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  HealthHub Electronic Health Record System
                </h1>
                <p className="max-w-[600px] text-gray-500 md:text-xl dark:text-gray-400">
                  Streamline healthcare management with our comprehensive
                  electronic health record solution. Secure, efficient, and
                  patient-centered.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link to="/login">
                  <Button className="bg-health-600 hover:bg-health-700">Get Started</Button>
                </Link>
                <Link to="/about">
                  <Button variant="outline">Learn More</Button>
                </Link>
              </div>
            </div>
            <div className="flex justify-center lg:justify-end">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <button className="cursor-pointer hover:opacity-90 transition-opacity">
                    <img
                      src="https://www.myamericannurse.com/wp-content/uploads/2022/11/shutterstock_1101930905_EHRExperience-scaled.jpg"
                      alt="Healthcare splash image"
                      className="rounded-lg object-cover shadow-lg"
                      width={550}
                      height={400}
                    />
                  </button>
                </DialogTrigger>
                <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto sm:max-w-[90vw]">
                  <DialogHeader>
                    <DialogTitle>About HealthHub EHR</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div>
                      <h3 className="font-semibold mb-2">What is an EHR System?</h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        An Electronic Health Record (EHR) system is a digital version of a patient's paper chart. 
                        EHRs are real-time, patient-centered records that make information available instantly and 
                        securely to authorized users. Our HealthHub system includes:
                      </p>
                      <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-600 dark:text-gray-300">
                        <li>Comprehensive patient medical histories</li>
                        <li>Secure data storage and access</li>
                        <li>Appointment scheduling</li>
                        <li>Prescription management</li>
                        <li>Diagnosis and treatment tracking</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Development Team</h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        HealthHub EHR was developed by a talented team of software engineers:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        {developers.map((dev, index) => (
                          <div 
                            key={index}
                            className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg flex justify-between items-center transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                          >
                            <div>
                              <p className="font-medium">{dev.name}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{dev.role}</p>
                            </div>
                            <div className="relative">
                              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-health-500 shadow-md transition-all duration-300 hover:scale-110 hover:shadow-lg">
                                <img
                                  src={dev.image}
                                  alt={dev.name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </section>

      {/* Rest of your existing sections (Features, Testimonials, CTA) */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-t from-white to-health-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <div className="inline-block rounded-lg bg-health-100 px-3 py-1 text-sm text-health-800 dark:bg-health-800/20 dark:text-health-300">
                Testimonials
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Trusted by Healthcare Professionals
              </h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Don't just take our word for it. See what healthcare professionals have to say about HealthHub.
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-sm items-start gap-6 py-12 md:max-w-4xl md:grid-cols-2 lg:max-w-5xl lg:grid-cols-3">
            <div className="flex flex-col items-start gap-4 rounded-lg border p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <img
                  src="https://source.unsplash.com/KjFHeSH49Vs"
                  width={40}
                  height={40}
                  alt="Dr. Sarah Johnson"
                  className="rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold">Dr. Sarah Johnson</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Primary Care Physician
                  </p>
                </div>
              </div>
              <p className="text-gray-500 dark:text-gray-400">
                "HealthHub has completely transformed my practice. The intuitive interface and comprehensive record management make patient care more efficient and accurate."
              </p>
            </div>
            <div className="flex flex-col items-start gap-4 rounded-lg border p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <img
                  src="https://source.unsplash.com/QrEKG7_TGBE"
                  width={40}
                  height={40}
                  alt="James Wilson"
                  className="rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold">James Wilson</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Hospital Administrator
                  </p>
                </div>
              </div>
              <p className="text-gray-500 dark:text-gray-400">
                "The administrative features in HealthHub have streamlined our operations significantly. User management and reporting tools are particularly valuable for our multi-department setup."
              </p>
            </div>
            <div className="flex flex-col items-start gap-4 rounded-lg border p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <img
                  src="https://source.unsplash.com/jgYCXR7MNgk"
                  width={40}
                  height={40}
                  alt="Dr. Michelle Lee"
                  className="rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold">Dr. Michelle Lee</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Specialist Cardiologist
                  </p>
                </div>
              </div>
              <p className="text-gray-500 dark:text-gray-400">
                "As a specialist, I need detailed patient histories and test results. HealthHub delivers with comprehensive records and an excellent referral system that ensures continuity of care."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 border-t">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to Transform Your Healthcare Management?
              </h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Join thousands of healthcare providers who trust HealthHub for their electronic health record needs.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link to="/login">
                <Button className="bg-health-600 hover:bg-health-700">Get Started Today</Button>
              </Link>
              <Link to="/contact">
                <Button variant="outline">Contact Sales</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;