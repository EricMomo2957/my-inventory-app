import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Package, ShieldCheck, BarChart3, Truck, ArrowRight, CheckCircle2, Warehouse, Cpu, Layers } from 'lucide-react';

const LandingPage = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('landingTheme') === 'dark');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [faqs, setFaqs] = useState([]);
  const canvasRef = useRef(null);

  // Contact / System Support Form
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

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

  // --- 2. WAVE ENGINE ---
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
        ctx.strokeStyle = isDarkMode ? 'rgba(0, 104, 74, 0.18)' : 'rgba(0, 104, 74, 0.08)';
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
          { id: 1, question: "Is this system strictly for internal warehouse staff?", answer: "Yes! There are no public shopping accounts. All access is restricted to authorized Managers, Clerks, and Auditors." },
          { id: 2, question: "How does stock dispatch work?", answer: "Warehouse clerks stage items and record instant deductions with department requisitions and printable vouchers." },
          { id: 3, question: "Are inventory adjustments logged?", answer: "Every physical stock take, cycle count adjustment, and dispatch is tracked with staff attribution and reason codes." }
        ]);
      }
    };
    fetchFaqs();

    const handleScroll = () => setShowScrollBtn(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3000/api/contact', formData);
      setFormSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again later.");
    }
  };

  return (
    <div className={`transition-colors duration-500 min-h-screen relative w-full overflow-y-auto font-sans ${
      isDarkMode ? 'bg-[#0b1120] text-slate-200' : 'bg-white text-slate-800'
    }`}>
      
      <canvas 
        ref={canvasRef} 
        className="fixed inset-0 z-0 pointer-events-none" 
        style={{ height: '100vh', width: '100vw' }}
      />

      <div className="relative z-10 w-full flex flex-col">
        
        {/* Navigation */}
        <nav className={`flex justify-between items-center py-4 px-[8%] sticky top-0 z-50 backdrop-blur-md border-b ${
          isDarkMode ? 'bg-[#0f172a]/80 border-slate-800' : 'bg-white/80 border-slate-200'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#00684a] text-white flex items-center justify-center shadow-md shadow-[#00684a]/20">
              <Warehouse className="w-5 h-5" />
            </div>
            <Link to="/" className="text-xl font-extrabold tracking-tight">
              Mind<span className="text-[#00684a]">Stock</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8 text-sm font-semibold">
            <a href="#about" className="hover:text-[#00684a] transition-colors">Operations</a>
            <a href="#features" className="hover:text-[#00684a] transition-colors">Capabilities</a>
            <a href="#faq" className="hover:text-[#00684a] transition-colors">FAQ</a>
            <Link 
              to="/login" 
              className="bg-[#00684a] hover:bg-[#005a3f] text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-[#00684a]/20 flex items-center gap-2"
            >
              Staff Portal <ArrowRight className="w-4 h-4" />
            </Link>
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)} 
              className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <header className="flex flex-col md:flex-row items-center justify-between px-[8%] py-20 min-h-[85vh]">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[#00684a] dark:text-emerald-400 text-xs font-black uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" /> Enterprise Warehouse & Inventory System
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Precision Control for <span className="text-[#00684a]">Warehouse & Supplies.</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-500 dark:text-slate-400 max-w-xl font-medium">
              A dedicated internal system for businesses to track stock levels, manage inbound supplier receipts, fulfill department requisitions, and maintain automated audit trails.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link 
                to="/login" 
                className="bg-[#00684a] hover:bg-[#005a3f] text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl shadow-[#00684a]/25 flex items-center gap-2.5 active:scale-95"
              >
                Launch Staff Desk <ArrowRight className="w-4 h-4" />
              </Link>
              <a 
                href="#features" 
                className={`px-7 py-4 rounded-2xl font-extrabold text-xs uppercase tracking-wider border transition-all ${
                  isDarkMode ? 'border-slate-700 text-slate-300 hover:bg-slate-800' : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
              >
                View Features
              </a>
            </div>
          </div>
          
          <div className="w-full md:w-1/2 mt-12 md:mt-0 max-w-lg">
            <div className="relative group">
              <div className="absolute -inset-1 bg-linear-to-r from-[#00684a] to-emerald-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition duration-1000"></div>
              <img 
                src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80" 
                className="relative rounded-3xl shadow-2xl border border-white/10 w-full object-cover" 
                alt="Warehouse Management" 
              />
            </div>
          </div>
        </header>

        {/* Operational Highlights */}
        <section id="about" className="px-[8%] py-24 border-t border-slate-200 dark:border-slate-800/80">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <img 
              src="https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=800&q=80" 
              className="rounded-3xl shadow-2xl border border-white/10" 
              alt="Inventory Logistics" 
            />
            <div className={`p-10 lg:p-12 rounded-3xl border backdrop-blur-md space-y-6 ${
              isDarkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white/80 border-slate-200'
            }`}>
              <span className="text-xs font-black uppercase tracking-wider text-[#00684a] dark:text-emerald-400">
                Staff-First Workflow
              </span>
              <h2 className="text-3xl lg:text-4xl font-black">Engineered for Internal Operations</h2>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm sm:text-base">
                Eliminate spreadsheets and manual counting errors. Our platform connects inventory managers, warehouse clerks, and department heads with real-time stock availability, instant stock dispatch, and safety threshold alerts.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="flex items-center gap-2.5 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-[#00684a]" /> Zero Public Access
                </div>
                <div className="flex items-center gap-2.5 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-[#00684a]" /> Real-time Audit Trail
                </div>
                <div className="flex items-center gap-2.5 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-[#00684a]" /> Department Requisitions
                </div>
                <div className="flex items-center gap-2.5 text-xs font-bold">
                  <CheckCircle2 className="w-4 h-4 text-[#00684a]" /> Reorder Point Warnings
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="px-[8%] py-24 bg-slate-50/50 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-800/80">
          <div className="max-w-3xl mx-auto text-center mb-16 space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-[#00684a] dark:text-emerald-400">
              Core Modules
            </span>
            <h2 className="text-3xl lg:text-4xl font-black">Built for High-Velocity Warehouses</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className={`p-8 rounded-3xl border transition-all hover:-translate-y-1.5 ${
              isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="w-12 h-12 rounded-2xl bg-[#00684a]/10 text-[#00684a] flex items-center justify-center mb-6">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black mb-2">Analytics & Valuation</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Monitor category distribution, cooperative asset values, fast-moving items, and stock health in real time.
              </p>
            </div>

            <div className={`p-8 rounded-3xl border transition-all hover:-translate-y-1.5 ${
              isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="w-12 h-12 rounded-2xl bg-[#00684a]/10 text-[#00684a] flex items-center justify-center mb-6">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black mb-2">Stock Dispatch Desk</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Fulfill internal department requisitions, record material issuance, and print official warehouse dispatch slips.
              </p>
            </div>

            <div className={`p-8 rounded-3xl border transition-all hover:-translate-y-1.5 ${
              isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200 shadow-sm'
            }`}>
              <div className="w-12 h-12 rounded-2xl bg-[#00684a]/10 text-[#00684a] flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black mb-2">Audit History & Control</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Every physical count adjustment, damage write-off, and restock is logged with staff name and reason codes.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="px-[8%] py-24 max-w-5xl mx-auto w-full">
          <h2 className="text-3xl lg:text-4xl font-black text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map(f => (
              <div key={f.id} className={`p-6 rounded-2xl border-l-4 border-[#00684a] border ${
                isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <h4 className="font-extrabold text-base mb-1.5">{f.question}</h4>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{f.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Support & Inquiries */}
        <section id="contact" className="px-[8%] py-24 border-t border-slate-200 dark:border-slate-800/80">
          <div className={`p-8 md:p-14 rounded-3xl border shadow-xl ${
            isDarkMode ? 'bg-[#0f172a] border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div className="space-y-4">
                <span className="text-xs font-black uppercase tracking-wider text-[#00684a]">IT & Admin Support</span>
                <h2 className="text-3xl lg:text-4xl font-black">Need System Assistance?</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Send an inquiry or maintenance request directly to the system administrators.
                </p>
                <div className="pt-2 text-xs font-bold text-slate-500 space-y-1">
                  <p>📍 Warehouse Hub 01, Main Logistics Center</p>
                  <p>📧 support@warehouse-ims.internal</p>
                </div>
              </div>
              
              {!formSubmitted ? (
                <form onSubmit={handleContactSubmit} className="space-y-3.5">
                  <input 
                    placeholder="Staff / Department Name" 
                    required 
                    className={`w-full p-3.5 rounded-xl border text-sm outline-none transition-all ${
                      isDarkMode ? 'bg-[#0b1120] border-slate-800 text-white focus:border-[#00684a]' : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-[#00684a]'
                    }`}
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                  <input 
                    type="email" 
                    placeholder="Work Email" 
                    required 
                    className={`w-full p-3.5 rounded-xl border text-sm outline-none transition-all ${
                      isDarkMode ? 'bg-[#0b1120] border-slate-800 text-white focus:border-[#00684a]' : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-[#00684a]'
                    }`}
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                  <textarea 
                    placeholder="Inquiry / Request details..." 
                    rows="3" 
                    required
                    className={`w-full p-3.5 rounded-xl border text-sm outline-none transition-all ${
                      isDarkMode ? 'bg-[#0b1120] border-slate-800 text-white focus:border-[#00684a]' : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-[#00684a]'
                    }`}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                  />
                  <button 
                    type="submit" 
                    className="w-full bg-[#00684a] hover:bg-[#005a3f] text-white py-3.5 rounded-xl font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-[#00684a]/20 transition-all cursor-pointer"
                  >
                    Submit Inquiry
                  </button>
                </form>
              ) : (
                <div className="bg-emerald-500/10 p-8 rounded-2xl text-center border border-emerald-500/20 space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-[#00684a] mx-auto" />
                  <h3 className="text-xl font-black text-[#00684a]">Inquiry Logged</h3>
                  <p className="text-xs text-slate-500">Your message has been sent to system administrators.</p>
                  <button 
                    onClick={() => setFormSubmitted(false)} 
                    className="text-xs text-[#00684a] font-bold underline cursor-pointer"
                  >
                    Send another message
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        <footer className="py-8 text-center text-xs text-slate-400 border-t border-slate-200 dark:border-slate-800/80">
          <p>&copy; 2026 MindStock Enterprise Warehouse & Inventory Management System. All rights reserved.</p>
        </footer>
      </div>

      {showScrollBtn && (
        <button 
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
          className="fixed bottom-8 right-8 w-12 h-12 bg-[#00684a] text-white rounded-2xl shadow-xl z-50 flex items-center justify-center font-bold hover:scale-110 transition-transform cursor-pointer"
        >
          ↑
        </button>
      )}
    </div>
  );
};

export default LandingPage;