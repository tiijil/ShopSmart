import React, { useState, useEffect, useRef } from 'react'
import './App.css'
import ProductPicker from './components/ProductPicker'
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

function App() {
  const [activeSection, setActiveSection] = useState('home')
  const [showLearnMore, setShowLearnMore] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const [isInView, setIsInView] = useState(false)
  
  // References for scroll animations
  const heroRef = useRef(null)
  const featuresRef = useRef(null)
  
  // Use Motion's useScroll hook for scroll-linked animations
  const { scrollYProgress } = useScroll()
  const smoothScrollProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })
  
  // Transform values for parallax effects
  const heroImageY = useTransform(smoothScrollProgress, [0, 0.5], [0, -50])
  const heroTextY = useTransform(smoothScrollProgress, [0, 0.5], [0, 30])

  // Add scroll event listener to track scroll position
  useEffect(() => {
    const handleScroll = () => {
      // Use requestAnimationFrame for smoother performance
      requestAnimationFrame(() => {
        // Check if page is scrolled with a threshold
        const offset = window.scrollY
        setScrolled(offset > 50)
        
        // Calculate scroll progress for indicator with optimized calculation
        const windowHeight = window.innerHeight
        const documentHeight = document.documentElement.scrollHeight
        const scrollTop = window.scrollY || document.documentElement.scrollTop
        const maxScroll = documentHeight - windowHeight
        const scrollPercentage = Math.min(100, Math.max(0, (scrollTop / maxScroll) * 100))
        setScrollProgress(scrollPercentage)
        
        // Check if hero section is in view with improved intersection detection
        if (heroRef.current) {
          const rect = heroRef.current.getBoundingClientRect()
          const isVisible = rect.top < windowHeight && rect.bottom > 0
          
          // Only update state if visibility changed to reduce renders
          if (isVisible !== isInView) {
            setIsInView(isVisible)
          }
          
          // Determine active section based on scroll position
          const sections = ['home', 'features', 'pricing', 'testimonials']
          const sectionRefs = [heroRef, featuresRef]
          
          // Find the current active section
          for (let i = sectionRefs.length - 1; i >= 0; i--) {
            if (sectionRefs[i].current) {
              const sectionRect = sectionRefs[i].current.getBoundingClientRect()
              if (sectionRect.top < windowHeight * 0.5) {
                setActiveSection(sections[i])
                break
              }
            }
          }
        }
      })
    }

    // Add scroll event listener with passive option for better performance
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    // Initial call to set correct values on mount
    handleScroll()
    
    // Clean up event listener on component unmount
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isInView]) // Only depend on isInView to prevent unnecessary effect reruns

  // Add smooth scroll behavior to the entire page
  useEffect(() => {
    // Apply smooth scrolling with enhanced options
    document.documentElement.style.scrollBehavior = 'smooth';
    
    // Add scroll restoration behavior
    if ('scrollRestoration' in history) {
      // Keep scroll position when navigating back
      history.scrollRestoration = 'manual';
    }
    
    // Prevent scroll chaining on mobile devices
    document.body.style.overscrollBehavior = 'none';
    
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'auto';
      }
      document.body.style.overscrollBehavior = 'auto';
    };
  }, []);

  const scrollToSection = (sectionId) => {
    // Update active section immediately for better UI feedback
    setActiveSection(sectionId);
    
    if (sectionId === 'products') {
      // Special handling for products section
      const productsSection = document.getElementById('products');
      if (productsSection) {
        // Add offset to account for fixed header if needed
        const headerOffset = 80;
        const elementPosition = productsSection.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    } else {
      const section = document.getElementById(sectionId);
      if (section) {
        // Calculate offset position with header adjustment
        const headerOffset = 80;
        const elementPosition = section.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        // Use scrollTo for more control over scrolling behavior
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
  };

  const toggleLearnMore = () => {
    // Toggle with animation effect
    setShowLearnMore(prev => !prev);
    
    // Scroll to the expanded content when opening
    if (!showLearnMore) {
      setTimeout(() => {
        const learnMoreSection = document.getElementById('learn-more-content');
        if (learnMoreSection) {
          const headerOffset = 100;
          const elementPosition = learnMoreSection.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }, 100); // Small delay to allow for state update
    }
  };

  // Determine if we should show the main content or the product management page
  const showProductManagement = activeSection === 'products'
  
  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  }
  
  // Header animation variants
  const headerVariants = {
    top: { backgroundColor: "rgba(255, 255, 255, 0.8)", backdropFilter: "blur(0px)" },
    scrolled: { 
      backgroundColor: "rgba(255, 255, 255, 0.9)", 
      backdropFilter: "blur(10px)",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)"
    }
  }

  // Animation variants for Framer Motion
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6, 
        ease: [0.22, 1, 0.36, 1] 
      }
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  // Intersection observer for revealing elements on scroll
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header with improved animations */}
      <motion.header 
        className="sticky top-0 z-50 border-b border-gray-100"
        variants={headerVariants}
        initial="top"
        animate={scrolled ? "scrolled" : "top"}
        transition={{ duration: 0.3 }}
      >
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between py-5">
            {/* Logo with layout animation */}
            <div className="flex items-center">
              <motion.span 
                className="text-xl font-bold flex items-center"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, type: "spring" }}
                layout
              >
                <span className="text-gray-900 font-semibold tracking-tight">Shop</span>
                <span className="text-emerald-600 font-semibold tracking-tight">Smart</span>
                <motion.span 
                  className="ml-2 text-xs align-text-top bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-100"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                >
                  beta
                </motion.span>
              </motion.span>
            </div>
            
            <div className="flex items-center">
              {/* Navigation Menu with improved hover animations */}
              <div className="hidden md:flex space-x-8 mr-8">
                {["home", "products", "features", "pricing"].map((item, index) => (
                <motion.button
                    key={item}
                    className={`px-3 py-2 font-medium transition-all relative ${activeSection === item ? 'text-emerald-600' : 'text-gray-600 hover:text-gray-800'}`}
                    onClick={() => item === "home" ? setActiveSection('home') : scrollToSection(item)}
                    whileHover={{ y: -2, transition: { type: "spring", stiffness: 300 } }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index, duration: 0.3 }}
                  >
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                    {activeSection === item && (
                    <motion.div 
                      className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 rounded-full"
                        layoutId="navIndicator"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    ></motion.div>
                  )}
                </motion.button>
                ))}
              </div>
              
              {/* CTA Button with improved hover effect */}
              <motion.button
                className="bg-emerald-600 text-white px-5 py-2.5 rounded-full font-medium shadow-sm hover:shadow-md transition-all text-sm"
                onClick={() => scrollToSection('products')}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.3)"
                }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
              >
                Get Started
              </motion.button>
            </div>
          </div>
        </div>
        {/* Scroll Progress Indicator with spring physics */}
        <motion.div 
          className="h-0.5 bg-emerald-500" 
          style={{ scaleX: smoothScrollProgress, transformOrigin: "0% 50%" }}
        ></motion.div>
      </motion.header>
      
      {/* Main Content */}
      <AnimatePresence mode="wait">
        {!showProductManagement ? (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Hero Section with scroll-linked animations */}
            <section 
              id="home" 
              ref={heroRef}
              className="relative min-h-[90vh] flex items-center pt-12 pb-20 overflow-hidden"
            >
              {/* Background gradient elements */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-100 rounded-full opacity-30 blur-3xl"></div>
                <div className="absolute top-1/2 -left-20 w-60 h-60 bg-blue-100 rounded-full opacity-20 blur-3xl"></div>
                <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-emerald-50 rounded-full opacity-30 blur-3xl"></div>
              </div>
              
              <div className="container mx-auto px-8 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                  {/* Left Column - Text Content with staggered animations */}
                  <motion.div 
                    className="order-2 md:order-1 py-8"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    style={{ y: heroTextY }}
                  >
                    <motion.div 
                      className="inline-flex items-center bg-emerald-50 text-emerald-700 px-5 py-2 rounded-full text-sm font-medium mb-8 border border-emerald-100 shadow-sm"
                      variants={itemVariants}
                    >
                      <span className="bg-emerald-500 w-2 h-2 rounded-full mr-3"></span>
                      Simplified E-commerce Management
                    </motion.div>
                    
                    <motion.h1 
                      className="text-4xl md:text-5xl lg:text-6xl font-bold mb-10 text-gray-900 tracking-tight"
                      variants={itemVariants}
                    >
                      <div className="mb-4 leading-tight">
                        <span className="relative inline-block">
                          Manage Your
                          <motion.div 
                            className="absolute -bottom-2 left-0 right-0 h-3 bg-emerald-100 opacity-30 rounded-lg -z-10"
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                          ></motion.div>
                        </span>
                      </div>
                      <div className="leading-tight text-emerald-700">
                        <span className="relative inline-block">
                          Products With Ease
                          <motion.div 
                            className="absolute -bottom-2 left-0 right-0 h-3 bg-emerald-200 opacity-40 rounded-lg -z-10"
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ delay: 0.8, duration: 0.8, ease: "easeOut" }}
                          ></motion.div>
                        </span>
                      </div>
                    </motion.h1>
                    
                    <motion.p 
                      className="text-lg text-gray-600 mb-12 max-w-lg leading-relaxed"
                      variants={itemVariants}
                    >
                      A powerful, intuitive dashboard for streamlining your product catalog. Save time, reduce errors, and boost your sales with our smart management tools. Our AI-powered platform helps you optimize pricing, inventory, and product descriptions.
                    </motion.p>
                    
                    <motion.div 
                      className="flex flex-wrap gap-4 items-center"
                      variants={itemVariants}
                    >
                      <motion.button
                        className="bg-emerald-600 text-white px-6 py-3 rounded-full font-medium shadow-md hover:shadow-lg transition-all text-base flex items-center gap-2 group"
                        onClick={() => scrollToSection('products')}
                        whileHover={{ 
                          scale: 1.05,
                          boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.3)"
                        }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Get Started Free
                        <motion.svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="20" 
                          height="20" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                          className="transition-transform group-hover:translate-x-1"
                        >
                          <path d="M5 12h14"></path>
                          <path d="m12 5 7 7-7 7"></path>
                        </motion.svg>
                      </motion.button>
                      
                      <motion.button
                        className="text-gray-700 border border-gray-200 bg-white px-6 py-3 rounded-full font-medium hover:bg-gray-50 transition-all text-base flex items-center gap-2"
                        onClick={() => toggleLearnMore()}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <polygon points="10 8 16 12 10 16 10 8"></polygon>
                        </svg>
                        Watch Demo
                      </motion.button>
                    </motion.div>
                    
                    <motion.div 
                      className="mt-8 flex items-center gap-4"
                      variants={itemVariants}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 1.2 }}
                    >
                      <div className="flex -space-x-2">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium ${
                            ['bg-emerald-100 text-emerald-600', 'bg-blue-100 text-blue-600', 'bg-amber-100 text-amber-600'][i]
                          }`}>
                            {['JD', 'KM', 'TS'][i]}
                          </div>
                        ))}
                        <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-medium">
                          +5
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">Trusted by 2,000+ store owners</span>
                    </motion.div>
                  </motion.div>
                  
                  {/* Right Column - Dashboard Preview with parallax effect */}
                  <motion.div 
                    className="order-1 md:order-2 relative"
                    style={{ y: heroImageY }}
                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
                  >
                    <div className="relative">
                      {/* Main dashboard image */}
                      <motion.div 
                        className="relative z-10 rounded-xl shadow-2xl overflow-hidden border border-gray-200"
                        whileHover={{ y: -5, transition: { duration: 0.3 } }}
                      >
                        <div className="bg-gray-800 h-6 flex items-center px-4">
                          <div className="flex space-x-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                          </div>
                        </div>
                        <img 
                          src="/dashboard-preview.svg" 
                          alt="ShopSmart Dashboard" 
                          className="w-full h-auto"
                        />
                      </motion.div>
                      
                      {/* Decorative elements */}
                      <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-emerald-100 rounded-lg -z-10 opacity-80"></div>
                      <div className="absolute -top-6 -left-6 w-20 h-20 bg-blue-100 rounded-lg -z-10 opacity-60"></div>
                      
                      {/* Floating notification */}
                      <motion.div 
                        className="absolute -left-10 top-1/4 bg-white p-3 rounded-lg shadow-lg z-20 border border-gray-100"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1, duration: 0.5 }}
                        whileHover={{ y: -3, transition: { duration: 0.2 } }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
                              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                              <path d="m9 12 2 2 4-4"></path>
                            </svg>
                          </div>
                          <div>
                            <div className="text-xs font-medium">Sales Increased</div>
                            <div className="text-emerald-600 text-sm font-bold">+24% this month</div>
                          </div>
                        </div>
                      </motion.div>
                      
                      {/* Floating stats card */}
                      <motion.div 
                        className="absolute -right-5 bottom-1/4 bg-white p-3 rounded-lg shadow-lg z-20 border border-gray-100"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 1.2, duration: 0.5 }}
                        whileHover={{ y: -3, transition: { duration: 0.2 } }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600">
                              <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                            </svg>
                          </div>
                          <div>
                            <div className="text-xs font-medium">Inventory Status</div>
                            <div className="text-blue-600 text-sm font-bold">98% Optimized</div>
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>
                </div>
              </div>
              
              {/* Scroll indicator */}
              <motion.div 
                className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.5 }}
              >
                <motion.div 
                  className="w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center pt-2"
                  animate={{ y: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <motion.div className="w-1 h-2 bg-emerald-500 rounded-full"></motion.div>
                </motion.div>
                <p className="text-xs text-gray-500 mt-2 text-center">Scroll to explore</p>
              </motion.div>
            </section>

            {/* Features Section with scroll-triggered animations */}
            <section 
              id="features"
              className="py-32 bg-gray-50 relative overflow-hidden"
              ref={featuresRef}
            >
              {/* Background elements */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-40 -left-20 w-60 h-60 bg-emerald-50 rounded-full opacity-60 blur-3xl"></div>
                <div className="absolute bottom-20 right-10 w-80 h-80 bg-blue-50 rounded-full opacity-40 blur-3xl"></div>
              </div>
              
              <div className="container mx-auto px-8 relative z-10">
                <motion.div 
                  className="text-center mb-24"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true, amount: 0.3 }}
                >
                  <motion.div 
                    className="inline-flex items-center bg-emerald-50 text-emerald-700 px-5 py-2 rounded-full text-sm font-medium mb-8 border border-emerald-100 shadow-sm"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    viewport={{ once: true }}
                  >
                    <motion.span 
                      className="bg-emerald-500 w-2 h-2 rounded-full mr-3"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    ></motion.span>
                    Powerful Features
                  </motion.div>
                  <motion.h2 
                    className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8 text-gray-900 tracking-tight"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    viewport={{ once: true }}
                  >
                    Everything you need to <span className="text-emerald-600">succeed</span>
                  </motion.h2>
                  <motion.p 
                    className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    viewport={{ once: true }}
                  >
                    Our comprehensive suite of tools helps you manage every aspect of your e-commerce business,
                    from inventory to pricing to customer insights.
                  </motion.p>
                </motion.div>
                
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-24"
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.1 }}
                >
                  {/* Feature cards with hover animations */}
                  {[
                    {
                      icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"></path>
                          <rect x="9" y="3" width="6" height="4" rx="2"></rect>
                          <path d="M9 14h.01"></path>
                          <path d="M13 14h.01"></path>
                          <path d="M17 14h.01"></path>
                          <path d="M9 18h.01"></path>
                          <path d="M13 18h.01"></path>
                          <path d="M17 18h.01"></path>
                        </svg>
                      ),
                      color: "emerald",
                      title: "Bulk Management",
                      description: "Edit multiple products at once, saving hours of manual work and reducing the risk of errors."
                    },
                    {
                      icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 3v18h18"></path>
                          <path d="m19 9-5 5-4-4-3 3"></path>
                        </svg>
                      ),
                      color: "blue",
                      title: "Analytics Dashboard",
                      description: "Get real-time insights into your sales performance, inventory levels, and customer behavior."
                    },
                    {
                      icon: (
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                          <polyline points="3.29 7 12 12 20.71 7"></polyline>
                          <line x1="12" y1="22" x2="12" y2="12"></line>
                        </svg>
                      ),
                      color: "purple",
                      title: "AI-Powered Optimization",
                      description: "Our AI algorithms automatically suggest optimal pricing and inventory levels based on market trends."
                    },
                  ].map((feature, index) => (
                    <motion.div 
                      key={index}
                      className="bg-white rounded-2xl p-10 shadow-lg border border-gray-100 relative overflow-hidden group"
                      variants={fadeInUp}
                      whileHover={{ 
                        y: -10,
                        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
                        transition: { duration: 0.3 }
                      }}
                    >
                      {/* Decorative element */}
                      <div className={`absolute top-0 right-0 w-32 h-32 bg-${feature.color}-50 rounded-bl-full opacity-30 -mr-10 -mt-10`}></div>
                      
                      <div className={`w-16 h-16 bg-${feature.color}-100 text-${feature.color}-600 rounded-2xl flex items-center justify-center mb-8`}>
                        {feature.icon}
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900 mb-5">{feature.title}</h3>
                      <p className="text-gray-600 leading-relaxed mb-6">{feature.description}</p>
                      
                      <a href="#" className={`inline-flex items-center text-${feature.color}-600 font-medium group`}>
                        <span className="mr-2">Learn more</span>
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="16" 
                          height="16" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                          className="transition-transform group-hover:translate-x-1"
                        >
                          <path d="M5 12h14"></path>
                          <path d="m12 5 7 7-7 7"></path>
                        </svg>
                      </a>
                    </motion.div>
                  ))}
                </motion.div>
                
                {/* Feature showcase with image */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                  >
                    <div className="inline-flex items-center bg-blue-50 text-blue-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6 border border-blue-100 shadow-sm">
                      <span className="bg-blue-500 w-2 h-2 rounded-full mr-2"></span>
                      Advanced Analytics
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold mb-6 text-gray-900">Make data-driven decisions with powerful insights</h3>
                    <p className="text-gray-600 mb-8">Our advanced analytics dashboard gives you a complete view of your business performance, helping you identify trends and opportunities.</p>
                    
                    <div className="space-y-4">
                      {[
                        "Real-time sales tracking and forecasting",
                        "Customer behavior analysis and segmentation",
                        "Inventory optimization recommendations",
                        "Competitor price monitoring and alerts"
                      ].map((item, i) => (
                        <motion.div 
                          key={i} 
                          className="flex items-start"
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.1 * i, duration: 0.5 }}
                          viewport={{ once: true }}
                        >
                          <div className="bg-blue-100 text-blue-600 rounded-full p-1 mr-3 mt-0.5">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 6 9 17l-5-5"></path>
                            </svg>
                          </div>
                          <p className="text-gray-700">{item}</p>
                        </motion.div>
                      ))}
                    </div>
                    
                    <motion.button
                      className="mt-8 bg-blue-600 text-white px-6 py-3 rounded-full font-medium shadow-md hover:shadow-lg transition-all text-base flex items-center gap-2 group"
                      whileHover={{ 
                        scale: 1.05,
                        boxShadow: "0 10px 25px -5px rgba(37, 99, 235, 0.3)"
                      }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Explore Analytics
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1">
                        <path d="M5 12h14"></path>
                        <path d="m12 5 7 7-7 7"></path>
                      </svg>
                    </motion.button>
                  </motion.div>
                  
                  <motion.div
                    className="relative"
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                  >
                    <div className="relative z-10 bg-white p-4 rounded-xl shadow-xl border border-gray-200">
                      <div className="bg-gray-800 h-6 flex items-center px-4 rounded-t-lg">
                        <div className="flex space-x-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-b-lg">
                        <div className="bg-white rounded-lg p-4 shadow-sm">
                          <div className="flex justify-between items-center mb-4">
                            <h4 className="font-medium text-gray-900">Sales Performance</h4>
                            <div className="text-sm text-gray-500">Last 30 days</div>
                          </div>
                          <div className="h-40 flex items-end space-x-2">
                            {[35, 45, 30, 60, 75, 65, 75, 90, 85, 60, 70, 65].map((height, i) => (
                              <motion.div 
                                key={i} 
                                className="bg-blue-500 rounded-t w-full"
                                style={{ height: `${height}%` }}
                                initial={{ height: 0 }}
                                whileInView={{ height: `${height}%` }}
                                transition={{ delay: 0.05 * i, duration: 0.5 }}
                                viewport={{ once: true }}
                              ></motion.div>
                            ))}
                          </div>
                          <div className="flex justify-between mt-2 text-xs text-gray-500">
                            <span>Apr 1</span>
                            <span>Apr 30</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div className="bg-white p-4 rounded-lg shadow-sm">
                            <div className="text-sm text-gray-500 mb-1">Total Revenue</div>
                            <div className="text-2xl font-bold text-gray-900">$24,568</div>
                            <div className="flex items-center text-emerald-600 text-sm mt-1">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                                <path d="m18 15-6-6-6 6"></path>
                              </svg>
                              +12.5%
                            </div>
                          </div>
                          <div className="bg-white p-4 rounded-lg shadow-sm">
                            <div className="text-sm text-gray-500 mb-1">Conversion Rate</div>
                            <div className="text-2xl font-bold text-gray-900">3.2%</div>
                            <div className="flex items-center text-emerald-600 text-sm mt-1">
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                                <path d="m18 15-6-6-6 6"></path>
                              </svg>
                              +0.8%
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Decorative elements */}
                    <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-blue-100 rounded-lg -z-10 opacity-80"></div>
                    <div className="absolute -top-6 -left-6 w-24 h-24 bg-emerald-100 rounded-lg -z-10 opacity-60"></div>
                  </motion.div>
                </div>
              </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-24 bg-gray-50 relative overflow-hidden">
              {/* Background elements */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 right-0 w-80 h-80 bg-emerald-50 rounded-full opacity-40 blur-3xl"></div>
                <div className="absolute -bottom-40 -left-20 w-80 h-80 bg-blue-50 rounded-full opacity-30 blur-3xl"></div>
              </div>
              
              <div className="container mx-auto px-6 relative z-10">
                <motion.div 
                  className="text-center mb-20"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true, amount: 0.3 }}
                >
                  <motion.div 
                    className="inline-flex items-center bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6 border border-emerald-100 shadow-sm"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200 }}
                    viewport={{ once: true }}
                  >
                    <motion.span 
                      className="bg-emerald-500 w-2 h-2 rounded-full mr-2"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    ></motion.span>
                    Customer Success Stories
                  </motion.div>
                  
                  <motion.h2 
                    className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-gray-900 tracking-tight"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6 }}
                    viewport={{ once: true }}
                  >
                    What our customers <span className="text-emerald-600">say</span>
                  </motion.h2>
                  
                  <motion.p 
                    className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    viewport={{ once: true }}
                  >
                    Don't just take our word for it. Here's what store owners have to say about how ShopSmart has transformed their businesses.
                  </motion.p>
                </motion.div>
                
                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-3 gap-16"
                  variants={staggerContainer}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.1 }}
                >
                  {[
                    {
                      quote: "ShopSmart has completely transformed how we manage our online store. What used to take hours now takes minutes. The interface is intuitive and the bulk editing features are a game-changer.",
                      name: "Jane Doe",
                      role: "Fashion Boutique Owner",
                      initials: "JD",
                      color: "emerald",
                      stars: 5
                    },
                    {
                      quote: "The analytics dashboard gives me insights I never had before. I can now make data-driven decisions about pricing and inventory. Our profit margins have increased by 22% since we started using ShopSmart.",
                      name: "Michael Smith",
                      role: "Electronics Store Manager",
                      initials: "MS",
                      color: "blue",
                      stars: 5
                    },
                    {
                      quote: "As someone who manages thousands of SKUs, ShopSmart has been a lifesaver. The bulk editing and automated pricing features have cut my workload in half. Customer support is also exceptional.",
                      name: "Alex Johnson",
                      role: "Home Goods Retailer",
                      initials: "AJ",
                      color: "purple",
                      stars: 5
                    }
                  ].map((testimonial, index) => (
                    <motion.div 
                      key={index}
                      className="bg-white rounded-2xl p-10 shadow-lg border border-gray-100 relative overflow-hidden group"
                      variants={fadeInUp}
                      whileHover={{ 
                        y: -10,
                        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
                        transition: { duration: 0.3 }
                      }}
                    >
                      {/* Decorative quote mark */}
                      <div className={`absolute -right-4 -top-4 text-${testimonial.color}-50 opacity-50 text-[120px] font-serif leading-none pointer-events-none`}>
                        "
                      </div>
                      
                      <div className="flex items-center mb-10">
                        <div className="flex text-amber-400">
                          {[...Array(testimonial.stars)].map((_, i) => (
                            <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                            </svg>
                          ))}
                        </div>
                      </div>
                      
                      <p className="text-gray-600 mb-16 italic relative z-10 text-lg leading-loose">"{testimonial.quote}"</p>
                      
                      <div className="flex items-center mt-8">
                        <div className={`w-14 h-14 bg-${testimonial.color}-100 rounded-full flex items-center justify-center text-${testimonial.color}-700 font-medium mr-6`}>
                          {testimonial.initials}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 text-lg mb-3">
                            {testimonial.name}
                          </h4>
                          <p className="text-sm text-gray-500 mt-2">
                            {testimonial.role}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
                
                {/* Testimonial metrics */}
                <motion.div 
                  className="mt-40 grid grid-cols-1 md:grid-cols-4 gap-16"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  viewport={{ once: true }}
                >
                  {[
                    { value: "2,000+", label: "Active Users" },
                    { value: "98%", label: "Customer Satisfaction" },
                    { value: "30%", label: "Average Time Saved" },
                    { value: "24/7", label: "Customer Support" }
                  ].map((stat, index) => (
                    <motion.div 
                      key={index}
                      className="bg-white rounded-xl p-12 text-center border border-gray-100 shadow-sm"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index + 0.3, duration: 0.5 }}
                      viewport={{ once: true }}
                    >
                      <div className="text-4xl font-bold text-gray-900 mb-6">{stat.value}</div>
                      <div className="text-gray-500 font-medium text-lg">{stat.label}</div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </section>

            {/* CTA Section with gradient background */}
            <section className="py-32 relative overflow-hidden bg-gradient-to-br from-emerald-600 to-emerald-800">
              {/* Background elements */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid-pattern.svg')] opacity-10"></div>
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500 rounded-full opacity-20 blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-400 rounded-full opacity-20 blur-3xl"></div>
              </div>
              
              <div className="container mx-auto px-8 relative z-10">
                <motion.div 
                  className="max-w-4xl mx-auto text-center"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  viewport={{ once: true }}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    viewport={{ once: true }}
                    className="inline-flex items-center bg-white/10 text-emerald-50 px-5 py-2 rounded-full text-sm font-medium mb-8 backdrop-blur-sm border border-white/20"
                  >
                    <span className="bg-emerald-50 w-2 h-2 rounded-full mr-3"></span>
                    Limited Time Offer
                  </motion.div>
                  
                  
                  <motion.h2 
                    className="text-3xl md:text-5xl font-bold mb-8 text-white leading-tight"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    viewport={{ once: true }}
                  >
                    Start streamlining your e-commerce operations today
                  </motion.h2>
                  
                  <motion.p
                    className="text-xl text-emerald-50 opacity-90 mb-12 leading-relaxed"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.6 }}
                    viewport={{ once: true }}
                  >
                    Join thousands of successful online stores that have transformed their product management with ShopSmart.
                  </motion.p>
                  
                  <motion.div
                    className="flex flex-col sm:flex-row gap-6 justify-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    viewport={{ once: true }}
                  >
                    <a 
                      href="#" 
                      className="bg-white text-emerald-700 hover:bg-emerald-50 px-10 py-5 rounded-lg font-medium shadow-lg shadow-emerald-900/20 transition-all duration-300 group flex items-center justify-center"
                    >
                      <span className="mr-2">Get Started Free</span>
                      <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                      </svg>
                    </a>
                    <a 
                      href="#" 
                      className="border border-white/30 text-white hover:bg-white/10 px-10 py-5 rounded-lg font-medium backdrop-blur-sm transition-all duration-300"
                    >
                      Contact Sales
                    </a>
                  </motion.div>
                  
                  {/* Trust indicators */}
                  <motion.div 
                    className="mt-12 pt-12 border-t border-white/20 flex flex-col md:flex-row items-center justify-center gap-8"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.8 }}
                    viewport={{ once: true }}
                  >
                    <div className="flex items-center">
                      <div className="bg-white/10 backdrop-blur-sm p-2 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                        </svg>
                      </div>
                      <div className="ml-3 text-left">
                        <div className="text-white text-sm font-medium">Secure & Reliable</div>
                        <div className="text-emerald-100 text-xs">256-bit SSL encryption</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="bg-white/10 backdrop-blur-sm p-2 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                        </svg>
                      </div>
                      <div className="ml-3 text-left">
                        <div className="text-white text-sm font-medium">Satisfaction Guaranteed</div>
                        <div className="text-emerald-100 text-xs">30-day money back guarantee</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="bg-white/10 backdrop-blur-sm p-2 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                          <circle cx="12" cy="12" r="10"></circle>
                          <path d="M12 8v4"></path>
                          <path d="M12 16h.01"></path>
                        </svg>
                      </div>
                      <div className="ml-3 text-left">
                        <div className="text-white text-sm font-medium">24/7 Support</div>
                        <div className="text-emerald-100 text-xs">Always here to help</div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              </div>
            </section>

            {/* Learn More Section */}
            <AnimatePresence>
              {showLearnMore && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="py-20 bg-gray-50"
                >
                  <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                      <div className="inline-flex items-center bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
                        <span className="bg-emerald-500 w-2 h-2 rounded-full mr-2"></span>
                        Why Choose Us
                      </div>
                      <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">Features designed for modern e-commerce</h2>
                      <p className="text-gray-600 max-w-2xl mx-auto">Our platform combines powerful functionality with ease of use to help you manage your online store efficiently.</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                      <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all">
                        <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center mb-6">
                          <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z"></path>
                          </svg>
                        </div>
                        <h3 className="text-xl font-semibold mb-3">Intuitive Interface</h3>
                        <p className="text-gray-600">Our clean and intuitive interface makes it easy to manage your products without any technical knowledge.</p>
                      </div>
                      
                      <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all">
                        <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                          <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                          </svg>
                        </div>
                        <h3 className="text-xl font-semibold mb-3">Time-Saving</h3>
                        <p className="text-gray-600">Save hours of manual work with our bulk editing and quick discount application features.</p>
                      </div>
                      
                      <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all">
                        <div className="w-14 h-14 bg-amber-50 rounded-xl flex items-center justify-center mb-6">
                          <svg className="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                          </svg>
                        </div>
                        <h3 className="text-xl font-semibold mb-3">Flexible Discounts</h3>
                        <p className="text-gray-600">Apply percentage or fixed amount discounts to products or individual variants with just a few clicks.</p>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-2xl overflow-hidden shadow-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 items-center">
                        <div className="p-10 md:p-12">
                          <h3 className="text-2xl font-bold mb-4 text-white">Ready to streamline your product management?</h3>
                          <p className="text-emerald-50 mb-6">Join thousands of businesses that trust ShopSmart for their e-commerce needs.</p>
                          <motion.button
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            className="bg-white text-emerald-600 px-8 py-3 rounded-full font-medium transition-all text-base shadow-md flex items-center justify-center"
                            onClick={() => scrollToSection('products')}
                          >
                            <span>Get Started Free</span>
                            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                            </svg>
                          </motion.button>
                        </div>
                        <div className="hidden md:block relative h-full">
                          <div className="absolute inset-0 bg-emerald-700 opacity-20"></div>
                          <div className="absolute right-0 bottom-0 w-64 h-64 bg-emerald-400 rounded-full opacity-20 -mr-20 -mb-20"></div>
                          <div className="absolute left-0 top-0 w-32 h-32 bg-emerald-400 rounded-full opacity-20 -ml-10 -mt-10"></div>
                          <div className="p-12 relative z-10">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
                                <div className="text-4xl font-bold text-white mb-1">2K+</div>
                                <div className="text-emerald-50 text-sm">Active Users</div>
                              </div>
                              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
                                <div className="text-4xl font-bold text-white mb-1">15M+</div>
                                <div className="text-emerald-50 text-sm">Products Managed</div>
                              </div>
                              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
                                <div className="text-4xl font-bold text-white mb-1">99%</div>
                                <div className="text-emerald-50 text-sm">Satisfaction</div>
                              </div>
                              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
                                <div className="text-4xl font-bold text-white mb-1">24/7</div>
                                <div className="text-emerald-50 text-sm">Support</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.section>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            key="product-management"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="py-8 flex-grow"
          >
            {/* Product Management Page */}
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <section id="products" className={`py-10 px-4 ${activeSection === 'products' ? 'block' : 'hidden'}`}>
                  <div className="container mx-auto max-w-6xl">
                    <ProductPicker />
                  </div>
                </section>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Demo video modal with AnimatePresence for exit animations */}
      <AnimatePresence>
        {showLearnMore && (
          <>
            <motion.div 
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleLearnMore}
            >
              <motion.div 
                className="bg-white rounded-2xl p-1 w-full max-w-4xl"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 25 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative pt-[56.25%] rounded-xl overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <p className="text-gray-500">Demo Video Placeholder</p>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2">See ShopSmart in Action</h3>
                  <p className="text-gray-600 mb-4">Watch how easy it is to manage your e-commerce products with our intuitive dashboard.</p>
                  <div className="flex justify-end">
                    <motion.button 
                      className="bg-emerald-600 text-white px-5 py-2 rounded-full"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={toggleLearnMore}
                    >
                      Close
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      
      {/* Footer Section */}
      {!showProductManagement && (
        <footer className="bg-gray-900 text-gray-300 pt-16 pb-8">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
              <div>
                <div className="flex items-center mb-6">
                  <span className="text-xl font-bold flex items-center">
                    <span className="text-white font-semibold tracking-tight">Shop</span>
                    <span className="text-emerald-400 font-semibold tracking-tight">Smart</span>
                  </span>
                </div>
                <p className="text-gray-400 mb-6">Streamline your e-commerce operations with our powerful product management platform.</p>
                <div className="flex space-x-4">
                  {['twitter', 'facebook', 'instagram', 'linkedin'].map((social) => (
                    <a 
                      key={social} 
                      href="#" 
                      className="bg-gray-800 hover:bg-emerald-600 text-white p-2 rounded-full transition-colors duration-300"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {social === 'twitter' && <><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></>}
                        {social === 'facebook' && <><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></>}
                        {social === 'instagram' && <><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></>}
                        {social === 'linkedin' && <><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></>}
                      </svg>
                    </a>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-white font-semibold text-lg mb-6">Product</h3>
                <ul className="space-y-4">
                  {['Features', 'Pricing', 'Integrations', 'Changelog', 'Documentation'].map((item) => (
                    <li key={item}>
                      <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors duration-300">{item}</a>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="text-white font-semibold text-lg mb-6">Company</h3>
                <ul className="space-y-4">
                  {['About Us', 'Careers', 'Blog', 'Press', 'Partners'].map((item) => (
                    <li key={item}>
                      <a href="#" className="text-gray-400 hover:text-emerald-400 transition-colors duration-300">{item}</a>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="text-white font-semibold text-lg mb-6">Stay Updated</h3>
                <p className="text-gray-400 mb-4">Subscribe to our newsletter for the latest updates and features.</p>
                <div className="flex">
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="bg-gray-800 text-gray-200 px-4 py-2 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 w-full"
                  />
                  <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-r-lg transition-colors duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
              <div className="text-gray-500 text-sm mb-4 md:mb-0">
                &copy; {new Date().getFullYear()} ShopSmart. All rights reserved.
              </div>
              <div className="flex space-x-6">
                {['Terms', 'Privacy', 'Cookies', 'Contact'].map((item) => (
                  <a key={item} href="#" className="text-gray-500 hover:text-emerald-400 text-sm transition-colors duration-300">
                    {item}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  )
}

export default App
