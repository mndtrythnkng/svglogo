import { useState } from 'react';

function App() {
  const [url, setUrl] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResults(null);

    try {
      const res = await fetch('/api/find-logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      const data = await res.json();
      setResults(data);

    } catch (err) {
      console.error(err);
      setResults({ error: 'Failed to fetch data' });
  }

  setLoading(false);
};

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', fontFamily: 'Arial' }}>
      <h1>SVG Logo Finder</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter website URL"
          style={{ width: '80%', padding: '8px' }}
        />
        <button type="submit" style={{ padding: '8px' }}>Search</button>
      </form>

      {loading && <p>Searching…</p>}

      {results && (
        <div style={{ marginTop: '1rem' }}>
          {results.found && (
            <>
              <h2>Found SVG Logos:</h2>
              <ul>
                {results.links.map((link, i) => (
                  <li key={i}><a href={link} target="_blank" rel="noopener noreferrer">{link}</a></li>
                ))}
              </ul>
            </>
          )}

          {results.foundInline && (
            <>
              <h2>Found Inline SVGs:</h2>
              {results.svgs.map((svg, i) => (
                <div key={i}>
                  <a
                    href={`data:image/svg+xml,${encodeURIComponent(svg)}`}
                    download={`inline-logo-${i+1}.svg`}
                  >
                    Download Inline SVG #{i+1}
                  </a>
                  <div dangerouslySetInnerHTML={{ __html: svg }} style={{ margin: '10px 0' }} />
                </div>
              ))}
            </>
          )}

          {(!results.found && !results.foundInline) && (
            <p>{results.message}</p>
          )}

          {results.error && <p style={{ color: 'red' }}>{results.error}</p>}
        </div>
      )}
    </div>
  );
}

export default App;
