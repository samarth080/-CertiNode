import React, { useState, useEffect } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import './Login.css';

interface TabProps {
  id: string;
  active: boolean;
  children: React.ReactNode;
}

interface GoogleAuthResponse {
  credential: string;
}

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: () => void;
        };
      };
    };
  }
}

const Login: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  // Handle tab switching
  const openTab = (tabName: 'login' | 'register') => {
    setActiveTab(tabName);
  };

  // Connect ICP Wallet
  const connectICPWallet = async () => {
    try {
      const authClient = await AuthClient.create();
      await authClient.login({
        identityProvider: "https://identity.ic0.app",
        onSuccess: async () => {
          const identity = authClient.getIdentity();
          const principal = identity.getPrincipal().toText();
          console.log("Logged in as:", principal);
          alert("Logged in as: " + principal);
        },
      });
    } catch (error) {
      console.error("Error connecting to ICP wallet:", error);
      alert("Error connecting to ICP wallet");
    }
  };

  // Handle Google Sign-in response
  const handleGoogleCredentialResponse = (response: GoogleAuthResponse) => {
    // Get the JWT ID token
    const idToken = response.credential;
    
    // Send the token to your backend for verification
    fetch('/api/google-auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken }),
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        // Handle successful authentication
        console.log("Logged in with Google as:", data.user.email);
        alert("Logged in with Google as: " + data.user.email);
        
        // Redirect user or update UI as needed
        window.location.href = "/dashboard";
      } else {
        // Handle authentication failure
        console.error("Google authentication failed:", data.error);
        alert("Google authentication failed: " + data.error);
      }
    })
    .catch(err => {
      console.error("Error during Google authentication:", err);
      alert("Error during Google authentication");
    });
  };

  // Handle login form submission
  const handleLoginSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('login-email') as string;
    const password = formData.get('login-password') as string;
    
    console.log("Login attempt with:", email);
    alert("Login attempt with: " + email);
    
    // Add your email/password authentication logic here
    // Example fetch request would go here
  };

  // Handle registration form submission
  const handleRegisterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('register-name') as string;
    const email = formData.get('register-email') as string;
    const password = formData.get('register-password') as string;
    const confirmPassword = formData.get('register-confirm') as string;
    
    // Basic validation
    if (password !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    
    console.log("Registration attempt with:", email);
    alert("Registration attempt with: " + email);
    
    // Add your registration logic here
    // Example fetch request would go here
  };

  // Load Google's OAuth API
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
    
    script.onload = () => {
      window.google.accounts.id.initialize({
        client_id: 'YOUR_GOOGLE_CLIENT_ID', // Replace with your actual Google Client ID
        callback: handleGoogleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });
    };

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Tab component
  const Tab: React.FC<TabProps> = ({ id, active, children }) => (
    <div id={id} className={`tab-content ${active ? 'active' : ''}`}>
      {children}
    </div>
  );

  return (
    <>
    
    <div className="container">
      <nav>
        <a href="./home" className="logo">
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
        <a href="./" className="btn btn-secondary">Back to Home</a>
      </nav>
      
      <main className="main-content">
        <div className="blob blob1"></div>
        <div className="blob blob2"></div>
        <div className="container">
            <div className="section-header">
              <h2>Welcome to CertiNode</h2>
              <p>Access your secure document vault</p>
            </div>
          <div className="login-container">
            <div className="login-image">
              <h2>Secure Your Academic Future</h2>
              <p>Transform your paper credentials into tamper-proof digital assets that can be instantly verified anywhere in the world.</p>
              <div className="info-box">
                <h4>Why use CertiNode?</h4>
                <p>With CertiNode, your academic achievements become verifiable, transferable, and immutable digital assets that you truly own.</p>
              </div>
              <div className="info-box">
                <h4>New to ICP?</h4>
                <p>The Internet Computer Protocol is a next-generation blockchain that enables secure, decentralized applications and services.</p>
              </div>
            </div>
            <div className="login-content">
              
              <div className="tab-header">
                <button 
                  className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`} 
                  onClick={() => openTab('login')}
                >
                  Login
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'register' ? 'active' : ''}`} 
                  onClick={() => openTab('register')}
                >
                  Register
                </button>
              </div>
              
              <Tab id="login" active={activeTab === 'login'}>
                <button className="wallet-btn" onClick={connectICPWallet}>
                  <svg className="icp-logo" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="16" cy="16" r="15" fill="#29ABE2" fillOpacity="0.2" stroke="#29ABE2" strokeWidth="2"/>
                    <path d="M16 8V24" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M24 16H8" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Connect with ICP Wallet
                  <img width="80px" height="80px" src="/home/prady/hoswap2/internet-computer-icp-logo.png"/>
                </button>
                
                <div className="or-divider">
                  <span>OR</span>
                </div>
                
                <form id="login-form" onSubmit={handleLoginSubmit}>
                  <div className="input-group">
                    <label htmlFor="login-email">Email Address</label>
                    <input type="email" id="login-email" name="login-email" placeholder="Enter your email" required />
                  </div>
                  <div className="input-group">
                    <label htmlFor="login-password">Password</label>
                    <input type="password" id="login-password" name="login-password" placeholder="Enter your password" required />
                  </div>
                  <button className="google-btn" type="button" id="login-google-btn" onClick={() => window.google?.accounts?.id?.prompt()}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Sign in with Google
                  </button>
                  <div className="forgot-password">
                    <a href="#">Forgot password?</a>
                  </div>
                  <div className="remember-me">
                    <input type="checkbox" id="remember" name="remember" />
                    <label htmlFor="remember">Remember me</label>
                  </div>
                  <button type="submit" className="form-btn">Login</button>
                </form>
              </Tab>
              
              <Tab id="register" active={activeTab === 'register'}>
                <button className="wallet-btn" onClick={connectICPWallet}>
                  <svg className="icp-logo" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="16" cy="16" r="15" fill="#29ABE2" fillOpacity="0.2" stroke="#29ABE2" strokeWidth="2"/>
                    <path d="M16 8V24" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M24 16H8" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Register with ICP Wallet
                  <img width="80px" height="80px" src="/home/prady/hoswap2/src/hoswap2_frontend/assets/icp.png" alt="icp-logo" />
                </button>
                
                <button className="google-btn" type="button" id="register-google-btn" onClick={() => window.google?.accounts?.id?.prompt()}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign up with Google
                </button>
                
                <div className="or-divider">
                  <span>OR</span>
                </div>
                
                <form id="register-form" onSubmit={handleRegisterSubmit}>
                  <div className="input-group">
                    <label htmlFor="register-name">Full Name</label>
                    <input type="text" id="register-name" name="register-name" placeholder="Enter your full name" required />
                  </div>
                  <div className="input-group">
                    <label htmlFor="register-email">Email Address</label>
                    <input type="email" id="register-email" name="register-email" placeholder="Enter your email" required />
                  </div>
                  <div className="input-group">
                    <label htmlFor="register-password">Password</label>
                    <input type="password" id="register-password" name="register-password" placeholder="Create a password" required />
                  </div>
                  <div className="input-group">
                    <label htmlFor="register-confirm">Confirm Password</label>
                    <input type="password" id="register-confirm" name="register-confirm" placeholder="Confirm your password" required />
                  </div>
                  <div className="remember-me">
                    <input type="checkbox" id="terms" name="terms" required />
                    <label htmlFor="terms">I agree to the Terms & Conditions</label>
                  </div>
                  <button type="submit" className="form-btn">Create Account</button>
                </form>
              </Tab>
            </div>
          </div>
        </div>
      </main>
      
      <footer>
        <div className="container">
          <div className="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Contact Us</a>
            <a href="#">FAQ</a>
          </div>
          <p className="copyright">© 2025 CertiNode. Powered by Internet Computer Protocol.</p>
        </div>
      </footer>
    </div>
    </>
  );
};

// CSS styles converted to React styled component format can be imported from a separate file
// This would contain all the CSS from the original file

export default Login;