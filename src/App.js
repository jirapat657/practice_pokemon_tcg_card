import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home'; // <-- หน้าหลักที่มี task ของคุณ
import About from './pages/About'; // <-- หน้าที่คุณสร้างใหม่
import 'antd/dist/reset.css'; // สำหรับ Ant Design v5

function App() {
  return (
    <Router>
      <nav style={{ padding: '10px' , backgroundColor: '#252836'}}>
        {/* <Link to="/" style={{ marginRight: '10px' }}>หน้าแรก</Link>
        <Link to="/about">หน้าเกี่ยวกับ</Link> */}
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    
    </Router>
    
    
  );
}

export default App;
