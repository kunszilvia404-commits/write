import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import Home from './pages/Home';
import Chat from './pages/Chat';
import Diagnose from './pages/Diagnose';
import Ideation from './pages/Ideation';
import Plans from './pages/Plans';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <aside className="sidebar">
          <div className="sidebar-brand">
            <h1>写伴</h1>
            <span>Write to See</span>
          </div>
          <nav>
            <NavLink to="/" end>开始对话</NavLink>
            <NavLink to="/chat">历史记录</NavLink>
            <NavLink to="/diagnose">文章诊断</NavLink>
            <NavLink to="/ideation">想法引导</NavLink>
            <NavLink to="/plans">写作计划</NavLink>
          </nav>
        </aside>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/diagnose" element={<Diagnose />} />
            <Route path="/ideation" element={<Ideation />} />
            <Route path="/plans" element={<Plans />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
