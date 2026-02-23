import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext'; // Ensure this path is correct

export default function Profile() {
  const { isDark } = useTheme();

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
  
  // These pull from initialUser for the Edit Modal
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
    <div className={`p-6 h-screen transition-colors duration-500 overflow-y-auto ${
      isDark ? 'bg-[#0b1120] text-slate-300' : 'bg-slate-50 text-slate-600'
    }`}>
      
      {/* HEADER CARD */}
      <div className={`rounded-xl border p-8 mb-6 shadow-2xl relative overflow-hidden transition-colors duration-500 ${
        isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col items-center">
          <div className="relative group">
            <div className={`w-32 h-32 rounded-full border-4 border-[#4361ee] overflow-hidden shadow-2xl flex items-center justify-center ${
              isDark ? 'bg-slate-800' : 'bg-slate-100'
            }`}>
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
          
          <h2 className={`text-2xl font-black mt-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {userData.full_name || 'User'}
          </h2>
          <p className="text-slate-500 font-bold text-sm uppercase tracking-widest">{userData.role}</p>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className={`mt-4 px-6 py-2 text-xs font-black uppercase tracking-widest rounded-lg border transition-all ${
              isDark 
                ? 'bg-[#1e293b] hover:bg-[#4361ee] text-white border-slate-700' 
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 shadow-sm'
            }`}
          >
            Edit Profile & Photo
          </button>
        </div>
      </div>

      {/* DETAILS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
        <div className={`rounded-xl border p-8 shadow-xl ${
          isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <h3 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>Profile Details</h3>
          <div className="space-y-4">
            <DetailItem label="Full Name" value={userData.full_name} isDark={isDark} />
            <DetailItem label="Email" value={userData.email || 'not provided'} isDark={isDark} />
            <DetailItem label="Username" value={userData.username} isDark={isDark} />
            <DetailItem label="Department" value={userData.department || 'General'} isDark={isDark} />
            <DetailItem label="User ID" value={userData.id} isDark={isDark} />
          </div>
        </div>

        {/* SECURITY SECTION */}
        <div className={`rounded-xl border p-8 shadow-xl flex flex-col ${
          isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <h3 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>Security Status</h3>
          <div className={`flex-1 p-4 border rounded-lg ${
            isDark ? 'bg-blue-500/10 border-blue-500/20' : 'bg-blue-50 border-blue-100'
          }`}>
            <p className="text-sm text-slate-500 mb-4">Your account information is managed by the {userData.department || 'system'} department.</p>
            <p className="text-xs text-blue-500 font-bold uppercase">Account Protection</p>
            <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>Verified Account</p>
          </div>
        </div>
      </div>

      {/* EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className={`border w-full max-w-md rounded-2xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto ${
            isDark ? 'bg-[#111827] border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <h3 className={`text-2xl font-black mb-6 ${isDark ? 'text-white' : 'text-slate-900'}`}>Edit Profile</h3>
            
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              {/* Photo Preview */}
              <div className="flex flex-col items-center mb-4">
                <label className="relative cursor-pointer">
                  <div className={`w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden ${
                    isDark ? 'border-slate-700 bg-[#0b1120]' : 'border-slate-300 bg-slate-50'
                  }`}>
                    {previewUrl ? <img src={previewUrl} className="w-full h-full object-cover" alt="preview" /> : <span className="text-[10px] text-slate-500 font-black uppercase">Change Photo</span>}
                  </div>
                  <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                </label>
              </div>

              <EditInput label="User ID (Locked)" value={editData.id} disabled={true} isDark={isDark} />
              
              <EditInput 
                label="Full Name" 
                value={editData.full_name} 
                isDark={isDark}
                onChange={(val) => setEditData({...editData, full_name: val})} 
              />
              
              <EditInput 
                label="Username" 
                value={editData.username} 
                isDark={isDark}
                onChange={(val) => setEditData({...editData, username: val})} 
              />
              
              <EditInput 
                label="Email Address" 
                value={editData.email} 
                isDark={isDark}
                onChange={(val) => setEditData({...editData, email: val})} 
              />
              
              <EditInput 
                label="Department" 
                value={editData.department} 
                isDark={isDark}
                onChange={(val) => setEditData({...editData, department: val})} 
              />

              <div className={`pt-2 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                <label className="block text-[10px] font-black text-blue-500 uppercase mb-1">New Password (Optional)</label>
                <input 
                  type="password" 
                  placeholder="Leave blank to keep current"
                  className={`w-full border rounded-lg px-4 py-2 outline-none transition-all ${
                    isDark 
                    ? 'bg-[#0b1120] border-slate-800 text-white focus:border-blue-500' 
                    : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-500'
                  }`} 
                  value={passwordData.newPassword} 
                  onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} 
                />
              </div>

              <div className="flex gap-4 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className={`flex-1 py-3 rounded-lg font-bold text-xs uppercase ${
                  isDark ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-700'
                }`}>Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-bold text-xs uppercase shadow-lg shadow-blue-600/20">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Reusable Components
function DetailItem({ label, value, isDark }) {
  return (
    <div className={`border-b pb-3 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}>
      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
      <p className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{value || 'N/A'}</p>
    </div>
  );
}

function EditInput({ label, value, onChange, disabled = false, isDark }) {
  return (
    <div>
      <label className="block text-[10px] font-black text-slate-500 uppercase mb-1">{label}</label>
      <input 
        type="text" 
        disabled={disabled}
        className={`w-full border rounded-lg px-4 py-2 outline-none transition-all ${
          disabled 
            ? (isDark ? 'bg-[#1e293b] border-slate-800 text-slate-500 cursor-not-allowed' : 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed')
            : (isDark ? 'bg-[#0b1120] border-slate-800 text-white focus:border-blue-500' : 'bg-white border-slate-300 text-slate-900 focus:border-blue-500 shadow-sm')
        }`}
        value={value} 
        onChange={(e) => onChange && onChange(e.target.value)} 
      />
    </div>
  );
}