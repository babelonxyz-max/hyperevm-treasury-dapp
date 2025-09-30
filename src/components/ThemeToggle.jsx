import React from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = ({ theme, onThemeChange }) => {
  const handleToggle = () => {
    onThemeChange(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <button
      className="theme-toggle" 
      data-theme={theme}
      onClick={handleToggle}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
      aria-pressed={theme === 'dark'}
      type="button"
      role="switch"
    >
      <div className="theme-toggle-track">
        <div className="theme-toggle-thumb">
          <Sun className="theme-toggle-icon sun" size={16} aria-hidden="true" />
          <Moon className="theme-toggle-icon moon" size={16} aria-hidden="true" />
        </div>
        <div className="theme-toggle-icons">
          <Sun className="theme-toggle-icon-static sun" size={16} aria-hidden="true" />
          <Moon className="theme-toggle-icon-static moon" size={16} aria-hidden="true" />
        </div>
      </div>
      <span className="sr-only">
        Current theme: {theme}. Click to switch to {theme === 'light' ? 'dark' : 'light'} theme.
      </span>
    </button>
  );
};

export default ThemeToggle;