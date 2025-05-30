import React, { useRef, useState, useEffect } from 'react';
import './App.css';

function App() {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pencilSize, setPencilSize] = useState(15);
  const [jwt, setJwt] = useState(localStorage.getItem('jwt'));
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ username: '', email: '', password: '' });
  const [activeTab, setActiveTab] = useState('welcome');
  const [resultMessage, setResultMessage] = useState('');
  const [sessionSuccess, setSessionSuccess] = useState(0);
  const [sessionFail, setSessionFail] = useState(0);

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = nativeEvent;
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(offsetX, offsetY);
    ctx.strokeStyle = '#FFF';
    ctx.lineWidth = pencilSize;
    ctx.lineCap = 'round';
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setPrediction(null);
  };

  const handleAuth = async () => {
    const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const body = authMode === 'login'
      ? { username: authForm.username, password: authForm.password }
      : { username: authForm.username, email: authForm.email, password: authForm.password };
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (authMode === 'login') {
      if (res.ok) {
        let data = {};
        try {
          data = await res.json();
        } catch {
          data = {};
        }
        if (data.token && typeof data.token === 'string' && data.token.trim() !== '') {
          localStorage.setItem('jwt', data.token);
          setJwt(data.token);
          setShowAuth(false);
          try {
            const headers = { 'Authorization': 'Bearer ' + data.token };
            const userRes = await fetch('/api/user/info', { headers });
            if (userRes.ok) {
              const userData = await userRes.json();
              setUser(userData);
              setActiveTab('profile');
              fetchProfileAndHistory(data.token);
            }
          } catch {}
        }
      }
    } else {
      if (res.ok) {
        alert('Signup successful! Please log in.');
        setAuthMode('login');
      } else {
        alert('Signup failed');
      }
    }
  };

  const fetchProfileAndHistory = async (token, switchToProfile = false) => {
    const headers = { 'Authorization': 'Bearer ' + token };
    const userRes = await fetch('/api/user/info', { headers });
    if (userRes.status === 401 || userRes.status === 403) {
      handleLogout();
      return;
    }
    if (userRes.ok) setUser(await userRes.json());
    const histRes = await fetch('/api/user/history', { headers });
    if (histRes.status === 401 || histRes.status === 403) {
      handleLogout();
      return;
    }
    if (histRes.ok) setHistory(await histRes.json());
    if (switchToProfile) setActiveTab('profile');
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    setJwt(null);
    setUser(null);
    setHistory([]);
    setActiveTab('welcome');
  };

  const isCanvasBlank = (canvas) => {
    const ctx = canvas.getContext('2d');
    const pixelBuffer = new Uint32Array(
      ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer
    );
    // Check if all pixels are black (0xff000000)
    return pixelBuffer.every(color => color === 0xff000000);
  };

  const predictDigit = async () => {
    const canvas = canvasRef.current;
    if (!canvas || isCanvasBlank(canvas)) {
      setResultMessage('Please draw a digit before predicting.');
      setTimeout(() => setResultMessage(''), 2000);
      return;
    }
    setLoading(true);
    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append('file', blob, 'digit.png');
      try {
        const response = await fetch('http://127.0.0.1:8000/predict', {
          method: 'POST',
          body: formData,
        });
        const data = await response.json();
        setPrediction(data);
      } catch (error) {
        setPrediction('Error');
      }
      setLoading(false);
    }, 'image/png');
  };

  const sendResult = async (result) => {
    if (!jwt || !user || !prediction) return;
    await fetch('/api/user/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + jwt
      },
      body: JSON.stringify({
        digit: prediction.prediction,
        confidence: prediction.confidence,
        result
      })
    });
    fetchProfileAndHistory(jwt);
    setResultMessage(`Result logged as ${result.charAt(0).toUpperCase() + result.slice(1)}!`);
    setTimeout(() => {
      setPrediction(null);
      setResultMessage('');
    clearCanvas();
    }, 1000);
  };

  const handleSessionResult = (result) => {
    if (result === 'success') setSessionSuccess(s => s + 1);
    else if (result === 'fail') setSessionFail(f => f + 1);
  };

  const resetSessionStats = () => {
    setSessionSuccess(0);
    setSessionFail(0);
  };

  useEffect(() => {
    if (jwt) fetchProfileAndHistory(jwt);
  }, [jwt]);

  useEffect(() => {
    if (activeTab === 'main') clearCanvas();
  }, [activeTab]);

  return (
    <div className="App">
      <nav className="navbar">
        <div className="navbar-title" onClick={() => setActiveTab('welcome')} style={{cursor:'pointer'}}>Digit Recognizer</div>
        <div className="navbar-right">
          <button className="navbar-btn" onClick={() => setActiveTab('main')}>Predict</button>
          <button className="navbar-btn" onClick={() => setActiveTab('about')}>About</button>
          {jwt && user && (
            <>
              <button className="round-icon-btn" title="Profile" onClick={() => setActiveTab('profile')}>
                <span role="img" aria-label="profile">👤</span>
              </button>
              <button className="round-icon-btn" title="Exit" onClick={handleLogout}>
                <span role="img" aria-label="exit">🚪</span>
              </button>
              <span style={{marginLeft: 12, fontWeight: 500}}>Hi, {user.username}</span>
            </>
          )}
          {!jwt && (
            <button className="login-btn" onClick={() => setShowAuth(true)}>Login</button>
          )}
        </div>
      </nav>
      {showAuth && (
        <div className="auth-modal">
          <button className="auth-close-btn" onClick={() => setShowAuth(false)} title="Close" style={{position:'absolute', top:18, right:24, background:'none', border:'none', fontSize:'2rem', color:'#6366f1', cursor:'pointer', fontWeight:700, zIndex:2}}>&times;</button>
          <h2>{authMode === 'login' ? 'Login' : 'Sign Up'}</h2>
          <input placeholder="Username" value={authForm.username} onChange={e => setAuthForm(f => ({...f, username: e.target.value}))} />
          {authMode === 'signup' && (
            <input placeholder="Email" value={authForm.email} onChange={e => setAuthForm(f => ({...f, email: e.target.value}))} />
          )}
          <input type="password" placeholder="Password" value={authForm.password} onChange={e => setAuthForm(f => ({...f, password: e.target.value}))} />
          <button className="auth-login-btn" style={{width:'100%', fontSize:'1.18rem', fontWeight:700, padding:'16px 0', marginTop:12}} onClick={handleAuth}>{authMode === 'login' ? 'Login' : 'Sign Up'}</button>
          <div className="auth-switch-text" style={{marginTop:18, width:'100%', textAlign:'center', color:'#6366f1', fontWeight:600, fontSize:'1.08rem', cursor:'pointer'}} onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}>
            {authMode === 'login' ? 'Don\'t have an account? Sign up' : 'Already have an account? Login'}
          </div>
        </div>
      )}
      {activeTab === 'welcome' && (
        <div className="welcome-tab">
          <h1>Welcome to the Handwritten Digit Recognition Portal</h1>
          <div style={{fontSize:'1.3rem', color:'#6366f1', marginBottom: '18px', fontWeight: 600, textAlign: 'center'}}>AI-powered digit recognition at your fingertips</div>
          <div className="welcome-gradient" style={{display:'block', padding:'18px 12px', width:'100%', maxWidth:'650px', margin:'0 auto'}}>
            <p style={{width: '100%', fontSize:'1.13rem', margin:'10px 0', color:'#444', textAlign:'center'}}>
              Experience the future of handwriting recognition! This platform lets you interactively draw digits and see how artificial intelligence interprets your input in real time. Whether you're curious, learning, or just want to test the AI, you're in the right place.
            </p>
            <ul style={{textAlign:'center', width: '100%', margin: '0 auto', fontSize: '1.08rem', color: '#333', fontWeight: 500, paddingLeft: 0, display:'block', listStylePosition:'inside'}}>
              <li>Draw any digit (0-9) on the canvas</li>
              <li>Get instant, accurate predictions</li>
              <li>Secure login and personal profile</li>
            </ul>
          </div>
          <button className="navbar-btn" style={{marginTop:32}} onClick={() => setActiveTab('main')}>Get Started</button>
        </div>
      )}
      {activeTab === 'main' && (
        <div className="main-content">
          <h1>Handwritten Digit Recognition</h1>
          <div className="main-predict-row">
            <div className="main-predict-col">
              <div className="canvas-controls">
                <canvas
                  ref={canvasRef}
                  width={320}
                  height={320}
                  className="digit-canvas"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                />
                <div className="pencil-size-control">
                  <label htmlFor="pencilSize">Pencil Size: </label>
                  <input
                    id="pencilSize"
                    type="range"
                    min="5"
                    max="40"
                    value={pencilSize}
                    onChange={e => setPencilSize(Number(e.target.value))}
                  />
                  <span>{pencilSize}px</span>
                </div>
              </div>
              <div className="button-group">
                <button onClick={clearCanvas} className="clear-btn">Clear</button>
                <button onClick={predictDigit} disabled={loading} className="predict-btn">
                  {loading ? 'Predicting...' : 'Predict'}
                </button>
              </div>
            </div>
            <div className="main-predict-col" style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'360px', height:'100%'}}>
              <h2 style={{color:'#6366f1', fontWeight:800, marginBottom:18, textAlign:'center', fontSize:'2.2rem'}}>Prediction</h2>
              {canvasRef.current === null ? (
                <div style={{color:'#888', fontSize:'1.2rem', textAlign:'center', marginTop: 24}}>
                  No prediction available. Canvas not loaded.
                </div>
              ) : prediction && prediction.prediction !== undefined ? (
                <>
                  <div style={{fontSize:'7rem', color:'#111', fontWeight:900, marginBottom:18, textAlign:'center', letterSpacing:'2px'}}>{prediction.prediction}</div>
                  {typeof prediction.confidence !== 'undefined' && (
                    <div style={{fontSize:'1.5rem', color:'#6366f1', fontWeight:700, marginBottom:24, textAlign:'center'}}>
                      Confidence: {Number(prediction.confidence).toFixed(2)} ({(Number(prediction.confidence) * 100).toFixed(1)}%)
                    </div>
                  )}
                  <div className="success-fail-btns" style={{marginTop: '8px', justifyContent:'center'}}>
                    <button
                      style={{fontSize:'1.3rem', fontWeight:700, padding:'14px 38px'}}
                      onClick={() => { if (jwt && user) { sendResult('success'); handleSessionResult('success'); } }}
                      disabled={!jwt || !user}
                      title={!jwt || !user ? 'Login to log your result' : ''}
                    >Success</button>
                    <button
                      style={{fontSize:'1.3rem', fontWeight:700, padding:'14px 38px'}}
                      onClick={() => { if (jwt && user) { sendResult('fail'); handleSessionResult('fail'); } }}
                      disabled={!jwt || !user}
                      title={!jwt || !user ? 'Login to log your result' : ''}
                    >Fail</button>
                  </div>
                  {resultMessage && (
                    <div style={{ color: '#6366f1', marginTop: 18, fontWeight: 700, textAlign:'center', fontSize:'1.35rem', letterSpacing:'1px' }}>{resultMessage}</div>
                  )}
                </>
              ) : (
                <div style={{color:'#888', fontSize:'1.2rem', textAlign:'center', marginTop: 24}}>
                  No prediction yet.<br/>Draw a digit and click Predict!
                </div>
              )}
            </div>
            <div className="session-stats-window">
              <h3>Session Stats</h3>
              <div className="session-stats-row">
                <span className="session-success">Success: <b>{sessionSuccess}</b></span>
                <span className="session-fail">Fail: <b>{sessionFail}</b></span>
              </div>
              <div className="session-stats-row">
                <span>Total Attempts: <b>{sessionSuccess + sessionFail}</b></span>
              </div>
              <div className="session-stats-row">
                <span>Success Rate: <b>{sessionSuccess + sessionFail > 0 ? ((sessionSuccess / (sessionSuccess + sessionFail)) * 100).toFixed(1) : 0}%</b></span>
              </div>
              <button className="session-reset-btn" onClick={resetSessionStats}>Reset Session</button>
            </div>
          </div>
        </div>
      )}
      {activeTab === 'profile' && jwt && user && (
        <div className="profile-page profile-card redesigned-profile">
          <div className="profile-main-row">
            {/* Left: Details and Summary as separate divs */}
            <div className="profile-main-left">
              <div className="profile-details-block">
                <div className="profile-header-row" style={{marginBottom: 12}}>
                  <h2 style={{color:'#6366f1', marginBottom:0}}>Profile</h2>
                  <button className="logout-btn" onClick={handleLogout}>Logout</button>
                </div>
                <div className="profile-info" style={{marginBottom: 12}}>
                  <div className="profile-row"><span className="profile-label">Username:</span> <span className="profile-value">{user.username}</span></div>
                  <div className="profile-row"><span className="profile-label">Email:</span> <span className="profile-value">{user.email}</span></div>
                </div>
              </div>
              <div className="profile-summary-block">
                <div className="profile-summary-card">
                  <h3 style={{color:'#6366f1', marginBottom:8}}>Prediction Summary</h3>
                  {(() => {
                    const total = history.length;
                    const success = history.filter(h => h.result === 'success').length;
                    const fail = history.filter(h => h.result === 'fail').length;
                    const rate = total > 0 ? ((success / total) * 100).toFixed(1) : 0;
                    return (
                      <div className="profile-summary-stats">
                        <span><b>Total Predictions:</b> {total}</span>
                        <span style={{color:'#16a34a'}}><b>Success:</b> {success}</span>
                        <span style={{color:'#ef4444'}}><b>Fail:</b> {fail}</span>
                        <span><b>Success Rate:</b> {rate}%</span>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
            {/* Right: History */}
            <div className="profile-main-right">
              <h3 style={{color:'#6366f1', textAlign:'center', marginBottom: 12}}>Prediction History</h3>
              <div className="history-list redesigned-history-list">
                {history.length === 0 ? (
                  <p style={{color:'#888'}}>No predictions yet.</p>
                ) : (
                  <ul className="history-ul">
                    {history.map((item, idx) => {
                      let formattedTime = item.timestamp;
                      if (item.timestamp) {
                        const d = new Date(item.timestamp);
                        if (!isNaN(d)) {
                          const pad = n => n.toString().padStart(2, '0');
                          formattedTime = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
                        }
                      }
                      return (
                        <li key={idx} className={`history-item ${item.result === 'success' ? 'history-success' : 'history-fail'}`}>
                          <span className="history-digit" style={{marginRight: 18}}>Digit: <b>{item.digit}</b></span>
                          <span className="history-result" style={{marginRight: 18}}>Result: <b style={{color: item.result === 'success' ? 'green' : 'red'}}>{item.result}</b></span>
                          <span className="history-time">Date/Time: {formattedTime}</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {activeTab === 'about' && (
        <div className="about-tab">
          <h1>About This Project</h1>
          <div className="about-content">
            <p>
              This Handwritten Digit Recognition System is a full-stack web application that lets you draw digits and get instant predictions using a deep learning model. Your prediction history is securely stored and accessible via your profile.<br/><br/>
            </p>
          </div>
          <div className="about-features-tech-row" style={{display:'flex', flexDirection:'row', gap: '32px', width:'100%', justifyContent:'center', marginBottom: '24px'}}>
            <div className="about-features-card" style={{flex:'1 1 0', maxWidth: '420px', background:'#f8fafc', borderRadius:16, boxShadow:'0 2px 8px rgba(99,102,241,0.07)', padding:'18px 24px'}}>
              <h2 style={{color:'#6366f1', fontSize:'1.35rem', fontWeight:700, marginBottom:10, textAlign:'center'}}>Features</h2>
              <ul style={{color:'#333', fontSize:'1.08rem', fontWeight:500, marginBottom:0, paddingLeft:24}}>
                <li>Draw digits (0-9) on an interactive canvas</li>
                <li>Get instant, AI-powered predictions</li>
                <li>Track your prediction history and success rate</li>
                <li>Modern, responsive, and user-friendly interface</li>
                <li>Secure login and personal profile</li>
              </ul>
            </div>
            <div className="about-tech-card" style={{flex:'1 1 0', maxWidth: '420px', background:'#f8fafc', borderRadius:16, boxShadow:'0 2px 8px rgba(99,102,241,0.07)', padding:'18px 24px'}}>
              <h2 style={{color:'#6366f1', fontSize:'1.35rem', fontWeight:700, marginBottom:10, textAlign:'center'}}>Technologies Used</h2>
              <ul style={{color:'#333', fontSize:'1.08rem', fontWeight:500, marginBottom:0, paddingLeft:24}}>
                <li>React (Frontend)</li>
                <li>FastAPI (Prediction API)</li>
                <li>Spring Boot (User Management & Backend)</li>
                <li>MySQL (Database)</li>
                <li>JWT Authentication (Security)</li>
                <li>Modern CSS (Responsive Design)</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
