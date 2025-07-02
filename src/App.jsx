import { useState } from 'react'
import './App.css'

function App() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setResponse('');

    try {
      const ollamaResponse = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3', // Or any other model you have pulled with Ollama
          prompt: prompt,
          stream: false, // Set to true if you want to stream responses
        }),
      });

      if (!ollamaResponse.ok) {
        const errorData = await ollamaResponse.json();
        throw new Error(errorData.error || `API request failed with status ${ollamaResponse.status}`);
      }

      const data = await ollamaResponse.json();
      setResponse(data.response);
    } catch (err) {
      setError(err.message);
      console.error('Error interacting with Ollama API:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1>Study AI</h1>
      <div className="ollama-interaction">
        <h2>Ask Ollama</h2>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your study-related prompt here (e.g., Explain the concept of photosynthesis.)"
          rows="4"
        />
        <button onClick={handleSubmit} disabled={loading}>
          {loading ? 'Loading...' : 'Submit'}
        </button>
        {error && <p className="error">Error: {error}</p>}
        {response && (
          <div className="response">
            <h3>Response:</h3>
            <pre>{response}</pre>
          </div>
        )}
      </div>
    </>
  )
}

export default App
