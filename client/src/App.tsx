import { useEffect } from "react";

function App() {
  useEffect(() => {
    // Redirect to the standalone Galaga game
    window.location.href = '/galaga-game.html';
  }, []);

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      background: 'linear-gradient(135deg, #0c0c2e, #1a1a4d)',
      color: 'white',
      fontFamily: 'Courier New, monospace'
    }}>
      <div>
        <h1>Galaga-Style Shooter</h1>
        <p>Loading game...</p>
      </div>
    </div>
  );
}

export default App;
