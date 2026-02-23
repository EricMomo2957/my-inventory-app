import React, { useState, useEffect } from 'react';

export default function Profile() {
  // 1. STATE INITIALIZATION
  const [userData, setUserData] = useState({
    id: '',
    username: '',
    full_name: '',
    role: '',
    email: '',
    admin_id: '',
    department: '',
    profile_image: ''
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  // Modal & File States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState({ full_name: '', email: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // 2. LOAD USER FROM LOCALSTORAGE
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUserData(parsedUser);
        setEditData({
          full_name: parsedUser.full_name || '',
          email: parsedUser.email || ''
        });
      } catch (err) {
        console.error("Error parsing user data", err);
      }
    }
  }, []);

  // 3. IMAGE PREVIEW HANDLER
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // 4. PROFILE UPDATE HANDLER (Matches your app.js route)
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    // Using FormData to handle the file upload
    const formData = new FormData();
    formData.append('id', userData.id);
    formData.append('full_name', editData.full_name);
    formData.append('email', editData.email);
    formData.append('password', passwordData.newPassword); // Optional in your backend
    
    if (selectedFile) {
      // Must be 'profile_pic' to match your app.js upload.single('profile_pic')
      formData.append('profile_pic', selectedFile);
    }

    try {
      const response = await fetch('http://localhost:3000/api/users/update', {
        method: 'PUT',
        body: formData, // Do NOT set Content-Type header, browser handles boundary
      });

      const data = await response.json();
      if (data.success) {
        // Update Local State & Storage with new image path from server
        const updatedUser = { 
          ...userData, 
          full_name: editData.full_name, 
          email: editData.email,
          profile_image: data.profile_image || userData.profile_image 
        };
        
        setUserData(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setIsModalOpen(false);
        alert("Profile updated successfully!");
        setPreviewUrl(null);
        setSelectedFile(null);
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update profile.");
    }
  };

  return (
    <div className="p-6 h-screen bg-[#0b1120] text-slate-300 overflow-y-auto">
      {/* HEADER CARD */}
      <div className="bg-[#111827] rounded-xl border border-slate-800 p-8 mb-6 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col items-center">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full border-4 border-[#4361ee] overflow-hidden shadow-2xl bg-slate-800 flex items-center justify-center">
              {userData.profile_image ? (
                <img 
                  src={`http://localhost:3000${userData.profile_image}`} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl font-black text-[#4361ee]">
                  {userData.full_name?.charAt(0).toUpperCase() || '?'}
                </span>
              )}
            </div>
          </div>
          
          <h2 className="text-2xl font-black text-white mt-4">{userData.full_name || 'Loading...'}</h2>
          <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">{userData.role}</p>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="mt-4 px-6 py-2 bg-[#1e293b] hover:bg-[#4361ee] text-white text-xs font-black uppercase tracking-widest rounded-lg border border-slate-700 transition-all"
          >
            Edit Profile & Photo
          </button>
        </div>
      </div>

      {/* DETAILS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
        <div className="bg-[#111827] rounded-xl border border-slate-800 p-8 shadow-xl">
          <h3 className="text-xl font-bold text-white mb-6">Profile Details</h3>
          <div className="space-y-4">
            <DetailItem label="Full Name" value={userData.full_name} />
            <DetailItem label="Email" value={userData.email || 'not provided'} />
            <DetailItem label="Username" value={userData.username} />
            <DetailItem label="Department" value={userData.department || 'General'} />
            <DetailItem label="User ID" value={userData.id} />
          </div>
        </div>

        {/* SECURITY SECTION */}
        <div className="bg-[#111827] rounded-xl border border-slate-800 p-8 shadow-xl flex flex-col">
          <h3 className="text-xl font-bold text-white mb-6">Security</h3>
          <form className="space-y-6 flex-1" onSubmit={(e) => { e.preventDefault(); alert("Use the Edit Profile button to change password"); }}>
            <p className="text-sm text-slate-500 italic">Click "Edit Profile" above to update your password and personal information.</p>
            <div className="mt-auto p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-xs text-blue-400 font-bold uppercase">Security Status</p>
              <p className="text-white text-sm font-medium">Your account is secured with a private password.</p>
            </div>
          </form>
        </div>
      </div>

      {/* EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111827] border border-slate-800 w-full max-w-md rounded-2xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-black text-white mb-6">Edit Profile</h3>
            
            <form onSubmit={handleProfileUpdate} className="space-y-5">
              {/* Photo Upload Preview */}
              <div className="flex flex-col items-center mb-6">
                <label className="relative cursor-pointer group">
                  <div className="w-24 h-24 rounded-full border-2 border-dashed border-slate-700 flex items-center justify-center overflow-hidden bg-[#0b1120]">
                    {previewUrl ? (
                      <img src={previewUrl} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-2">
                         <span className="text-[10px] text-slate-500 uppercase font-black">Change Photo</span>
                      </div>
                    )}
                  </div>
                  <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                </label>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Full Name</label>
                <input 
                  type="text" 
                  className="w-full bg-[#0b1120] border border-slate-800 rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none" 
                  value={editData.full_name} 
                  onChange={(e) => setEditData({...editData, full_name: e.target.value})} 
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">Email Address</label>
                <input 
                  type="email" 
                  className="w-full bg-[#0b1120] border border-slate-800 rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none" 
                  value={editData.email} 
                  onChange={(e) => setEditData({...editData, email: e.target.value})} 
                />
              </div>

              <div className="pt-2 border-t border-slate-800">
                <label className="block text-[10px] font-black text-blue-500 uppercase mb-1">Change Password (Optional)</label>
                <input 
                  type="password" 
                  placeholder="Leave blank to keep current"
                  className="w-full bg-[#0b1120] border border-slate-800 rounded-lg px-4 py-3 text-white focus:border-blue-500 outline-none" 
                  value={passwordData.newPassword} 
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} 
                />
              </div>

              <div className="flex gap-4 mt-8">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold text-xs uppercase"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs uppercase shadow-lg shadow-blue-600/20"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailItem({ label, value }) {
  return (
    <div className="border-b border-slate-800 pb-3">
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-white font-bold">{value || 'N/A'}</p>
    </div>
  );
}