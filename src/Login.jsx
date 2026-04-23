import React, { useState } from 'react';
import { auth } from './firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

const Login = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = async () => {
    try {
      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, password);
        alert("Đăng ký thành công Thịnh ơi!");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onLogin(); // Vào trang chủ
    } catch (error) {
      alert("Lỗi rồi: " + error.message);
    }
  };

  return (
    <div style={{height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF0F3'}}>
      <div style={{backgroundColor: 'white', padding: '40px', borderRadius: '30px', width: '350px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.05)'}}>
        <h1 style={{color: '#FF4D6D'}}>{isRegister ? 'Tạo tài khoản' : 'Đăng nhập'}</h1>
        <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
        <input type="password" placeholder="Mật khẩu" onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
        <button onClick={handleAuth} style={btnStyle}>{isRegister ? 'Đăng ký' : 'Vào quẹt ngay'}</button>
        <p onClick={() => setIsRegister(!isRegister)} style={{marginTop: '20px', cursor: 'pointer', color: '#FF4D6D'}}>
          {isRegister ? 'Đã có nick? Đăng nhập' : 'Chưa có nick? Đăng ký ngay'}
        </p>
      </div>
    </div>
  );
};

const inputStyle = { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '10px', border: '1px solid #eee', outline: 'none' };
const btnStyle = { width: '100%', padding: '12px', backgroundColor: '#FF4D6D', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' };

export default Login;