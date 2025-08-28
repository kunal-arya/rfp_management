import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BackgroundBeams } from "@/components/ui/aceternity/background-beams";
import { Sparkles } from "@/components/ui/aceternity/sparkles";
import { FloatingNavbar } from "@/components/ui/aceternity/floating-navbar";
import { useNavigate } from "react-router-dom";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import {
  FileText,
  Users,
  Bell,
  Search,
  Upload,
  BarChart3,
  MessageSquare,
  CheckCircle,
  ArrowRight,
  Star,
  Linkedin,
  Twitter,
  Github,
} from "lucide-react";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  // const plans = [
  //   {
  //     name: "Starter",
  //     price: "₹499",
  //     description: "Perfect for trying things out.",
  //     features: ["Basic features", "Up to 3 projects", "Email support"],
  //   },
  //   {
  //     name: "Pro",
  //     price: "₹1,999",
  //     description: "Best for growing teams and startups.",
  //     features: ["Everything in Starter", "Unlimited projects", "Priority support", "Team collaboration"],
  //     highlight: true,
  //   },
  //   {
  //     name: "Enterprise",
  //     price: "Custom",
  //     description: "Tailored solutions for large businesses.",
  //     features: ["Dedicated account manager", "Custom integrations", "24/7 support"],
  //   },
  // ];

  const features = [
    {
      icon: FileText,
      title: "RFP Lifecycle Management",
      description: "Complete workflow from creation to award with status tracking and version control.",
    },
    {
      icon: Users,
      title: "Role-Based Access Control",
      description: "Secure authentication with dynamic permissions for buyers and suppliers.",
    },
    {
      icon: Bell,
      title: "Real-time Notifications",
      description: "Instant updates via WebSocket and email notifications for all stakeholders.",
    },
    {
      icon: Search,
      title: "Advanced Search & Filtering",
      description: "Powerful search capabilities with multi-faceted filtering options.",
    },
    {
      icon: Upload,
      title: "Document Management",
      description: "Secure file uploads with version control and access management.",
    },
    {
      icon: BarChart3,
      title: "Analytics & Insights",
      description: "Comprehensive dashboards with charts and export capabilities.",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Procurement Manager",
      company: "TechCorp Inc.",
      content:
        "RFPFlow has revolutionized our procurement process. The real-time notifications and document management features are game-changers.",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Supplier Relations",
      company: "Global Solutions",
      content:
        "As a supplier, the platform makes it incredibly easy to find and respond to relevant RFPs. The interface is intuitive and professional.",
      rating: 5,
    },
    {
      name: "Emily Rodriguez",
      role: "Operations Director",
      company: "InnovateCo",
      content:
        "The analytics and reporting features provide valuable insights into our RFP performance. Highly recommended!",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen w-full bg-background p-0 m-0">
      <FloatingNavbar />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <BackgroundBeams />
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Sparkles className="inline-block mb-6">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-text-glow">
                RFPFlow
              </h1>
            </Sparkles>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-foreground mb-6">
              Streamline Your RFP Process
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Transform your Request for Proposal workflow with our comprehensive platform. 
              Connect buyers and suppliers seamlessly with real-time collaboration, 
              document management, and intelligent automation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                onClick={() => navigate("/register")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-105 hover:shadow-lg transition-transform px-8 py-3 text-lg text-white"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate("/login")}
                className="px-8 py-3 text-lg hover:scale-105 transition-transform"
              >
                Sign In
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div className="text-center mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">Powerful Features</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Everything you need to create, manage, and track RFPs efficiently.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="h-full  backdrop-blur-md rounded-2xl hover:scale-[1.02] hover:shadow-xl transition-all duration-300 border-0">
                  <CardHeader>
                    <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center shadow-lg mb-4">
                      <feature.icon className="h-7 w-7 text-white" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-6 bg-muted/30">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-12">How RFPFlow Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Create & Publish", desc: "Buyers create RFPs with documents and requirements.", icon: FileText },
              { step: "02", title: "Respond & Collaborate", desc: "Suppliers submit responses and collaborate.", icon: MessageSquare },
              { step: "03", title: "Review & Award", desc: "Buyers evaluate and award contracts.", icon: CheckCircle },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.2 }}>
                <Card className="p-6 bg-gradient-to-br from-white/5 to-muted/40 backdrop-blur-xl rounded-xl">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center mb-6">
                    <s.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{s.title}</h3>
                  <p className="text-muted-foreground">{s.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Carousel */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-12">What Our Users Say</h2>
          <Carousel className="w-full">
            <CarouselContent>
              {testimonials.map((t, i) => (
                <CarouselItem key={i} className="p-4">
                  <Card className="p-6 bg-white/10 backdrop-blur rounded-xl max-w-lg mx-auto">
                    <div className="flex items-center mb-4 justify-center">
                      {[...Array(t.rating)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 text-yellow-500 fill-current" />
                      ))}
                    </div>
                    <p className="text-muted-foreground italic mb-4">“{t.content}”</p>
                    <p className="font-semibold">{t.name}</p>
                    <p className="text-sm text-muted-foreground">{t.role} at {t.company}</p>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        </div>
      </section>

             {/* Pricing Section */}
       {/* <section id="pricing" className="py-20 bg-muted/30">
         <div className="max-w-7xl mx-auto px-6 text-center">
           <motion.div
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.8 }}
             viewport={{ once: true }}
             className="mb-16"
           >
             <h2 className="text-4xl lg:text-5xl font-bold mb-6">Simple Pricing</h2>
             <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
               Choose a plan that fits your needs. Start free and scale as you grow.
             </p>
           </motion.div>

           <div className="grid md:grid-cols-3 gap-8">
             {plans.map((plan, idx) => (
               <motion.div
                 key={idx}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 transition={{ duration: 0.5, delay: idx * 0.2 }}
                 viewport={{ once: true }}
               >
                 <Card
                   className={`h-full relative rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl ${
                     plan.highlight 
                       ? "border-2 border-purple-600 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20" 
                       : "bg-background/50 backdrop-blur-sm"
                   }`}
                 >
                   {plan.highlight && (
                     <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                       <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                         Most Popular
                       </span>
                     </div>
                   )}
                   <CardHeader className="text-center pb-4">
                     <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                     <p className="text-muted-foreground">{plan.description}</p>
                   </CardHeader>
                   <CardContent className="text-center">
                     <div className="mb-6">
                       <span className="text-4xl font-bold">{plan.price}</span>
                       {plan.price !== "Custom" && <span className="text-muted-foreground">/month</span>}
                     </div>
                     <ul className="text-left space-y-3 mb-8">
                       {plan.features.map((feature, i) => (
                         <li key={i} className="flex items-start gap-3">
                           <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                           <span className="text-sm">{feature}</span>
                         </li>
                       ))}
                     </ul>
                     <Button 
                       className={`w-full ${
                         plan.highlight 
                           ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700" 
                           : "bg-muted hover:bg-muted/80"
                       }`}
                       onClick={() => navigate("/register")}
                     >
                       {plan.highlight ? "Get Started" : "Choose Plan"}
                     </Button>
                   </CardContent>
                 </Card>
               </motion.div>
             ))}
           </div>
         </div>
       </section> */}

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white relative overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 6 }}
          className="absolute -top-20 -right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"
        />
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your RFP Process?</h2>
          <p className="text-lg mb-8">Join thousands of organizations already using RFPFlow.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3"
              onClick={() => navigate("/register")}
            >
              Start Free Trial <ArrowRight className="ml-2" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="px-8 py-3 border-white text-white hover:bg-white/20"
              onClick={() => navigate("/login")}
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-muted/50 border-t">
        <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">R</span>
              </div>
              <span className="font-bold text-xl">RFPFlow</span>
            </div>
            <p className="text-muted-foreground">Streamline your RFP process with automation.</p>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#features">Features</a></li>
              <li><a href="#">Pricing</a></li>
              <li><a href="#">Docs</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="#">About</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Blog</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Connect</h3>
            <div className="flex space-x-4 text-muted-foreground">
              <Linkedin className="hover:text-blue-600 cursor-pointer" />
              <Twitter className="hover:text-blue-400 cursor-pointer" />
              <Github className="hover:text-foreground cursor-pointer" />
            </div>
          </div>
        </div>
        <p className="text-center text-sm text-muted-foreground mt-8">© 2024 RFPFlow. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
