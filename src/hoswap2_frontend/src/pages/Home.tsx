import React from 'react';
import './certinode.css';

const Home: React.FC = () => {
  return (
    <>
      <div className="container">
        <nav>
          <a href="./Home" className="logo">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#b62fb0" strokeWidth="3"/>
              <path d="M12 14.5C13.3807 14.5 14.5 13.3807 14.5 12C14.5 10.6193 13.3807 9.5 12 9.5C10.6193 9.5 9.5 10.6193 9.5 12C9.5 13.3807 10.6193 14.5 12 14.5Z" fill="#b62fb0"/>
              <path d="M12 8V2" stroke="#b62fe0" strokeWidth="3" strokeLinecap="round"/>
              <path d="M16 12H22" stroke="#b62fe0" strokeWidth="3" strokeLinecap="round"/>
            </svg>
            Certi<span>Node</span>
          </a>
          <div className="nav-links">
            <a href="#">Features</a>
            <a href="#">How It Works</a>
            <a href="#">For Institutions</a>
            <a href="#">About</a>
          </div>
          <div>
            <a href="./login" className="btn btn-primary">Log In</a>
            <a href="./login" className="btn btn-secondary">Sign Up</a>
          </div>
        </nav>
      </div>
      
      <section className="hero">
        <div className="blob blob1"></div>
        <div className="blob blob2"></div>
        <div className="container">
          <h1>Secure Academic Credentials on the Blockchain</h1>
          <p>CertiNode leverages Internet Computer Protocol (ICP) to provide tamper-proof, instantly verifiable digital credentials. Upload once, verify anywhere.</p>
          <div className="hero-actions">
            <a href="./upload" className="btn btn-primary StartGet">Get Started</a>
            <a href="#" className="btn btn-secondary LMore">Learn More</a>
          </div>
          
          <div className="demo-container">
            <div className="demo-header">
              <div className="demo-dot demo-red"></div>
              <div className="demo-dot demo-yellow"></div>
              <div className="demo-dot demo-green"></div>
            </div>
            <div className="demo-content">
              <h3>How CertiNode Works</h3>
              <div className="workflow">
                <div className="workflow-step">
                  <div className="workflow-icon">📤</div>
                  <p>Upload Document</p>
                </div>
                <div className="workflow-arrow"></div>
                <div className="workflow-step">
                  <div className="workflow-icon">✅</div>
                  <p>Verify Authenticity</p>
                </div>
                <div className="workflow-arrow"></div>
                <div className="workflow-step">
                  <div className="workflow-icon">🔐</div>
                  <p>Mint NFT Certificate</p>
                </div>
                <div className="workflow-arrow"></div>
                <div className="workflow-step">
                  <div className="workflow-icon">🌐</div>
                  <p>Share <br /> Globally</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="features">
        <div className="container">
          <div className="section-header">
            <h2>Our Solution</h2>
            <p>CertiNode transforms how academic credentials are issued, stored, and verified using blockchain technology</p>
          </div>
          <div className="feature-grid">
            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h3>Tamper-Proof Verification</h3>
              <p>Documents are cryptographically sealed on the ICP blockchain, making them impossible to forge or tamper with.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⚡</div>
              <h3>Instant Verification</h3>
              <p>Verify credentials in seconds instead of days or weeks. No more emails or phone calls to institutions.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌐</div>
              <h3>Global Accessibility</h3>
              <p>Access your credentials from anywhere in the world. Share them with employers and institutions with a simple link.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔑</div>
              <h3>ICP Wallet Login</h3>
              <p>Secure authentication through your Internet Computer Protocol wallet with no password to remember.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🪙</div>
              <h3>NFT Credentials</h3>
              <p>Each verified document is minted as a unique NFT, giving you full ownership and control of your credentials.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🛡️</div>
              <h3>Privacy Controls</h3>
              <p>You decide who sees your credentials and for how long. Revoke access at any time.</p>
            </div>
          </div>
        </div>
      </section>
      
      <section className="steps">
        <div className="container">
          <div className="section-header">
            <h2>How It Works</h2>
            <p>Four simple steps to secure your academic credentials forever</p>
          </div>
          <div className="step-container">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Connect Your ICP Wallet</h3>
                <p>Sign in securely with your Internet Computer Protocol wallet. No passwords, no hassle, complete security.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Upload Your Documents</h3>
                <p>Upload your academic certificates, degrees, or transcripts through our secure interface.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Verification Process</h3>
                <p>Our system verifies your documents through trusted institutional partnerships and advanced AI verification.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>Receive Your NFT Certificate</h3>
                <p>Once verified, your document is minted as an NFT on the ICP blockchain. Share it with anyone, anytime, or retrieve it using the NFT ID.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="network">
        <div className="container">
          <div className="section-header">
            <h2>Trusted Network</h2>
            <p>Join hundreds of universities, employers and institutions already using CertiNode</p>
          </div>
          <div className="network-grid">
            <div className="network-item">
              <svg width="100" height="40" viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="10" y="10" width="80" height="20" rx="4" stroke="#FFFFFF" strokeWidth="2"/>
                <text x="50" y="25" fontFamily="Arial" fontSize="12" fill="#FFFFFF" textAnchor="middle">University A</text>
              </svg>
            </div>
            <div className="network-item">
              <svg width="100" height="40" viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="10" y="10" width="80" height="20" rx="4" stroke="#FFFFFF" strokeWidth="2"/>
                <text x="50" y="25" fontFamily="Arial" fontSize="12" fill="#FFFFFF" textAnchor="middle">University B</text>
              </svg>
            </div>
            <div className="network-item">
              <svg width="100" height="40" viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="10" y="10" width="80" height="20" rx="4" stroke="#FFFFFF" strokeWidth="2"/>
                <text x="50" y="25" fontFamily="Arial" fontSize="12" fill="#FFFFFF" textAnchor="middle">Company X</text>
              </svg>
            </div>
            <div className="network-item">
              <svg width="100" height="40" viewBox="0 0 100 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="10" y="10" width="80" height="20" rx="4" stroke="#FFFFFF" strokeWidth="2"/>
                <text x="50" y="25" fontFamily="Arial" fontSize="12" fill="#FFFFFF" textAnchor="middle">Institution Y</text>
              </svg>
            </div>
          </div>
        </div>
      </section>
      
      <footer>
        <div className="container">
          <div className="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Contact Us</a>
            <a href="#">FAQ</a>
          </div>
          <p className="copyright">© 2025 CertiNode. Powered by Internet Computer Protocol.</p>
          <img className="powered" src="/src/hoswap2_frontend/icp.png" alt="ICP Logo" />
        </div>
      </footer>
    </>
  );
};

export default Home;