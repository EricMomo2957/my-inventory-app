export default function Profile() {
  return (
    <div className="p-8 max-w-2xl mx-auto w-full">
      <div className="bg-[#111827] rounded-[2.5rem] border border-slate-800 p-10 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-[#4361ee] rounded-3xl flex items-center justify-center text-3xl mb-6 shadow-xl shadow-indigo-500/20">ED</div>
          <h2 className="text-2xl font-black text-white">Eric Dominic Momo</h2>
          <p className="text-[#4361ee] font-bold uppercase tracking-widest text-xs mt-1">Administrator</p>
          
          <div className="w-full grid grid-cols-2 gap-4 mt-10">
            <div className="bg-[#0b1120] p-4 rounded-2xl border border-slate-800 text-left">
              <p className="text-[10px] font-black text-slate-500 uppercase">Email</p>
              <p className="text-white font-bold">eric@inventorypro.com</p>
            </div>
            <div className="bg-[#0b1120] p-4 rounded-2xl border border-slate-800 text-left">
              <p className="text-[10px] font-black text-slate-500 uppercase">Phone</p>
              <p className="text-white font-bold">+63 912 345 6789</p>
            </div>
          </div>
          <button className="w-full mt-6 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold transition-all">Edit Profile</button>
        </div>
      </div>
    </div>
  );
}