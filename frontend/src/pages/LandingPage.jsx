import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const LandingPage = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('landingTheme') === 'dark';
  });
  
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [faqs, setFaqs] = useState([]);
  const [activeFaq, setActiveFaq] = useState(null);
  const canvasRef = useRef(null);

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

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollBtn(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <div className={`landing-wrapper relative w-full overflow-x-hidden transition-colors duration-500 min-h-screen ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'}`}>
      
      <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none" />

      {showScrollBtn && (
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 w-12 h-12 bg-[#4361ee] text-white rounded-full z-50 shadow-lg flex items-center justify-center animate-bounce hover:scale-110 transition-transform"
        >
          ↑
        </button>
      )}

      {/* Navigation */}
      <nav className="flex justify-between items-center py-6 px-[8%] sticky top-0 z-50 backdrop-blur-lg border-b border-blue-500/10">
        <Link to="/" className="text-2xl font-black text-[#4361ee] tracking-tighter italic">📦 Inventory Pro</Link>
        <div className="flex items-center gap-4 md:gap-8">
          <a href="#about" className="hidden lg:block hover:text-[#4361ee] font-bold transition-colors">About</a>
          <a href="#features" className="hidden md:block hover:text-[#4361ee] font-bold transition-colors">Features</a>
          <a href="#faq" className="hidden md:block hover:text-[#4361ee] font-bold transition-colors">Questions</a>
          <a href="#contact" className="hidden sm:block hover:text-[#4361ee] font-bold transition-colors">Contact</a>
          
          <Link to="/login" className={`px-6 py-2 rounded-xl font-bold transition-all border ${isDarkMode ? 'border-slate-700 hover:bg-slate-800 text-white' : 'border-slate-200 hover:bg-slate-50 text-slate-900'}`}>
            Login
          </Link>

          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 transition-all hover:scale-110 active:scale-90">
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </nav>

      {/* Hero */}
      <header className="flex flex-col md:flex-row items-center justify-between px-[8%] py-24 min-h-[85vh] gap-12">
        <div className="max-w-xl space-y-8">
          <h1 className="text-6xl md:text-8xl font-black leading-tight tracking-tighter">Master Your <span className="text-[#4361ee]">Stock.</span></h1>
          <p className="text-xl text-slate-500 dark:text-slate-400 font-medium">The smartest way to manage inventory in real-time.</p>
          <Link to="/order" onMouseMove={handleMagnetic} onMouseLeave={resetMagnetic} className="inline-block bg-[#4361ee] text-white px-12 py-5 rounded-2xl font-black text-xl shadow-2xl transition-all">
            Get Started
          </Link>
        </div>
        <div className="relative group w-full md:w-1/2">
          <div className="absolute -inset-1 bg-linear-to-r from-blue-600 to-cyan-500 rounded-3xl blur opacity-25"></div>
          <img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80" className="relative rounded-3xl shadow-2xl w-full object-cover h-112.5" alt="Warehouse" />
        </div>
      </header>

      {/* About */}
      <section id="about" className="px-[8%] py-24 scroll-mt-20">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl font-black">Why Inventory Pro?</h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
              We developed Inventory Pro to eliminate the chaos of manual counting.
            </p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/30 p-10 rounded-[40px] border border-slate-200 dark:border-slate-700">
             <h3 className="text-2xl font-black mb-4">Enterprise Reliability</h3>
             <p className="text-slate-500 dark:text-slate-400 font-medium">Built for high transaction volumes.</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-[8%] py-24 bg-slate-50/50 dark:bg-slate-800/10 scroll-mt-20">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: "Stock Tracking", desc: "Sync levels across all devices.", icon: "⚡" },
            { title: "Smart Checkout", desc: "Prevents counting errors.", icon: "🛒" },
            { title: "Audit Trails", desc: "Automated activity logs.", icon: "📊" }
          ].map((f, i) => (
            <div key={i} className="p-10 bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700">
              <div className="text-5xl mb-6">{f.icon}</div>
              <h3 className="text-xl font-black mb-3">{f.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ SECTION - RESTORED */}
      <section id="faq" className="px-[8%] py-24 scroll-mt-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-black mb-12 text-center">Questions?</h2>
          <div className="space-y-4">
            {faqs.length > 0 ? (
              faqs.map((faq) => (
                <div key={faq.id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:border-blue-500/50 transition-colors">
                  <button 
                    onClick={() => setActiveFaq(activeFaq === faq.id ? null : faq.id)} 
                    className="w-full p-6 text-left flex justify-between items-center group"
                  >
                    <span className={`font-bold transition-colors ${activeFaq === faq.id ? 'text-[#4361ee]' : 'group-hover:text-[#4361ee]'}`}>
                      {faq.question}
                    </span>
                    <span className={`text-2xl transition-transform duration-300 ${activeFaq === faq.id ? 'rotate-180 text-[#4361ee]' : 'text-slate-400'}`}>
                      ▾
                    </span>
                  </button>
                  <div className={`transition-all duration-300 ease-in-out ${activeFaq === faq.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'}`}>
                    <div className="px-6 pb-6 pt-2 border-t border-slate-50 dark:border-slate-700/50">
                      <p className="text-slate-500 dark:text-slate-400 font-medium">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-slate-400">Loading common questions...</p>
            )}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="px-[8%] py-24 mb-20 scroll-mt-20">
        <div className="bg-slate-900 text-white rounded-[60px] p-12 md:p-24 relative overflow-hidden">
          {!formSubmitted ? (
            <form onSubmit={(e) => { e.preventDefault(); setFormSubmitted(true); }} className="max-w-md mx-auto space-y-4 relative z-10">
              <h2 className="text-4xl font-black text-center mb-8">Contact Us</h2>
              <input type="text" placeholder="Name" required className="w-full p-4 bg-slate-800 rounded-xl outline-none border border-slate-700 focus:border-[#4361ee] transition-all" />
              <textarea placeholder="Message" rows="4" className="w-full p-4 bg-slate-800 rounded-xl outline-none border border-slate-700 focus:border-[#4361ee] transition-all"></textarea>
              <button type="submit" className="w-full bg-[#4361ee] py-4 rounded-xl font-black text-lg hover:bg-blue-600 transition-colors shadow-xl shadow-blue-500/20">Send</button>
            </form>
          ) : (
            <div className="text-center py-10">
              <div className="text-6xl mb-4">✉️</div>
              <h3 className="text-2xl font-black text-green-400">Message Sent!</h3>
              <p className="text-slate-400 mt-2">We'll get back to you shortly.</p>
              <button onClick={() => setFormSubmitted(false)} className="mt-8 text-[#4361ee] font-bold hover:underline">Send another</button>
            </div>
          )}
        </div>
      </section>

      <footer className="py-12 text-center text-slate-500 border-t border-slate-100 dark:border-slate-800">
        <p className="font-bold">&copy; 2026 Inventory Pro Systems.</p>
      </footer>
    </div>
  );
};

export default LandingPage;