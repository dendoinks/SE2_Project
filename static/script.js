// Create animated background particles
function createParticles() {
  const container = document.getElementById('particles');
  const particleCount = 50;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';

    const size = Math.random() * 4 + 2;
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.top = Math.random() * 100 + '%';
    particle.style.animationDelay = Math.random() * 6 + 's';
    particle.style.animationDuration = (Math.random() * 3 + 4) + 's';

    container.appendChild(particle);
  }
}

document.getElementById('analyzeBtn').addEventListener('click', async function () {
  const btn = this;
  const btnText = document.getElementById('btnText');
  const resultPanel = document.getElementById('resultPanel');

  const textInput = document.getElementById('textInput').value.trim();

  if (!textInput) {
    alert('Please enter some text for analysis.');
    return;
  }

  btnText.innerHTML = '<span class="loading"></span> Analyzing...';
  btn.style.pointerEvents = 'none';

  try {
    const result = await fetch('/api/analyze-text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: textInput })
    }).then(res => res.json());

    displayResults(result);
  } catch (error) {
    console.error('Analysis error:', error);
    displayError('Analysis failed. Please try again.');
  } finally {
    btnText.innerHTML = '🔍 Analyze Content';
    btn.style.pointerEvents = 'auto';
  }
});

// Display function for results
function displayResults(result) {
  const resultPanel = document.getElementById('resultPanel');

  const confidence = result.confidence || 0;
  const prediction = result.prediction || 'unknown';
  const explanation = result.explanation || [];
  
  // Confidence color based on confidence level
  const confidenceColor = confidence > 0.7 ? '#10b981' : confidence > 0.4 ? '#f59e0b' : '#ef4444';
  
  // Determine the icon based on prediction (fake or real)
  const predictionIcon = prediction.toLowerCase().includes('fake') ? '⚠️' : '✅';

  // Format the explanation if it's an array
  const explanationText = Array.isArray(explanation) 
    ? explanation.map(reason => `<li>${reason}</li>`).join('')
    : explanation;

  // Display results with explanation
  resultPanel.innerHTML = `
    <h2>
      <div class="icon">📊</div>
      Detection Results
    </h2>
    <div style="space-y: 1rem;">
      <div style="padding: 1.5rem; background: #f8fafc; border-radius: 12px; border-left: 4px solid ${confidenceColor};">
        <div style="display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem;">
          <span style="font-size: 1.5rem;">${predictionIcon}</span>
          <div>
            <strong style="font-size: 1.2rem; color: #1a202c;">
              ${prediction.charAt(0).toUpperCase() + prediction.slice(1)}
            </strong>
            <div style="color: #718096; font-size: 0.9rem;">
              Confidence: ${(confidence * 100).toFixed(1)}%
            </div>
          </div>
        </div>
        <div style="color: #4a5568; line-height: 1.6;">
          <ul style="padding-left: 20px;">
            ${explanationText}
          </ul>
        </div>
      </div>
    </div>
  `;
}

function displayError(message) {
  const resultPanel = document.getElementById('resultPanel');
  resultPanel.innerHTML = `
    <h2>
      <div class="icon">📊</div>
      Detection Results
    </h2>
    <div style="padding: 1.5rem; background: #fef2f2; border-radius: 12px; border-left: 4px solid #ef4444; color: #991b1b;">
      <strong>Error:</strong> ${message}
    </div>
  `;
}

createParticles();
document.documentElement.style.scrollBehavior = 'smooth';
