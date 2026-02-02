import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('landingTheme') === 'dark');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const canvasRef = useRef(null);

  // 1. Dark Mode & Persistence
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark'); // Better for Tailwind 'dark:' classes
      document.body.classList.add('dark-mode');
      localStorage.setItem('landingTheme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark-mode');
      localStorage.setItem('landingTheme', 'light');
    }
  }, [isDarkMode]);

  // 2. Wave Engine (Canvas Logic)
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
        ctx.strokeStyle = isDarkMode 
          ? (i % 2 === 0 ? 'rgba(67, 97, 238, 0.15)' : 'rgba(76, 201, 240, 0.1)')
          : (i % 2 === 0 ? 'rgba(67, 97, 238, 0.08)' : 'rgba(76, 201, 240, 0.05)');
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

  // 3. Magnetic Button Effect
  const handleMagnetic = (e) => {
    const btn = e.currentTarget;
    const bounding = btn.getBoundingClientRect();
    const centerX = bounding.left + bounding.width / 2;
    const centerY = bounding.top + bounding.height / 2;
    const moveX = (e.clientX - centerX) / (bounding.width / 15);
    const moveY = (e.clientY - centerY) / (bounding.height / 15);
    btn.style.transform = `translate(${moveX}px, ${moveY}px)`;
  };

  const resetMagnetic = (e) => {
    e.currentTarget.style.transform = `translate(0px, 0px)`;
  };

  // 4. Scroll Logic
  useEffect(() => {
    const handleScroll = () => setShowScrollBtn(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    // Added min-h-screen and overflow-y-auto to ensure scrollability
    <div className={`landing-wrapper min-h-screen overflow-y-auto relative ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
      
      {/* ADDED pointer-events-none so it doesn't block scrolling */}
      <canvas 
        ref={canvasRef} 
        id="waveCanvas" 
        className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none" 
      />

      {showScrollBtn && (
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 w-12 h-12 bg-[#4361ee] text-white rounded-full z-[100] shadow-lg animate-bounce flex items-center justify-center"
        >
          ↑
        </button>
      )}

      <nav className="flex justify-between items-center py-4 px-[8%] sticky top-0 z-50 backdrop-blur-md border-b border-blue-500/10 transition-colors duration-300">
        <Link to="/" className="text-2xl font-extrabold text-[#4361ee]">📦 Inventory Pro</Link>
        <div className="flex items-center gap-4 md:gap-8">
          <a href="#about" className="hidden md:block text-slate-500 hover:text-[#4361ee] font-medium transition-colors">About</a>
          <a href="#workflow" className="hidden md:block text-slate-500 hover:text-[#4361ee] font-medium transition-colors">Features</a>
          <Link to="/login" className="bg-[#4361ee] text-white px-6 py-2 rounded-lg font-bold hover:shadow-lg transition-all active:scale-95">Sign In</Link>
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="border border-slate-400 text-slate-500 px-3 py-1 rounded-full text-xs hover:border-[#4361ee] hover:text-[#4361ee] transition-all"
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </nav>

      <header className="flex flex-col md:flex-row items-center justify-between px-[8%] py-20 min-h-[80vh] gap-12">
        <div className="max-w-xl space-y-6">
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 leading-[1.1] dark:text-white">Master Your Stock Level.</h1>
          <p className="text-lg text-slate-500 dark:text-slate-400">The smartest way to manage inventory, track sales, and generate reports in real-time.</p>
          <Link 
            to="/order"
            onMouseMove={handleMagnetic}
            onMouseLeave={resetMagnetic}
            className="inline-block bg-[#4361ee] text-white px-10 py-4 rounded-xl font-bold text-lg shadow-xl shadow-blue-500/20 transition-transform duration-200"
          >
            Order Now
          </Link>
        </div>
        <div className="w-full md:w-1/2">
          <img 
            src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80" 
            className="rounded-3xl shadow-2xl"
            alt="Warehouse Management" 
          />
        </div>
      </header>

      <section id="about" className="px-[8%] py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <img src="https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=800&q=80" className="rounded-3xl shadow-xl" alt="Operations" />
          <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md p-12 rounded-[40px] border border-white/20 shadow-xl">
            <h2 className="text-3xl font-black mb-6 dark:text-white">Our Mission</h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">We eliminate the chaos of manual stock counting. We empower businesses with enterprise-grade tools to streamline operations and maximize efficiency.</p>
          </div>
        </div>
      </section>

      <section id="workflow" className="px-[8%] py-24 text-center">
        <h2 className="text-4xl font-black mb-16 dark:text-white">Optimized Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: '⚡ Real-time Tracking', desc: 'Sync stock across teams instantly.' },
            { title: '📊 Advanced Reports', desc: 'One-click CSV/Excel exports.' },
            { title: '🛡️ Secure Access', desc: 'Role-based staff permissions.' }
          ].map((feature, idx) => (
            <div key={idx} className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md p-10 rounded-3xl border border-white/10 hover:-translate-y-2 hover:border-[#4361ee] transition-all text-left">
              <h3 className="text-xl font-bold mb-3 dark:text-white">{feature.title}</h3>
              <p className="text-slate-500 dark:text-slate-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-[8%] py-24 bg-slate-900 text-white rounded-[60px] mx-4 mb-24">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-black mb-4">Get In Touch</h2>
            <p className="text-slate-400 font-mono">📍 T.Padilla, Cebu City, PH<br />📧 support@inventorypro.com</p>
          </div>
          <div className="bg-white p-8 md:p-12 rounded-3xl text-slate-900">
            {!formSubmitted ? (
              <form onSubmit={(e) => { e.preventDefault(); setFormSubmitted(true); }} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input type="text" placeholder="Name" required className="w-full p-3 bg-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-[#4361ee]" />
                  <input type="email" placeholder="Email" required className="w-full p-3 bg-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-[#4361ee]" />
                </div>
                <textarea placeholder="Message" rows="4" className="w-full p-3 bg-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-[#4361ee]"></textarea>
                <button type="submit" className="w-full bg-[#4361ee] text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors">Send Message</button>
              </form>
            ) : (
              <div className="text-center py-8">
                <h3 className="text-2xl font-bold text-green-600 mb-2">✅ Message Sent!</h3>
                <p className="text-slate-500 mb-6">We'll get back to you shortly.</p>
                <button onClick={() => setFormSubmitted(false)} className="text-[#4361ee] font-bold">Send another message</button>
              </div>
            )}
          </div>
        </div>
      </section>

      <footer className="py-12 text-center text-slate-500 text-sm">
        <p>&copy; 2026 Inventory Pro Systems. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;