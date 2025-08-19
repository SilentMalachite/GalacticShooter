import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

function Home() {
  return (
    <div style={{
      width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center',
      background: 'linear-gradient(135deg, #0c0c2e, #1a1a4d)', color: 'white', fontFamily: 'Courier New, monospace'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ marginBottom: 16 }}>Galactic Shooter</h1>
        <p style={{ opacity: 0.85, marginBottom: 24 }}>レトロなギャラガ風シューティングをプレイしましょう。</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <a href="/galaga" style={{ padding: '10px 16px', background: '#2563eb', color: 'white', textDecoration: 'none', borderRadius: 6 }}>ゲームを開始</a>
          <a href="/galaga-game.html" style={{ padding: '10px 16px', background: '#64748b', color: 'white', textDecoration: 'none', borderRadius: 6 }}>HTML版を直接開く</a>
          <Link to="/embed/galaga" style={{ padding: '10px 16px', background: '#22c55e', color: 'white', textDecoration: 'none', borderRadius: 6 }}>アプリ内で遊ぶ</Link>
        </div>
      </div>
    </div>
  );
}

function GalagaEmbed() {
  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '8px 12px', background: '#0c0c2e', color: '#fff', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link to="/" style={{ color: '#93c5fd', textDecoration: 'none' }}>← 戻る</Link>
        <span style={{ opacity: 0.9 }}>Galaga Embed</span>
      </div>
      <iframe title="galaga" src="/galaga-game.html" style={{ border: 'none', width: '100%', height: '100%' }} />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/embed/galaga" element={<GalagaEmbed />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
