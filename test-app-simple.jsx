// Simple test to see if React renders at all
import React from 'react';

export default function TestApp() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Test App - If you see this, React is working</h1>
      <p>Current time: {new Date().toISOString()}</p>
    </div>
  );
}
