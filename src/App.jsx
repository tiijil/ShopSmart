import React, { useState, useEffect, useRef } from 'react'
import './App.css'
import ProductPicker from './components/ProductPicker'
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

function App() {
  const [activeSection, setActiveSection] = useState('products')
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navigation with pencil line effect */}
      <nav className="bg-gray-900 shadow-sm py-4 sticky top-0 z-40">
        <div className="container mx-auto px-4 flex justify-between items-center">
            <div className="flex items-center pl-10 md:pl-16 lg:pl-24">
              <span className="text-xl font-bold flex items-center">
                <span className="text-gray-100 font-semibold tracking-tight">Shop</span>
                <span className="text-emerald-400 font-semibold tracking-tight">Smart</span>
              </span>
            </div>
        </div>
      </nav>
      
            {/* Product Management Page */}
      <div className="py-8 flex-grow">
            <div className="container mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
            <section id="products" className="py-10 px-4">
                  <div className="container mx-auto max-w-6xl">
        <ProductPicker />
      </div>
                </section>
              </motion.div>
            </div>
      </div>
      
      {/* Simplified Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8">
        <div className="container mx-auto px-6 text-center">
          <div className="flex justify-center items-center mb-4">
            <span className="text-xl font-bold flex items-center">
              <span className="text-white font-semibold tracking-tight">Shop</span>
              <span className="text-emerald-400 font-semibold tracking-tight">Smart</span>
            </span>
                  </div>
          <p className="text-gray-400 mb-4">Streamline your e-commerce operations with our powerful product management platform.</p>
          <p className="text-gray-500 text-sm">© 2023 ShopSmart. All rights reserved.</p>
                </div>
      </footer>
    </div>
  )
}

export default App
