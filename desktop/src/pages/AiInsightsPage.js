import React from 'react';

const AiInsightsPage = () => {
  return (
    <div>
      <h1 style={{ color: 'white', fontSize: '2rem', fontWeight: '600', marginBottom: '1rem' }}>
        AI Insights
      </h1>
      <p style={{ color: '#9ca3af', fontSize: '1rem', marginBottom: '2rem' }}>
        Artificial Intelligence powered security analysis and recommendations
      </p>
      
      <div style={{
        backgroundColor: 'rgba(17, 24, 39, 0.8)',
        backdropFilter: 'blur(24px)',
        borderRadius: '1rem',
        padding: '2rem',
        border: '1px solid rgba(55, 65, 81, 0.3)',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.5)'
      }}>
        <h2 style={{ color: 'white', fontSize: '1.5rem', fontWeight: '600', marginBottom: '1rem' }}>
          AI Security Analysis
        </h2>
        <p style={{ color: '#9ca3af' }}>
          This page will contain AI-powered security insights, threat predictions, and automated recommendations.
        </p>
      </div>
    </div>
  );
};

export default AiInsightsPage;
