import { useState, useEffect } from 'react';

function App() {
  // 'jobs' is our state — starts as an empty array.
  // setJobs is the function we use to update it.
  const [jobs, setJobs] = useState([]);

  // useEffect runs code when the component first loads.
  useEffect(() => {
    // Fetch the job list from our backend.
    fetch('http://localhost:5000/jobs')
      .then((response) => response.json())   // turn the response into usable data
      .then((data) => setJobs(data))         // put that data into our 'jobs' state
      .catch((error) => console.log('Error fetching jobs:', error));
  }, []);   // the empty [] means "run this only once, on load"

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Campus Hiring Portal</h1>
      <h2>Available Jobs</h2>

      {/* Loop over the jobs and show one block per job */}
      {jobs.map((job) => (
        <div
          key={job.id}
          style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}
        >
          <h3>{job.title}</h3>
          <p>{job.company}</p>
        </div>
      ))}
    </div>
  );
}

export default App;