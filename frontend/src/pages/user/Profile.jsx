import React, { useState } from 'react';

export default function Profile() {
  // 1. HELPER TO GET INITIAL USER DATA
  // This avoids the "set-state-in-effect" error by loading data before the first render
  const getSavedUser = () => {
    const saved = localStorage.getItem('user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        console.error("Error parsing user data", err);
      }
    }
    return {
      id: '', username: '', full_name: '', role: '',
      email: '', admin_id: '', department: '', profile_image: ''
    };
  };

  const initialUser = getSavedUser();

  // 2. STATE INITIALIZATION
  const [userData, setUserData] = useState(initialUser);
  const [passwordData, setPasswordData] = useState({ newPassword: '', confirmPassword: '' });

  // Modal & File States
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // UPDATED: These now automatically pull from initialUser for the Edit Modal
  const [editData, setEditData] = useState({ 
    full_name: initialUser.full_name || '', 
    email: initialUser.email || '', 
    username: initialUser.username || '', 
    department: initialUser.department || '',
    id: initialUser.id || '' 
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // 3. IMAGE PREVIEW HANDLER
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // 4. PROFILE UPDATE HANDLER
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('id', userData.id);
    formData.append('full_name', editData.full_name);
    formData.append('email', editData.email);
    formData.append('username', editData.username);
    formData.append('department', editData.department);
    formData.append('password', passwordData.newPassword); 
    
    if (selectedFile) {
      formData.append('profile_pic', selectedFile);
    }

    try {
      const response = await fetch('http://localhost:3000/api/users/update', {
        method: 'PUT',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        const updatedUser = { 
          ...userData, 
          ...editData,
          profile_image: data.profile_image || userData.profile_image 
        };
        
        setUserData(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setIsModalOpen(false);
        alert("Profile updated successfully!");
        setPreviewUrl(null);
        setSelectedFile(null);
        setPasswordData({ newPassword: '', confirmPassword: '' });
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
          
          <h2 className="text-2xl font-black text-white mt-4">{userData.full_name || 'User'}</h2>
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
          <h3 className="text-xl font-bold text-white mb-6">Security Status</h3>
          <div className="flex-1 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm text-slate-400 mb-4">Your account information is managed by the {userData.department || 'system'} department.</p>
            <p className="text-xs text-blue-400 font-bold uppercase">Account Protection</p>
            <p className="text-white text-sm font-medium">Verified Account</p>
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111827] border border-slate-800 w-full max-w-md rounded-2xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-black text-white mb-6">Edit Profile</h3>
            
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              {/* Photo Preview */}
              <div className="flex flex-col items-center mb-4">
                <label className="relative cursor-pointer">
                  <div className="w-24 h-24 rounded-full border-2 border-dashed border-slate-700 flex items-center justify-center overflow-hidden bg-[#0b1120]">
                    {previewUrl ? <img src={previewUrl} className="w-full h-full object-cover" alt="preview" /> : <span className="text-[10px] text-slate-500 font-black uppercase">Change Photo</span>}
                  </div>
                  <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                </label>
              </div>

              {/* AUTOMATICALLY FILLED FIELDS */}
              <EditInput label="User ID (Locked)" value={editData.id} disabled={true} />
              
              <EditInput 
                label="Full Name" 
                value={editData.full_name} 
                onChange={(val) => setEditData({...editData, full_name: val})} 
              />
              
              <EditInput 
                label="Username" 
                value={editData.username} 
                onChange={(val) => setEditData({...editData, username: val})} 
              />
              
              <EditInput 
                label="Email Address" 
                value={editData.email} 
                onChange={(val) => setEditData({...editData, email: val})} 
              />
              
              <EditInput 
                label="Department" 
                value={editData.department} 
                onChange={(val) => setEditData({...editData, department: val})} 
              />

              <div className="pt-2 border-t border-slate-800">
                <label className="block text-[10px] font-black text-blue-500 uppercase mb-1">New Password (Optional)</label>
                <input 
                  type="password" 
                  placeholder="Leave blank to keep current"
                  className="w-full bg-[#0b1120] border border-slate-800 rounded-lg px-4 py-2 text-white outline-none" 
                  value={passwordData.newPassword} 
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} 
                />
              </div>

              <div className="flex gap-4 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-slate-800 text-white rounded-lg font-bold text-xs uppercase">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-bold text-xs uppercase shadow-lg shadow-blue-600/20">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable Components to keep code clean
function DetailItem({ label, value }) {
  return (
    <div className="border-b border-slate-800 pb-3">
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-white font-bold">{value || 'N/A'}</p>
    </div>
  );
}

function EditInput({ label, value, onChange, disabled = false }) {
  return (
    <div>
      <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">{label}</label>
      <input 
        type="text" 
        disabled={disabled}
        className={`w-full border border-slate-800 rounded-lg px-4 py-2 text-white outline-none ${disabled ? 'bg-[#1e293b] text-slate-500 cursor-not-allowed' : 'bg-[#0b1120] focus:border-blue-500'}`}
        value={value} 
        onChange={(e) => onChange && onChange(e.target.value)} 
      />
    </div>
  );
}