import React, { useState, useEffect } from 'react';

export default function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState({ fullName: '', gender: '', birthday: '', bio: '', detailBio: '', avatar: '', email: '', location: '', hobbies: '' });
  const [activeTab, setActiveTab] = useState('home');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [msgText, setMsgText] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [showPassword, setShowPassword] = useState(false);

  const fetchUsers = () => fetch('https://hen-ho-backend.onrender.com/api/users').then(res => res.json()).then(setAllUsers);
  
  const fetchMessages = (otherEmail) => {
    if (!user || !otherEmail) return;
    fetch(`https://hen-ho-backend.onrender.com/api/messages/${user.email}/${otherEmail}`).then(res => res.json()).then(setChatHistory);
  };

  useEffect(() => { if (user && activeTab === 'home') fetchUsers(); }, [activeTab, user]);

  useEffect(() => {
    let interval;
    if (user && selectedChat && activeTab === 'messages') {
      fetchMessages(selectedChat.email);
      interval = setInterval(() => fetchMessages(selectedChat.email), 3000);
    }
    return () => clearInterval(interval);
  }, [selectedChat, activeTab, user]);

  const handleAuth = (e) => {
    e.preventDefault();
    fetch('https://hen-ho-backend.onrender.com/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    }).then(res => res.json()).then(data => {
      if (data.user) { setUser(data.user); setUserData(data.user); setActiveTab('home'); }
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    const res = await fetch('https://hen-ho-backend.onrender.com/api/upload', { method: 'POST', body: formData });
    const data = await res.json();
    setUserData({ ...userData, avatar: data.imageUrl });
  };

  const handleSendMsg = () => {
    if (!msgText.trim() || !selectedChat) return;
    const newMsg = { from: user.email, to: selectedChat.email, text: msgText };
    fetch('https://hen-ho-backend.onrender.com/api/messages/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newMsg)
    }).then(res => res.json()).then(data => {
        if(data.success) {
            setChatHistory([...chatHistory, data.message]);
            setMsgText("");
        }
    });
  };

  const handleSaveProfile = () => {
    if (!userData.birthday) { alert("Vui lòng chọn ngày sinh!"); return; }
    const birthDate = new Date(userData.birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    if (today.getMonth() < birthDate.getMonth() || (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) { age--; }

    if (age < 18) { alert("Bạn phải từ 18 tuổi trở lên!"); return; }

    fetch('https://hen-ho-backend.onrender.com/api/update', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    }).then(res => res.json()).then(data => { 
      setUser(data.user); 
      alert("Đã lưu hồ sơ thành công!"); 
    });
  };

  if (!user) return (
    <div style={styles.loginContainer}>
      <div style={styles.loginCard}>
        <div style={{fontSize: '60px', marginBottom: '10px'}}>{showPassword ? '🙈' : '🙊'}</div>
        <h2 style={{color: '#ff4d6d', marginBottom: '25px'}}>HenHo Đăng Nhập</h2>
        <form onSubmit={handleAuth}>
          <input style={styles.inputLogin} type="email" placeholder="Gmail của bạn..." onChange={e => setEmail(e.target.value)} required />
          <div style={{position: 'relative'}}>
            <input style={styles.inputLogin} type={showPassword ? "text" : "password"} placeholder="Mật khẩu..." onChange={e => setPassword(e.target.value)} required />
            <span style={styles.monkeyToggle} onClick={() => setShowPassword(!showPassword)}>{showPassword ? '🐵' : '🙈'}</span>
          </div>
          <button type="submit" style={styles.loginBtn}>Vào ứng dụng</button>
        </form>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <div style={styles.logo}>🔥 HenHo</div>
        <button style={activeTab === 'home' ? styles.sideBtnActive : styles.sideBtn} onClick={() => setActiveTab('home')}>🏠 Trang Chủ</button>
        <button style={activeTab === 'profile' ? styles.sideBtnActive : styles.sideBtn} onClick={() => setActiveTab('profile')}>👤 Cá nhân</button>
        <button style={activeTab === 'messages' ? styles.sideBtnActive : styles.sideBtn} onClick={() => setActiveTab('messages')}>💬 Tin nhắn</button>
        <button style={styles.logoutBtn} onClick={() => setUser(null)}>🚪 Đăng xuất</button>
      </div>

      <div style={styles.contentArea}>
        {activeTab === 'home' && (
          <div>
            <h2 style={{marginBottom: '20px', textAlign: 'center'}}>Khám phá bạn mới</h2>
            <div style={styles.cardGrid}>
              {allUsers.filter(u => u.email !== user.email).map((other, idx) => (
                <div key={idx} style={styles.tinderCard}>
                  <img src={other.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} style={styles.tinderImg} />
                  <div style={styles.tinderInfo}>
                    <h3>{other.fullName || "Người dùng"} <span style={{color: '#ff4d6d', fontSize: '14px'}}>{other.birthday ? (new Date().getFullYear() - new Date(other.birthday).getFullYear()) : "??"} tuổi</span></h3>
                    <p style={styles.locText}>📍 {other.location || "Chưa cập nhật"}</p>
                    <p style={styles.tinderBio}><b>Slogan:</b> {other.bio || "..."}</p>
                    <p style={styles.tinderBio}><b>Sở thích:</b> {other.hobbies || "Chưa có"}</p>
                    <button style={styles.likeBtn} onClick={() => { setSelectedChat(other); setActiveTab('messages'); fetchMessages(other.email); }}>💌 Nhắn tin</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div style={styles.chatContainer}>
            <div style={styles.userList}>
              <h4 style={{marginBottom: '15px'}}>Tin nhắn</h4>
              {allUsers.filter(u => u.email !== user.email).map((u, i) => (
                <div key={i} onClick={() => { setSelectedChat(u); fetchMessages(u.email); }} style={selectedChat?.email === u.email ? styles.activeChatItem : styles.userListItem}>
                   <img src={u.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} style={styles.miniAvatar} />
                   <span style={{fontSize: '13px'}}>{u.fullName || "User"}</span>
                </div>
              ))}
            </div>
            <div style={styles.chatBox}>
              <div style={styles.messageHistory}>
                {chatHistory.map((m, i) => (
                  <div key={i} style={m.from === user.email ? styles.myMsg : styles.theirMsg}>{m.text}</div>
                ))}
              </div>
              {selectedChat && (
                <div style={styles.inputRow}>
                  <input style={styles.chatInput} value={msgText} onKeyPress={e => e.key === 'Enter' && handleSendMsg()} onChange={e => setMsgText(e.target.value)} placeholder="Aa..." />
                  <button style={styles.sendBtn} onClick={handleSendMsg}>Gửi</button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div style={styles.profileCard}>
            <h2 style={styles.profileHeader}>Hồ sơ cá nhân</h2>
            <div style={styles.avatarSectionCenter}>
              <div style={styles.avatarCircle}><img src={userData.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} style={styles.avatarImg} /></div>
              <input type="file" id="fileUpload" style={{display: 'none'}} onChange={handleFileChange} />
              <label htmlFor="fileUpload" style={styles.uploadBtn}>📂 Tải ảnh lên</label>
            </div>

            <div style={styles.fieldGroup}>
                <label style={styles.label}>Tên hiển thị:</label>
                <input style={styles.input} value={userData.fullName} placeholder="Nhập tên của bạn..." onChange={e => setUserData({...userData, fullName: e.target.value})} />
            </div>

            <div style={styles.row}>
                <div style={{flex: 1}}><label style={styles.label}>Giới tính:</label><select style={styles.input} value={userData.gender} onChange={e => setUserData({...userData, gender: e.target.value})}><option value="">-- Chọn --</option><option value="Nam">Nam</option><option value="Nữ">Nữ</option></select></div>
                <div style={{flex: 1}}><label style={styles.label}>Ngày sinh:</label><input type="date" style={styles.input} value={userData.birthday} onChange={e => setUserData({...userData, birthday: e.target.value})} /></div>
            </div>

            <div style={styles.fieldGroup}>
                <div style={styles.labelRow}><label style={styles.label}>Slogan cá nhân:</label><span style={styles.counter}>{(userData.bio || "").length}/100</span></div>
                <input style={styles.input} maxLength="100" placeholder="Viết gì đó thật 'ngầu'..." value={userData.bio} onChange={e => setUserData({...userData, bio: e.target.value})} />
            </div>

            <div style={styles.fieldGroup}>
                <div style={styles.labelRow}><label style={styles.label}>Khu vực sống:</label><span style={styles.counter}>{(userData.location || "").length}/50</span></div>
                <input style={styles.input} maxLength="50" placeholder="Ví dụ: TP.HCM, Cai Lậy..." value={userData.location} onChange={e => setUserData({...userData, location: e.target.value})} />
            </div>

            <div style={styles.fieldGroup}>
                <div style={styles.labelRow}><label style={styles.label}>Sở thích:</label><span style={styles.counter}>{(userData.hobbies || "").length}/100</span></div>
                <input style={styles.input} maxLength="100" placeholder="Ví dụ: Đá bóng, xem phim..." value={userData.hobbies} onChange={e => setUserData({...userData, hobbies: e.target.value})} />
            </div>

            <div style={styles.fieldGroup}>
                <div style={styles.labelRow}><label style={styles.label}>Tiểu sử chi tiết:</label><span style={styles.counter}>{(userData.detailBio || "").length}/1000</span></div>
                <textarea style={styles.textarea} maxLength="1000" placeholder="Chia sẻ thêm về bản thân bạn nhé..." value={userData.detailBio} onChange={e => setUserData({...userData, detailBio: e.target.value})} />
            </div>

            <button style={styles.saveBtn} onClick={handleSaveProfile}>Lưu hồ sơ</button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', height: '100vh', backgroundColor: '#f0f2f5', fontFamily: 'Arial' },
  sidebar: { width: '220px', backgroundColor: '#fff', borderRight: '1px solid #ddd', display: 'flex', flexDirection: 'column', padding: '20px' },
  logo: { fontSize: '26px', fontWeight: 'bold', color: '#ff4d6d', marginBottom: '30px', textAlign: 'center' },
  sideBtn: { padding: '12px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', borderRadius: '10px', width: '100%', marginBottom: '5px' },
  sideBtnActive: { padding: '12px', border: 'none', backgroundColor: '#fff0f3', color: '#ff4d6d', fontWeight: 'bold', borderRadius: '10px', width: '100%' },
  contentArea: { flex: 1, padding: '30px', overflowY: 'auto' },
  
  profileCard: { maxWidth: '650px', margin: '0 auto', backgroundColor: '#fff', padding: '35px', borderRadius: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' },
  profileHeader: { textAlign: 'center', marginBottom: '25px' },
  avatarSectionCenter: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '30px' },
  avatarCircle: { width: '130px', height: '130px', borderRadius: '50%', border: '4px solid #ff4d6d', overflow: 'hidden', marginBottom: '10px' },
  avatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
  uploadBtn: { backgroundColor: '#fff0f3', color: '#ff4d6d', padding: '7px 15px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', border: '1px dashed #ff4d6d' },
  fieldGroup: { marginBottom: '18px' },
  labelRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: '14px', fontWeight: 'bold', color: '#444', marginBottom: '5px', display: 'block' },
  counter: { fontSize: '11px', color: '#bbb' },
  row: { display: 'flex', gap: '15px' },
  input: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #eee', backgroundColor: '#fafafa', boxSizing: 'border-box' },
  textarea: { width: '100%', height: '120px', padding: '12px', borderRadius: '10px', border: '1px solid #eee', backgroundColor: '#fafafa', resize: 'none', boxSizing: 'border-box' },
  saveBtn: { width: '100%', padding: '15px', backgroundColor: '#ff4d6d', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' },

  cardGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' },
  tinderCard: { backgroundColor: '#fff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' },
  tinderImg: { width: '100%', height: '280px', objectFit: 'cover' },
  tinderInfo: { padding: '15px' },
  locText: { fontSize: '12px', color: '#ff4d6d', fontWeight: 'bold', margin: '5px 0' },
  tinderBio: { fontSize: '13px', color: '#666', margin: '5px 0' },
  likeBtn: { width: '100%', marginTop: '10px', padding: '10px', borderRadius: '10px', border: 'none', backgroundColor: '#ff4d6d', color: '#fff', fontWeight: 'bold', cursor: 'pointer' },

  chatContainer: { display: 'flex', height: '75vh', backgroundColor: '#fff', borderRadius: '20px', overflow: 'hidden' },
  userList: { width: '250px', borderRight: '1px solid #eee', padding: '15px', overflowY: 'auto' },
  userListItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', cursor: 'pointer', borderRadius: '10px' },
  activeChatItem: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#fff0f3', padding: '10px', borderRadius: '10px', cursor: 'pointer' },
  miniAvatar: { width: '35px', height: '35px', borderRadius: '50%', border: '1px solid #ff4d6d' },
  chatBox: { flex: 1, display: 'flex', flexDirection: 'column', padding: '15px' },
  messageHistory: { flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' },
  myMsg: { alignSelf: 'flex-end', backgroundColor: '#ff4d6d', color: '#fff', padding: '8px 12px', borderRadius: '15px 15px 2px 15px', marginBottom: '5px', maxWidth: '70%' },
  theirMsg: { alignSelf: 'flex-start', backgroundColor: '#f0f2f5', padding: '8px 12px', borderRadius: '15px 15px 15px 2px', marginBottom: '5px', maxWidth: '70%' },
  inputRow: { display: 'flex', gap: '10px', marginTop: '10px' },
  chatInput: { flex: 1, padding: '10px 15px', borderRadius: '20px', border: '1px solid #ddd' },
  sendBtn: { padding: '10px 20px', backgroundColor: '#ff4d6d', color: '#fff', border: 'none', borderRadius: '20px', fontWeight: 'bold', cursor: 'pointer' },

  loginContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#fff0f3' },
  loginCard: { width: '320px', padding: '35px', backgroundColor: '#fff', borderRadius: '25px', textAlign: 'center' },
  inputLogin: { width: '100%', padding: '12px', marginBottom: '12px', borderRadius: '10px', border: '1px solid #eee', boxSizing: 'border-box' },
  monkeyToggle: { position: 'absolute', right: '12px', top: '10px', cursor: 'pointer', fontSize: '20px' },
  loginBtn: { width: '100%', padding: '12px', backgroundColor: '#ff4d6d', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' },
  logoutBtn: { marginTop: 'auto', color: '#bbb', background: 'none', border: 'none', cursor: 'pointer' }
};