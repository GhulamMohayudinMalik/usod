import React, { useState } from 'react';

const TestPage = () => {
  const [value, setValue] = useState('');

  return (
    <div style={{ padding: '20px', background: 'black', color: 'white', minHeight: '100vh' }}>
      <h1>Input Test Page</h1>
      <p>Current value: {value}</p>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Type here..."
        style={{
          padding: '10px',
          fontSize: '16px',
          width: '300px',
          backgroundColor: 'white',
          color: 'black',
          border: '1px solid #ccc'
        }}
      />
      <br />
      <br />
      <button 
        onClick={() => setValue('')}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: 'blue',
          color: 'white',
          border: 'none',
          cursor: 'pointer'
        }}
      >
        Clear
      </button>
    </div>
  );
};

export default TestPage;
