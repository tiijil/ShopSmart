import React, { useState, useEffect } from 'react'
import './App.css'
import ProductPicker from './components/ProductPicker'
import { motion, AnimatePresence } from 'framer-motion'

function App() {
  const [activeSection, setActiveSection] = useState('home')
  const [showLearnMore, setShowLearnMore] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  // Add scroll event listener to track scroll position
  useEffect(() => {
    const handleScroll = () => {
      // Check if page is scrolled
      const offset = window.scrollY
      if (offset > 50) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
      
      // Calculate scroll progress for indicator
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const scrollPercentage = (scrollTop / (documentHeight - windowHeight)) * 100
      setScrollProgress(scrollPercentage)
    }

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll)
    
    // Clean up
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // Add smooth scroll behavior to the entire page
  useEffect(() => {
    // Apply smooth scrolling to the entire document
    document.documentElement.style.scrollBehavior = 'smooth';
    
    return () => {
      document.documentElement.style.scrollBehavior = 'auto';
    };
  }, []);

  const scrollToSection = (sectionId) => {
    if (sectionId === 'products') {
      setActiveSection('products')
    } else {
      const section = document.getElementById(sectionId)
      if (section) {
        section.scrollIntoView({ behavior: 'smooth' })
        setActiveSection(sectionId)
      }
    }
  }

  const toggleLearnMore = () => {
    setShowLearnMore(!showLearnMore)
  }

  // Determine if we should show the main content or the product management page
  const showProductManagement = activeSection === 'products'

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between py-5">
            {/* Logo */}
            <div className="flex items-center">
              <motion.span 
                className="text-xl font-bold flex items-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <span className="text-gray-900 font-semibold tracking-tight">Shop</span>
                <span className="text-emerald-600 font-semibold tracking-tight">Smart</span>
                <span className="ml-2 text-xs align-text-top bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-100">beta</span>
              </motion.span>
            </div>
            
            <div className="flex items-center">
              {/* Navigation Menu */}
              <div className="hidden md:flex space-x-8 mr-8">
                <motion.button
                  className={`px-3 py-2 font-medium transition-all relative ${activeSection === 'home' ? 'text-emerald-600' : 'text-gray-600 hover:text-gray-800'}`}
                  onClick={() => setActiveSection('home')}
                  whileHover={{ y: -1 }}
                  whileTap={{ y: 0 }}
                >
                  Home
                  {activeSection === 'home' && (
                    <motion.div 
                      className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 rounded-full"
                      initial={{ width: 0, left: '50%' }}
                      animate={{ width: '100%', left: 0 }}
                      transition={{ duration: 0.3 }}
                    ></motion.div>
                  )}
                </motion.button>
                <motion.button
                  className={`px-3 py-2 font-medium transition-all relative ${activeSection === 'products' ? 'text-emerald-600' : 'text-gray-600 hover:text-gray-800'}`}
                  onClick={() => scrollToSection('products')}
                  whileHover={{ y: -1 }}
                  whileTap={{ y: 0 }}
                >
                  Products
                  {activeSection === 'products' && (
                    <motion.div 
                      className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 rounded-full"
                      initial={{ width: 0, left: '50%' }}
                      animate={{ width: '100%', left: 0 }}
                      transition={{ duration: 0.3 }}
                    ></motion.div>
                  )}
                </motion.button>
                <motion.button
                  className="px-3 py-2 font-medium text-gray-600 hover:text-gray-800 transition-all relative"
                  whileHover={{ y: -1 }}
                  whileTap={{ y: 0 }}
                >
                  Features
                </motion.button>
                <motion.button
                  className="px-3 py-2 font-medium text-gray-600 hover:text-gray-800 transition-all relative"
                  whileHover={{ y: -1 }}
                  whileTap={{ y: 0 }}
                >
                  Pricing
                </motion.button>
              </div>
              
              {/* CTA Button */}
              <motion.button
                className="bg-emerald-600 text-white px-5 py-2.5 rounded-full font-medium shadow-sm hover:shadow-md transition-all text-sm"
                onClick={() => scrollToSection('products')}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Get Started
              </motion.button>
            </div>
          </div>
        </div>
        {/* Scroll Progress Indicator */}
        <div className="h-0.5 bg-emerald-500" style={{ width: `${scrollProgress}%`, transition: 'width 0.2s ease' }}></div>
      </header>
      
      {/* Scroll Down Indicator (only visible on home page and when not scrolled) */}
      {activeSection === 'home' && scrollProgress < 5 && (
        <motion.div 
          className="fixed bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center cursor-pointer z-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          onClick={() => window.scrollTo({ top: window.innerHeight * 0.8, behavior: 'smooth' })}
        >
          <span className="text-sm text-gray-500 mb-2">Scroll Down</span>
          <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
          </svg>
        </motion.div>
      )}
      
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
            {/* Hero Section */}
            <section id="home" className={`min-h-[85vh] flex items-center pt-0 ${activeSection === 'home' ? 'block' : 'hidden'}`}>
              <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  {/* Left Column - Text Content */}
                  <div className="order-2 md:order-1">
                    <motion.div 
                      className="inline-flex items-center bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-medium mb-4"
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <span className="bg-emerald-500 w-2 h-2 rounded-full mr-2"></span>
                      Simplified E-commerce Management
                    </motion.div>
                    
                    <motion.h1 
                      className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-gray-900 tracking-tight leading-tight"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.2 }}
                    >
                      Manage Your <span className="relative inline-block">
                        E-commerce
                        <div className="absolute -bottom-1 left-0 w-full h-2 bg-emerald-500 rounded-full"></div>
                      </span> Products With Ease
                    </motion.h1>
                    
                    <motion.p 
                      className="text-lg text-gray-600 mb-6 leading-relaxed"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.3 }}
                    >
                      A powerful, intuitive dashboard for streamlining your product catalog. 
                      Save time, reduce errors, and boost your sales with our smart management tools.
                      Our AI-powered platform helps you optimize pricing, inventory, and product descriptions.
                    </motion.p>
                    
                    <motion.div 
                      className="flex flex-col sm:flex-row gap-4 mb-6"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: 0.4 }}
                    >
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        className="bg-emerald-600 text-white px-8 py-3.5 rounded-full font-medium transition-all text-base shadow-lg flex items-center justify-center"
                        onClick={() => scrollToSection('products')}
                      >
                        <span>Get Started Free</span>
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                        </svg>
                      </motion.button>
                      
                      <motion.button 
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        className="text-gray-700 border border-gray-300 px-8 py-3.5 rounded-full font-medium transition-all text-base flex items-center justify-center"
                        onClick={toggleLearnMore}
                      >
                        <svg className="w-5 h-5 mr-2 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                        </svg>
                        Watch Demo
                      </motion.button>
                    </motion.div>
                    
                    <motion.div 
                      className="flex items-center text-sm text-gray-500 mt-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.5 }}
                    >
                      <div className="flex -space-x-2 mr-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-xs text-emerald-700 border-2 border-white shadow-sm">JD</div>
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs text-blue-700 border-2 border-white shadow-sm">KM</div>
                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-xs text-amber-700 border-2 border-white shadow-sm">TS</div>
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-700 border-2 border-white shadow-sm">+5</div>
                      </div>
                      <span>Trusted by 2,000+ store owners</span>
                    </motion.div>
                  </div>
                  
                  {/* Right Column - Hero Image */}
                  <div className="order-1 md:order-2 flex justify-center">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.7, delay: 0.3 }}
                      className="relative"
                    >
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-blue-600 rounded-2xl blur opacity-20"></div>
                      <div className="relative bg-white p-2 rounded-2xl shadow-xl">
                        <img 
                          src="/dashboard-preview.png" 
                          alt="ShopSmart Dashboard" 
                          className="w-full h-auto rounded-xl shadow-sm"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://placehold.co/600x400/e6f7f1/1d4b40?text=ShopSmart+Dashboard";
                          }}
                        />
                      </div>
                      <div className="absolute -bottom-4 -right-4 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100 shadow-sm">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></div>
                          <span className="text-sm font-medium text-emerald-800">Live Dashboard</span>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-gradient-to-br from-emerald-50 to-white">
              <div className="container mx-auto px-6">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Trusted by thousands of e-commerce businesses</h2>
                  <p className="text-gray-600 max-w-2xl mx-auto">Join the growing community of online retailers who have transformed their business with ShopSmart.</p>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-emerald-600 mb-2">2,500+</div>
                    <div className="text-gray-600">Active Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-emerald-600 mb-2">15M+</div>
                    <div className="text-gray-600">Products Managed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-emerald-600 mb-2">99.9%</div>
                    <div className="text-gray-600">Uptime</div>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-emerald-600 mb-2">30%</div>
                    <div className="text-gray-600">Avg. Time Saved</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Features Section */}
            <section className="py-16 bg-white">
              <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                  <div className="inline-flex items-center bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
                    <span className="bg-emerald-500 w-2 h-2 rounded-full mr-2"></span>
                    Key Features
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">Everything you need to succeed</h2>
                  <p className="text-gray-600 max-w-2xl mx-auto">Our comprehensive suite of tools helps you manage every aspect of your e-commerce business.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                  <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100">
                    <div className="w-14 h-14 bg-emerald-50 rounded-xl flex items-center justify-center mb-6">
                      <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-3">Bulk Management</h3>
                    <p className="text-gray-600">Edit multiple products at once, saving hours of manual work and reducing the risk of errors.</p>
                  </div>
                  
                  <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100">
                    <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                      <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"></path>
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-3">Analytics Dashboard</h3>
                    <p className="text-gray-600">Get real-time insights into your product performance with our comprehensive analytics dashboard.</p>
                  </div>
                  
                  <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100">
                    <div className="w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center mb-6">
                      <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-3">Automated Pricing</h3>
                    <p className="text-gray-600">Set dynamic pricing rules based on inventory levels, competitor prices, and market demand.</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100">
                    <div className="w-14 h-14 bg-amber-50 rounded-xl flex items-center justify-center mb-6">
                      <svg className="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-3">Multi-Channel Integration</h3>
                    <p className="text-gray-600">Seamlessly manage products across multiple sales channels from a single dashboard.</p>
                  </div>
                  
                  <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100">
                    <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center mb-6">
                      <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-3">Inventory Alerts</h3>
                    <p className="text-gray-600">Get notified when stock levels are low or when it's time to reorder popular products.</p>
                  </div>
                  
                  <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100">
                    <div className="w-14 h-14 bg-indigo-50 rounded-xl flex items-center justify-center mb-6">
                      <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold mb-3">Secure Data</h3>
                    <p className="text-gray-600">Your product data is encrypted and backed up regularly for maximum security and peace of mind.</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-16 bg-gray-50">
              <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                  <div className="inline-flex items-center bg-emerald-50 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
                    <span className="bg-emerald-500 w-2 h-2 rounded-full mr-2"></span>
                    Testimonials
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">What our customers say</h2>
                  <p className="text-gray-600 max-w-2xl mx-auto">Don't just take our word for it. Here's what store owners have to say about ShopSmart.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="bg-white p-8 rounded-xl shadow-sm">
                    <div className="flex items-center mb-6">
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                          </svg>
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 mb-6 italic">"ShopSmart has completely transformed how we manage our online store. What used to take hours now takes minutes. The interface is intuitive and the bulk editing features are a game-changer."</p>
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-medium mr-4">JD</div>
                      <div>
                        <h4 className="font-medium text-gray-900">Jane Doe</h4>
                        <p className="text-sm text-gray-500">Fashion Boutique Owner</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-8 rounded-xl shadow-sm">
                    <div className="flex items-center mb-6">
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                          </svg>
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 mb-6 italic">"The analytics dashboard gives me insights I never had before. I can now make data-driven decisions about pricing and inventory. Our profit margins have increased by 22% since we started using ShopSmart."</p>
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-medium mr-4">MS</div>
                      <div>
                        <h4 className="font-medium text-gray-900">Michael Smith</h4>
                        <p className="text-sm text-gray-500">Electronics Store Manager</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-8 rounded-xl shadow-sm">
                    <div className="flex items-center mb-6">
                      <div className="flex text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                          </svg>
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 mb-6 italic">"As someone who manages thousands of SKUs, ShopSmart has been a lifesaver. The bulk editing and automated pricing features have cut my workload in half. Customer support is also exceptional."</p>
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-medium mr-4">AJ</div>
                      <div>
                        <h4 className="font-medium text-gray-900">Alex Johnson</h4>
                        <p className="text-sm text-gray-500">Home Goods Retailer</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-emerald-600">
              <div className="container mx-auto px-6">
                <div className="max-w-4xl mx-auto text-center">
                  <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Ready to transform your e-commerce business?</h2>
                  <p className="text-emerald-100 mb-10 text-lg">Join thousands of successful online retailers who have streamlined their operations with ShopSmart.</p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                      className="bg-white text-emerald-600 px-8 py-3.5 rounded-full font-medium transition-all text-base shadow-lg flex items-center justify-center hover:bg-emerald-50"
                      onClick={() => scrollToSection('products')}
                    >
                      <span>Get Started Free</span>
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                      </svg>
                    </button>
                    <button 
                      className="text-white border border-emerald-400 px-8 py-3.5 rounded-full font-medium transition-all text-base flex items-center justify-center hover:bg-emerald-700"
                      onClick={toggleLearnMore}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                      </svg>
                      Contact Sales
                    </button>
                  </div>
                </div>
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
    </div>
  )
}

export default App
