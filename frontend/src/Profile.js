import React, { useEffect, useState } from 'react';

function Profile({ jwt }) {
  const [user, setUser] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!jwt) return;
    const headers = { 'Authorization': 'Bearer ' + jwt };
    fetch('/api/user/info', { headers })
      .then(res => res.ok ? res.json() : null)
      .then(data => setUser(data));
    fetch('/api/user/history', { headers })
      .then(res => res.ok ? res.json() : [])
      .then(data => setHistory(data));
  }, [jwt]);

  if (!jwt) return <div>Please log in to view your profile.</div>;
  if (!user) return <div>Loading profile...</div>;

  return (
    <div className="profile-section">
      <h2>Profile</h2>
      <p><b>Username:</b> {user.username}</p>
      <p><b>Email:</b> {user.email}</p>
      <h3>Prediction History</h3>
      <ul>
        {history.map(h => (
          <li key={h.id}>
            Digit: {h.digit}, Confidence: {h.confidence}, Result: {h.result}, Time: {h.timestamp}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Profile; 