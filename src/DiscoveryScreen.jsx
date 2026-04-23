import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, X, MapPin } from "lucide-react";

const MOCK = [
  { id: 1, name: "Linh Nguyễn", age: 24, img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500" },
  { id: 2, name: "Minh Tú", age: 22, img: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500" },
  { id: 3, name: "Hải Yến", age: 23, img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500" }
];

export default function DiscoveryScreen() {
  const [u, setU] = useState(MOCK);
  const swipe = () => setU(prev => prev.slice(0, -1));

  return (
    <div style={{
      // Bỏ height: 100vh để không bị đè menu
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      justifyContent: "center", 
      paddingTop: "50px" 
    }}>
      <div style={{ position: "relative", width: "350px", height: "500px" }}>
        <AnimatePresence>
          {u.map((user, i) => (
            <motion.div 
              key={user.id} 
              drag="x" 
              onDragEnd={(_, info) => Math.abs(info.offset.x) > 100 && swipe()} 
              style={{
                position: "absolute", width: "100%", height: "100%", 
                backgroundColor: "white", borderRadius: "25px", 
                overflow: "hidden", boxShadow: "0 10px 30px rgba(0,0,0,0.1)", 
                cursor: "grab", zIndex: i
              }}
            >
              <img src={user.img} style={{ width: "100%", height: "70%", objectFit: "cover" }} alt="avatar" />
              <div style={{ padding: "20px" }}>
                <h2 style={{ margin: 0, color: "#333" }}>{user.name}, {user.age}</h2>
                <div style={{ display: "flex", alignItems: "center", color: "#888", fontSize: "14px", marginTop: "5px" }}>
                  <MapPin size={14} style={{ marginRight: "4px" }}/> Cách bạn 2km
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {u.length === 0 && (
          <div style={{ textAlign: "center", marginTop: "150px" }}>
            <h3 style={{ color: "#FF4D6D" }}>Hết lượt quẹt rồi Thịnh ơi! 🥳</h3>
            <button onClick={() => setU(MOCK)} style={{
              padding: "10px 20px", borderRadius: "20px", border: "none",
              backgroundColor: "#FF4D6D", color: "white", cursor: "pointer"
            }}>Quẹt lại từ đầu</button>
          </div>
        )}
      </div>

      {/* Nút bấm điều khiển nhanh */}
      {u.length > 0 && (
        <div style={{ marginTop: "40px", display: "flex", gap: "30px" }}>
          <button onClick={swipe} style={btnStyle}><X size={30} color="#FF4D6D"/></button>
          <button onClick={swipe} style={btnStyle}><Heart size={30} color="#10B981"/></button>
        </div>
      )}
    </div>
  );
}

const btnStyle = {
  width: "60px", height: "60px", borderRadius: "50%", 
  border: "none", backgroundColor: "white", 
  boxShadow: "0 5px 15px rgba(0,0,0,0.1)", 
  display: "flex", alignItems: "center", justifyContent: "center", 
  cursor: "pointer"
};