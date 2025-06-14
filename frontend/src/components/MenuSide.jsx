import './MenuSide.css'

export default function MenuSide({ onFlip }) {
  const menuItems = [
    { label: 'Home', icon: '🏠', action: () => onFlip() },
    { label: 'Joachim', icon: '🤖', action: () => {} },
    { label: 'Sign In', icon: '👤', action: () => {} },
    { label: 'Sign Up', icon: '✨', action: () => {} }
  ]

  const socialLinks = [
    { label: 'Facebook', icon: '📘', url: '#' },
    { label: 'Instagram', icon: '📷', url: '#' },
    { label: 'Telegram', icon: '💬', url: '#' }
  ]

  return (
    <div className="menu-container">
      <div className="menu-header">
        <h1 className="menu-title">Joachim</h1>
        <p className="menu-subtitle">Voice Assistant</p>
      </div>

      <nav className="menu-nav">
        <div className="menu-section">
          <h2 className="section-title">Navigation</h2>
          <ul className="menu-list">
            {menuItems.map((item, index) => (
              <li key={index} className="menu-item">
                <button 
                  className="menu-button"
                  onClick={item.action}
                >
                  <span className="menu-icon">{item.icon}</span>
                  <span className="menu-label">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="menu-section">
          <h2 className="section-title">Connect</h2>
          <ul className="menu-list social-list">
            {socialLinks.map((link, index) => (
              <li key={index} className="menu-item">
                <a 
                  href={link.url}
                  className="menu-button social-button"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="menu-icon">{link.icon}</span>
                  <span className="menu-label">{link.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="menu-footer">
        <p className="footer-text">Double-tap to return</p>
      </div>
    </div>
  )
}