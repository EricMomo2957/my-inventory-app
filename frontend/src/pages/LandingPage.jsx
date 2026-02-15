import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const LandingPage = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('landingTheme') === 'dark');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [faqs, setFaqs] = useState([]);
  const canvasRef = useRef(null);

  // --- 1. THEME LOGIC ---
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('landingTheme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('landingTheme', 'light');
    }
  }, [isDarkMode]);

  // --- 2. WAVE ENGINE (Optimized for Scroll) ---
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let offset = 0;
    let animationFrameId;
    let mouse = { x: -1000, y: -1000 };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    handleResize();

    const drawWaves = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const lineGap = 120;
      const rowCount = Math.ceil(canvas.height / lineGap) + 1;

      for (let i = 0; i < rowCount; i++) {
        const centerY = i * lineGap;
        ctx.beginPath();
        ctx.strokeStyle = isDarkMode ? 'rgba(67, 97, 238, 0.15)' : 'rgba(67, 97, 238, 0.08)';
        ctx.lineWidth = 1.5;

        for (let x = 0; x <= canvas.width; x += 30) {
          const dx = mouse.x - x;
          const dy = mouse.y - centerY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const bump = Math.max(0, 350 - dist) / 5;
          const y = centerY + Math.sin(x * 0.005 + offset + (i * 0.5)) * (20 + bump);
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      offset += 0.02;
      animationFrameId = requestAnimationFrame(drawWaves);
    };

    drawWaves();
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDarkMode]);

  // --- 3. DATA & SCROLL HANDLERS ---
  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/faqs');
        setFaqs(res.data);
      } catch {
        setFaqs([
          { id: 1, question: "How secure is my data?", answer: "We use end-to-end encryption for all inventory logs." },
          { id: 2, question: "Can I export reports?", answer: "Yes, all data can be exported to CSV or PDF." }
        ]);
      }
    };
    fetchFaqs();

    const handleScroll = () => setShowScrollBtn(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMagnetic = (e) => {
    const btn = e.currentTarget;
    const bounding = btn.getBoundingClientRect();
    const moveX = (e.clientX - (bounding.left + bounding.width / 2)) / 10;
    const moveY = (e.clientY - (bounding.top + bounding.height / 2)) / 10;
    btn.style.transform = `translate(${moveX}px, ${moveY}px)`;
  };

  return (
    // FIX 1: Explicitly set overflow-y: auto and ensure no height restriction
    <div className={`transition-colors duration-500 min-h-screen relative w-full overflow-y-auto ${isDarkMode ? 'bg-[#0f172a] text-slate-200' : 'bg-white text-slate-800'}`}>
      
      {/* Global CSS Inject to override any problematic body styles */}
      <style>{`
        html, body {
          margin: 0;
          padding: 0;
          height: auto !important;
          overflow-y: auto !important;
          overflow-x: hidden;
        }
      `}</style>

      {/* FIX 2: Canvas Background - pointer-events-none is vital */}
      <canvas 
        ref={canvasRef} 
        className="fixed inset-0 z-0 pointer-events-none" 
        style={{ height: '100vh', width: '100vw' }}
      />

      {/* Main Content Wrapper */}
      <div className="relative z-10 w-full flex flex-col">
        
        {/* Navigation */}
        <nav className={`flex justify-between items-center py-4 px-[8%] sticky top-0 z-50 backdrop-blur-md border-b ${isDarkMode ? 'bg-[#0f172a]/70 border-white/5' : 'bg-white/70 border-black/5'}`}>
          <Link to="/" className="text-2xl font-extrabold text-[#4361ee]">📦 Inventory Pro</Link>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#about" className="hover:text-[#4361ee] transition-colors">About</a>
            <a href="#features" className="hover:text-[#4361ee] transition-colors">Features</a>
            <a href="#faq" className="hover:text-[#4361ee] transition-colors">FAQ</a>
            <Link to="/login" onMouseMove={handleMagnetic} onMouseLeave={(e) => e.currentTarget.style.transform = 'translate(0,0)'} className="bg-[#4361ee] text-white px-6 py-2 rounded-lg font-bold">Sign In</Link>
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full border border-slate-400 text-xs">
              {isDarkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <header className="flex flex-col md:flex-row items-center justify-between px-[8%] py-20 min-h-[90vh]">
          <div className="max-w-xl">
            <h1 className="text-6xl font-extrabold mb-6 leading-tight">Master Your <span className="text-[#4361ee]">Stock Level.</span></h1>
            <p className="text-lg text-slate-500 mb-10">Real-time tracking, advanced reporting, and secure staff access for modern businesses.</p>
            <Link to="/order" className="inline-block bg-[#4361ee] text-white px-10 py-4 rounded-xl font-bold text-lg hover:scale-105 transition-transform">Order Now</Link>
          </div>
          <div className="w-full md:w-1/2 mt-12 md:mt-0">
            <img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80" className="rounded-3xl shadow-2xl" alt="Dashboard" />
          </div>
        </header>

        {/* Mission Section */}
        <section id="about" className="px-[8%] py-32">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <img src="https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=800&q=80" className="rounded-3xl" alt="Warehouse" />
            <div className={`p-12 rounded-[40px] border backdrop-blur-md ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white/80 border-black/5'}`}>
              <h2 className="text-4xl font-bold mb-6">Our Mission</h2>
              <p className="text-xl text-slate-500 leading-relaxed">We empower businesses with enterprise-grade tools to eliminate manual stock counting and maximize operational efficiency.</p>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="px-[8%] py-32 bg-slate-50/50 dark:bg-slate-900/50">
          <h2 className="text-4xl font-bold text-center mb-16">Optimized Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {["⚡ Real-time Tracking", "📊 Advanced Reports", "🛡️ Secure Access"].map((item, i) => (
              <div key={i} className={`p-10 rounded-3xl border transition-all hover:-translate-y-2 ${isDarkMode ? 'bg-slate-800 border-white/10' : 'bg-white border-black/5'}`}>
                <h3 className="text-xl font-bold mb-4">{item}</h3>
                <p className="text-slate-500">Industry-leading performance and reliability for your inventory management.</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="px-[8%] py-32 max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">FAQs</h2>
          <div className="space-y-6">
            {faqs.map(f => (
              <div key={f.id} className={`p-8 rounded-2xl border-l-4 border-[#4361ee] ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'}`}>
                <h4 className="font-bold text-lg mb-2">{f.question}</h4>
                <p className="text-slate-500">{f.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="px-[8%] py-32">
          <div className={`p-12 md:p-20 rounded-[50px] border shadow-2xl ${isDarkMode ? 'bg-slate-900 border-white/5' : 'bg-white border-black/5'}`}>
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h2 className="text-5xl font-extrabold mb-6">Get In Touch</h2>
                <p className="text-xl text-slate-500 mb-4">📍 T.Padilla, Cebu City, PH</p>
                <p className="text-xl text-slate-500">📧 support@inventorypro.com</p>
              </div>
              {!formSubmitted ? (
                <form onSubmit={(e) => { e.preventDefault(); setFormSubmitted(true); }} className="space-y-4">
                  <input placeholder="Name" required className="w-full p-4 rounded-xl border bg-transparent" />
                  <input type="email" placeholder="Email" required className="w-full p-4 rounded-xl border bg-transparent" />
                  <textarea placeholder="Message" rows="4" className="w-full p-4 rounded-xl border bg-transparent" />
                  <button type="submit" className="w-full bg-[#4361ee] text-white py-4 rounded-xl font-bold text-lg">Send Message</button>
                </form>
              ) : (
                <div className="bg-green-500/10 p-8 rounded-2xl text-center border border-green-500/20">
                  <h3 className="text-2xl font-bold text-green-500">Message Sent Successfully!</h3>
                </div>
              )}
            </div>
          </div>
        </section>

        <footer className="py-12 text-center text-slate-500 border-t border-black/5 dark:border-white/5">
          <p>&copy; 2026 Inventory Pro Systems. All rights reserved.</p>
        </footer>
      </div>

      {/* Scroll to Top Button */}
      {showScrollBtn && (
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
          className="fixed bottom-10 right-10 w-14 h-14 bg-[#4361ee] text-white rounded-full shadow-2xl z-50 flex items-center justify-center font-bold hover:scale-110 transition-transform"
        >
          ↑
        </button>
      )}
    </div>
  );
};

export default LandingPage;