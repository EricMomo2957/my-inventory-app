import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const LandingPage = () => {
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('landingTheme') === 'dark');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [faqs, setFaqs] = useState([]);
  const [activeFaq, setActiveFaq] = useState(null);
  const canvasRef = useRef(null);

  // 1. Dark Mode Persistence
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('landingTheme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('landingTheme', 'light');
    }
  }, [isDarkMode]);

  // 2. Fetch FAQs from Database
  useEffect(() => {
    const fetchFaqs = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/faqs');
        setFaqs(res.data);
      } catch (err) {
        console.error("Failed to load FAQs:", err);
      }
    };
    fetchFaqs();
  }, []);

  // 3. Scroll Visibility Logic (Fixes showScrollBtn error)
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollBtn(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 4. Wave Engine (Canvas Logic)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
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

  // 5. Magnetic Button Effect
  const handleMagnetic = (e) => {
    const btn = e.currentTarget;
    const bounding = btn.getBoundingClientRect();
    const moveX = (e.clientX - (bounding.left + bounding.width / 2)) / 10;
    const moveY = (e.clientY - (bounding.top + bounding.height / 2)) / 10;
    btn.style.transform = `translate(${moveX}px, ${moveY}px)`;
  };

  const resetMagnetic = (e) => {
    e.currentTarget.style.transform = `translate(0px, 0px)`;
  };

  return (
    <div className={`landing-wrapper relative w-full overflow-x-hidden transition-colors duration-500 ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
      
      {/* Interactive Background */}
      <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none" />

      {/* Floating Scroll to Top */}
      {showScrollBtn && (
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 w-12 h-12 bg-[#4361ee] text-white rounded-full z-100 shadow-lg flex items-center justify-center animate-bounce"
        >
          ↑
        </button>
      )}

      {/* Navigation */}
      <nav className="flex justify-between items-center py-6 px-[8%] sticky top-0 z-50 backdrop-blur-lg border-b border-blue-500/10">
        <Link to="/" className="text-2xl font-black text-[#4361ee]">📦 Inventory Pro</Link>
        <div className="flex items-center gap-8">
          <a href="#about" className="hidden md:block hover:text-[#4361ee] font-bold transition-colors">About</a>
          <a href="#features" className="hidden md:block hover:text-[#4361ee] font-bold transition-colors">Features</a>
          <a href="#contact" className="hover:text-[#4361ee] font-bold transition-colors">Contact</a>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 transition-transform active:scale-90">
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="flex flex-col md:flex-row items-center justify-between px-[8%] py-24 min-h-[80vh] gap-12">
        <div className="max-w-xl space-y-8">
          <h1 className="text-6xl md:text-8xl font-black leading-tight">Master Your <span className="text-[#4361ee]">Stock.</span></h1>
          <p className="text-xl text-slate-500 dark:text-slate-400">The smartest way to manage inventory, track sales, and generate reports in real-time.</p>
          <Link 
            to="/order" 
            onMouseMove={handleMagnetic} 
            onMouseLeave={resetMagnetic} 
            className="inline-block bg-[#4361ee] text-white px-12 py-5 rounded-2xl font-black text-xl shadow-2xl shadow-blue-500/30 transition-all"
          >
            Get Started
          </Link>
        </div>
        <div className="relative group w-full md:w-1/2">
          {/* Fixes bg-gradient-to-r error */}
          <div className="absolute -inset-1 bg-linear-to-r from-blue-600 to-cyan-500 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
          <img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80" className="relative rounded-3xl shadow-2xl w-full" alt="Warehouse" />
        </div>
      </header>

      {/* About Section */}
      <section id="about" className="px-[8%] py-24 scroll-mt-20">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl font-black">Why Inventory Pro?</h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
              We developed Inventory Pro to eliminate the chaos of manual stock counting. Whether you are managing a single warehouse or multiple teams, our system provides the visibility you need to make smart business decisions.
            </p>
            <div className="flex gap-8 border-t border-slate-100 dark:border-slate-800 pt-8">
              <div>
                <h4 className="text-3xl font-black text-[#4361ee]">99%</h4>
                <p className="text-sm font-bold uppercase tracking-wider text-slate-400">Accuracy</p>
              </div>
              <div>
                <h4 className="text-3xl font-black text-[#4361ee]">24/7</h4>
                <p className="text-sm font-bold uppercase tracking-wider text-slate-400">Real-time</p>
              </div>
            </div>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 p-10 rounded-[40px] border border-slate-200 dark:border-slate-700">
             <h3 className="text-2xl font-bold mb-4">Enterprise Reliability</h3>
             <p className="text-slate-500 dark:text-slate-400">Built on Node.js and MySQL, our architecture is designed to handle high transaction volumes with full data integrity.</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-[8%] py-24 bg-slate-50/50 dark:bg-slate-800/10 scroll-mt-20">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: "Stock Tracking", desc: "Sync stock levels across all devices instantly.", icon: "⚡" },
            { title: "Smart Checkout", desc: "Prevents counting errors via transaction locks.", icon: "🛒" },
            { title: "Audit Trails", desc: "Automated activity logs for every single action.", icon: "📊" }
          ].map((f, i) => (
            <div key={i} className="p-10 bg-white dark:bg-slate-800 rounded-3xl shadow-xl hover:-translate-y-2 transition-all border border-slate-100 dark:border-slate-700">
              <div className="text-4xl mb-6">{f.icon}</div>
              <h3 className="text-xl font-bold mb-3">{f.title}</h3>
              <p className="text-slate-500 dark:text-slate-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="px-[8%] py-24 scroll-mt-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-black mb-12 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                <button 
                  onClick={() => setActiveFaq(activeFaq === faq.id ? null : faq.id)} 
                  className="w-full p-6 text-left flex justify-between items-center group"
                >
                  <span className="font-bold group-hover:text-[#4361ee] transition-colors">{faq.question}</span>
                  <span className={`transition-transform duration-300 ${activeFaq === faq.id ? 'rotate-180 text-[#4361ee]' : 'text-slate-400'}`}>▾</span>
                </button>
                <div className={`transition-all duration-300 ease-in-out ${activeFaq === faq.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <p className="px-6 pb-6 text-slate-500 dark:text-slate-400 border-t border-slate-50 dark:border-slate-700 pt-4">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section (Fixes formSubmitted error) */}
      <section id="contact" className="px-[8%] py-24 mb-20 scroll-mt-20">
        <div className="bg-slate-900 text-white rounded-[60px] p-12 md:p-24 relative overflow-hidden">
          <div className="grid md:grid-cols-2 gap-16 items-center relative z-10">
            <div>
              <h2 className="text-5xl font-black mb-6">Let's Connect.</h2>
              <p className="text-slate-400 text-lg mb-8">Have questions about implementation? Our team is ready to help you optimize your inventory.</p>
              <div className="space-y-2 text-slate-300 font-mono">
                <p>📍 Cebu City, PH</p>
                <p>📧 support@inventorypro.com</p>
              </div>
            </div>
            <div className="bg-white p-10 rounded-3xl text-slate-900">
              {!formSubmitted ? (
                <form onSubmit={(e) => { e.preventDefault(); setFormSubmitted(true); }} className="space-y-4">
                  <input type="text" placeholder="Your Name" required className="w-full p-4 bg-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-[#4361ee]" />
                  <input type="email" placeholder="Email Address" required className="w-full p-4 bg-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-[#4361ee]" />
                  <textarea placeholder="How can we help?" rows="4" className="w-full p-4 bg-slate-100 rounded-xl outline-none focus:ring-2 focus:ring-[#4361ee]"></textarea>
                  <button type="submit" className="w-full bg-[#4361ee] text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-all active:scale-95">
                    Send Message
                  </button>
                </form>
              ) : (
                <div className="text-center py-10">
                  <div className="text-5xl mb-4">🎉</div>
                  <h3 className="text-2xl font-bold text-green-600 mb-2">Message Received!</h3>
                  <p className="text-slate-500">We'll get back to you within 24 hours.</p>
                  <button onClick={() => setFormSubmitted(false)} className="mt-6 text-[#4361ee] font-bold">Send another</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 text-center text-slate-500 border-t border-slate-100 dark:border-slate-800">
        <p>&copy; 2026 Inventory Pro Systems. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;