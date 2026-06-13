import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const socket = io('http://localhost:5000');

function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [myApplications, setMyApplications] = useState([]);

  const navigate = useNavigate();

  // localStorage se token uthao — hai toh logged in, nahi toh logged out
  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;

  // token decode karke user ki id nikalo
  let userId = null;
  if (token) {
    try {
      userId = jwtDecode(token).id;
    } catch (e) {
      userId = null;
    }
  }

  useEffect(() => {
    fetch('http://localhost:5000/jobs')
      .then((response) => response.json())
      .then((data) => setJobs(data))
      .catch((error) => console.log('Error fetching jobs:', error));

    // Agar logged in hai toh apni applications laao
    if (userId) {
      fetch(`http://localhost:5000/applications/${userId}`)
        .then((res) => res.json())
        .then((data) => setMyApplications(data))
        .catch((err) => console.log('Error fetching applications:', err));
    }
    
      socket.on('newJob', (newJob) => {
      setJobs((previousJobs) => [...previousJobs, newJob]);
    });

    return () => {
      socket.off('newJob');
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !company) return;

    fetch('http://localhost:5000/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
       },
      body: JSON.stringify({ title, company }),
    })
      .then((res) => res.json())
      .then(() => {
        setTitle('');
        setCompany('');
      })
      .catch((err) => console.log('Error adding job:', err));
  };

  // logout — token hatao, login page bhejo
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // job pe apply karo
  const handleApply = (jobId) => {
    fetch('http://localhost:5000/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
       },
      body: JSON.stringify({ job_id: jobId, user_id: userId }),
    })
      .then((res) => res.json())
      .then((data) => {
        alert(data.message);
        // apply ke baad list dobara laao
        if (userId) {
          fetch(`http://localhost:5000/applications/${userId}`)
            .then((res) => res.json())
            .then((data) => setMyApplications(data));
        }
      })
      .catch(() => alert('Error applying'));
  };
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.headerTitle}>Campus Hiring Portal</h1>
            <p style={styles.headerSubtitle}>
              Find and post jobs for campus placements
            </p>
          </div>
          {isLoggedIn ? (
            <button style={styles.authBtn} onClick={handleLogout}>
              Logout
            </button>
          ) : (
            <button style={styles.authBtn} onClick={() => navigate('/login')}>
              Login
            </button>
          )}
        </header>

        {isLoggedIn ? (
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Post a New Job</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
              <input
                style={styles.input}
                type="text"
                placeholder="Job title (e.g. Frontend Developer)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <input
                style={styles.input}
                type="text"
                placeholder="Company (e.g. TCS)"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
              />
              <button style={styles.button} type="submit">
                Add Job
              </button>
            </form>
          </div>
        ) : (
          <div style={styles.loginPrompt}>
            <p style={styles.promptText}>Login to post a job</p>
          </div>
        )}

        {isLoggedIn && myApplications.length > 0 && (
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>My Applications</h2>
            {myApplications.map((app) => (
              <div key={app.id} style={styles.appItem}>
                <span style={styles.appTitle}>{app.title}</span>
                <span style={styles.appCompany}>{app.company}</span>
              </div>
            ))}
          </div>
        )}

        <h2 style={styles.sectionTitle}>
          Available Jobs <span style={styles.count}>{jobs.length}</span>
        </h2>

        <div style={styles.jobGrid}>
          {jobs.map((job) => (
            <div key={job.id} style={styles.jobCard}>
              <h3 style={styles.jobTitle}>{job.title}</h3>
              <p style={styles.jobCompany}>{job.company}</p>
              {isLoggedIn && (
                <button style={styles.applyBtn} onClick={() => handleApply(job.id)}>
                  Apply
                </button>
              )}
            </div>
          ))}
        </div>

        {jobs.length === 0 && (
          <p style={styles.empty}>No jobs yet. Post the first one above!</p>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f4f5f7',
    fontFamily: "'Segoe UI', Arial, sans-serif",
    padding: '40px 20px',
  },
  container: { maxWidth: '700px', margin: '0 auto' },
  header: {
    marginBottom: '32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitle: { fontSize: '32px', color: '#1e1b4b', margin: '0 0 4px 0' },
  headerSubtitle: { color: '#6b7280', margin: 0, fontSize: '15px' },
  authBtn: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#4f46e5',
    background: '#fff',
    border: '1px solid #4f46e5',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  card: {
    background: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    marginBottom: '32px',
  },
  loginPrompt: {
    background: '#eef2ff',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center',
    marginBottom: '32px',
  },
  promptText: { margin: 0, color: '#4f46e5', fontSize: '15px', fontWeight: '500' },
  sectionTitle: {
    fontSize: '18px',
    color: '#1f2937',
    margin: '0 0 16px 0',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  count: {
    background: '#4f46e5',
    color: '#fff',
    fontSize: '13px',
    padding: '2px 10px',
    borderRadius: '20px',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '12px' },
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
  },
  

appItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: '1px solid #f0f0f0',
  },
  appTitle: { color: '#111827', fontWeight: '500' },
  appCompany: { color: '#6b7280', fontSize: '14px' },


  jobGrid: { display: 'flex', flexDirection: 'column', gap: '12px' },
  jobCard: {
    background: '#ffffff',
    borderRadius: '10px',
    padding: '18px 20px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
    borderLeft: '4px solid #4f46e5',
    textAlign: 'left',
  },
  jobTitle: { margin: '0 0 4px 0', fontSize: '17px', color: '#111827' },
  jobCompany: { margin: '0 0 0 0', color: '#6b7280', fontSize: '14px' },
  applyBtn: {
    marginTop: '12px',
    padding: '8px 18px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#fff',
    background: '#4f46e5',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  empty: { textAlign: 'center', color: '#9ca3af', marginTop: '20px' },
};

export default JobsPage;
