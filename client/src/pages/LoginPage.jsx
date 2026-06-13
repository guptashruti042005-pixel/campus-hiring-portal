import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    fetch('http://localhost:5000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.token) {
          // token mila -> browser mein save karo
          localStorage.setItem('token', data.token);
          setMessage('Login successful! Redirecting...');
          setTimeout(() => navigate('/'), 1000);   // jobs page pe bhejo
        } else {
          setMessage(data.message || 'Login failed');
        }
      })
      .catch(() => setMessage('Something went wrong'));
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.title}>Welcome Back</h1>
        <p style={styles.subtitle}>Login to post jobs</p>

        <form onSubmit={handleLogin} style={styles.form}>
          <input
            style={styles.input}
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button style={styles.button} type="submit">
            Login
          </button>
        </form>

        {message && <p style={styles.message}>{message}</p>}

        <p style={styles.footer}>
          Don't have an account? <Link to="/register" style={styles.link}>Register</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f4f5f7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Segoe UI', Arial, sans-serif",
    padding: '20px',
  },
  card: {
    background: '#fff',
    borderRadius: '12px',
    padding: '36px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    width: '100%',
    maxWidth: '400px',
  },
  title: { fontSize: '26px', color: '#1e1b4b', margin: '0 0 4px 0' },
  subtitle: { color: '#6b7280', margin: '0 0 24px 0', fontSize: '14px' },
  form: { display: 'flex', flexDirection: 'column', gap: '14px' },
  input: {
    padding: '12px 14px',
    fontSize: '15px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    outline: 'none',
    background: '#fff',
    color: '#111827',
  },
  button: {
    padding: '12px',
    fontSize: '15px',
    fontWeight: '600',
    color: '#fff',
    background: '#4f46e5',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginTop: '4px',
  },
  message: { textAlign: 'center', color: '#4f46e5', fontSize: '14px', marginTop: '16px' },
  footer: { textAlign: 'center', color: '#6b7280', fontSize: '14px', marginTop: '20px' },
  link: { color: '#4f46e5', textDecoration: 'none', fontWeight: '600' },
};

export default LoginPage;