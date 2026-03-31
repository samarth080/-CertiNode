import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import './Login.css';
const Login = () => {
    const [activeTab, setActiveTab] = useState('login');
    // Handle tab switching
    const openTab = (tabName) => {
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
        }
        catch (error) {
            console.error("Error connecting to ICP wallet:", error);
            alert("Error connecting to ICP wallet");
        }
    };
    // Handle Google Sign-in response
    const handleGoogleCredentialResponse = (response) => {
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
            }
            else {
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
    const handleLoginSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const email = formData.get('login-email');
        const password = formData.get('login-password');
        console.log("Login attempt with:", email);
        alert("Login attempt with: " + email);
        // Add your email/password authentication logic here
        // Example fetch request would go here
    };
    // Handle registration form submission
    const handleRegisterSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get('register-name');
        const email = formData.get('register-email');
        const password = formData.get('register-password');
        const confirmPassword = formData.get('register-confirm');
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
    const Tab = ({ id, active, children }) => (_jsx("div", { id: id, className: `tab-content ${active ? 'active' : ''}`, children: children }));
    return (_jsx(_Fragment, { children: _jsxs("div", { className: "container", children: [_jsxs("nav", { children: [_jsxs("a", { href: "./home", className: "logo", children: [_jsxs("svg", { width: "28", height: "28", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [_jsx("path", { d: "M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z", stroke: "#b62fb0", strokeWidth: "3" }), _jsx("path", { d: "M12 14.5C13.3807 14.5 14.5 13.3807 14.5 12C14.5 10.6193 13.3807 9.5 12 9.5C10.6193 9.5 9.5 10.6193 9.5 12C9.5 13.3807 10.6193 14.5 12 14.5Z", fill: "#b62fb0" }), _jsx("path", { d: "M12 8V2", stroke: "#b62fe0", strokeWidth: "3", strokeLinecap: "round" }), _jsx("path", { d: "M16 12H22", stroke: "#b62fe0", strokeWidth: "3", strokeLinecap: "round" })] }), "Certi", _jsx("span", { children: "Node" })] }), _jsxs("div", { className: "nav-links", children: [_jsx("a", { href: "#", children: "Features" }), _jsx("a", { href: "#", children: "How It Works" }), _jsx("a", { href: "#", children: "For Institutions" }), _jsx("a", { href: "#", children: "About" })] }), _jsx("a", { href: "./", className: "btn btn-secondary", children: "Back to Home" })] }), _jsxs("main", { className: "main-content", children: [_jsx("div", { className: "blob blob1" }), _jsx("div", { className: "blob blob2" }), _jsxs("div", { className: "container", children: [_jsxs("div", { className: "section-header", children: [_jsx("h2", { children: "Welcome to CertiNode" }), _jsx("p", { children: "Access your secure document vault" })] }), _jsxs("div", { className: "login-container", children: [_jsxs("div", { className: "login-image", children: [_jsx("h2", { children: "Secure Your Academic Future" }), _jsx("p", { children: "Transform your paper credentials into tamper-proof digital assets that can be instantly verified anywhere in the world." }), _jsxs("div", { className: "info-box", children: [_jsx("h4", { children: "Why use CertiNode?" }), _jsx("p", { children: "With CertiNode, your academic achievements become verifiable, transferable, and immutable digital assets that you truly own." })] }), _jsxs("div", { className: "info-box", children: [_jsx("h4", { children: "New to ICP?" }), _jsx("p", { children: "The Internet Computer Protocol is a next-generation blockchain that enables secure, decentralized applications and services." })] })] }), _jsxs("div", { className: "login-content", children: [_jsxs("div", { className: "tab-header", children: [_jsx("button", { className: `tab-btn ${activeTab === 'login' ? 'active' : ''}`, onClick: () => openTab('login'), children: "Login" }), _jsx("button", { className: `tab-btn ${activeTab === 'register' ? 'active' : ''}`, onClick: () => openTab('register'), children: "Register" })] }), _jsxs(Tab, { id: "login", active: activeTab === 'login', children: [_jsxs("button", { className: "wallet-btn", onClick: connectICPWallet, children: [_jsxs("svg", { className: "icp-logo", viewBox: "0 0 32 32", xmlns: "http://www.w3.org/2000/svg", children: [_jsx("circle", { cx: "16", cy: "16", r: "15", fill: "#29ABE2", fillOpacity: "0.2", stroke: "#29ABE2", strokeWidth: "2" }), _jsx("path", { d: "M16 8V24", stroke: "#FFFFFF", strokeWidth: "2", strokeLinecap: "round" }), _jsx("path", { d: "M24 16H8", stroke: "#FFFFFF", strokeWidth: "2", strokeLinecap: "round" })] }), "Connect with ICP Wallet", _jsx("img", { width: "80px", height: "80px", src: "/home/prady/hoswap2/internet-computer-icp-logo.png" })] }), _jsx("div", { className: "or-divider", children: _jsx("span", { children: "OR" }) }), _jsxs("form", { id: "login-form", onSubmit: handleLoginSubmit, children: [_jsxs("div", { className: "input-group", children: [_jsx("label", { htmlFor: "login-email", children: "Email Address" }), _jsx("input", { type: "email", id: "login-email", name: "login-email", placeholder: "Enter your email", required: true })] }), _jsxs("div", { className: "input-group", children: [_jsx("label", { htmlFor: "login-password", children: "Password" }), _jsx("input", { type: "password", id: "login-password", name: "login-password", placeholder: "Enter your password", required: true })] }), _jsxs("button", { className: "google-btn", type: "button", id: "login-google-btn", onClick: () => window.google?.accounts?.id?.prompt(), children: [_jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", children: [_jsx("path", { fill: "#4285F4", d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" }), _jsx("path", { fill: "#34A853", d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" }), _jsx("path", { fill: "#FBBC05", d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" }), _jsx("path", { fill: "#EA4335", d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" })] }), "Sign in with Google"] }), _jsx("div", { className: "forgot-password", children: _jsx("a", { href: "#", children: "Forgot password?" }) }), _jsxs("div", { className: "remember-me", children: [_jsx("input", { type: "checkbox", id: "remember", name: "remember" }), _jsx("label", { htmlFor: "remember", children: "Remember me" })] }), _jsx("button", { type: "submit", className: "form-btn", children: "Login" })] })] }), _jsxs(Tab, { id: "register", active: activeTab === 'register', children: [_jsxs("button", { className: "wallet-btn", onClick: connectICPWallet, children: [_jsxs("svg", { className: "icp-logo", viewBox: "0 0 32 32", xmlns: "http://www.w3.org/2000/svg", children: [_jsx("circle", { cx: "16", cy: "16", r: "15", fill: "#29ABE2", fillOpacity: "0.2", stroke: "#29ABE2", strokeWidth: "2" }), _jsx("path", { d: "M16 8V24", stroke: "#FFFFFF", strokeWidth: "2", strokeLinecap: "round" }), _jsx("path", { d: "M24 16H8", stroke: "#FFFFFF", strokeWidth: "2", strokeLinecap: "round" })] }), "Register with ICP Wallet", _jsx("img", { width: "80px", height: "80px", src: "/home/prady/hoswap2/src/hoswap2_frontend/assets/icp.png", alt: "icp-logo" })] }), _jsxs("button", { className: "google-btn", type: "button", id: "register-google-btn", onClick: () => window.google?.accounts?.id?.prompt(), children: [_jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", width: "24", height: "24", viewBox: "0 0 24 24", children: [_jsx("path", { fill: "#4285F4", d: "M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" }), _jsx("path", { fill: "#34A853", d: "M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" }), _jsx("path", { fill: "#FBBC05", d: "M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" }), _jsx("path", { fill: "#EA4335", d: "M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" })] }), "Sign up with Google"] }), _jsx("div", { className: "or-divider", children: _jsx("span", { children: "OR" }) }), _jsxs("form", { id: "register-form", onSubmit: handleRegisterSubmit, children: [_jsxs("div", { className: "input-group", children: [_jsx("label", { htmlFor: "register-name", children: "Full Name" }), _jsx("input", { type: "text", id: "register-name", name: "register-name", placeholder: "Enter your full name", required: true })] }), _jsxs("div", { className: "input-group", children: [_jsx("label", { htmlFor: "register-email", children: "Email Address" }), _jsx("input", { type: "email", id: "register-email", name: "register-email", placeholder: "Enter your email", required: true })] }), _jsxs("div", { className: "input-group", children: [_jsx("label", { htmlFor: "register-password", children: "Password" }), _jsx("input", { type: "password", id: "register-password", name: "register-password", placeholder: "Create a password", required: true })] }), _jsxs("div", { className: "input-group", children: [_jsx("label", { htmlFor: "register-confirm", children: "Confirm Password" }), _jsx("input", { type: "password", id: "register-confirm", name: "register-confirm", placeholder: "Confirm your password", required: true })] }), _jsxs("div", { className: "remember-me", children: [_jsx("input", { type: "checkbox", id: "terms", name: "terms", required: true }), _jsx("label", { htmlFor: "terms", children: "I agree to the Terms & Conditions" })] }), _jsx("button", { type: "submit", className: "form-btn", children: "Create Account" })] })] })] })] })] })] }), _jsx("footer", { children: _jsxs("div", { className: "container", children: [_jsxs("div", { className: "footer-links", children: [_jsx("a", { href: "#", children: "Privacy Policy" }), _jsx("a", { href: "#", children: "Terms of Service" }), _jsx("a", { href: "#", children: "Contact Us" }), _jsx("a", { href: "#", children: "FAQ" })] }), _jsx("p", { className: "copyright", children: "\u00A9 2025 CertiNode. Powered by Internet Computer Protocol." })] }) })] }) }));
};
// CSS styles converted to React styled component format can be imported from a separate file
// This would contain all the CSS from the original file
export default Login;
