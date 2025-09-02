import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <header className="landing-header">
        <div className="landing-container">
          <div className="landing-logo">
            <img
              src="/logo-h79.png"
              alt="CV Cloud Logo"
              className="landing-logo-image"
            />
          </div>
          <nav className="landing-nav">
            <Link to="/login" className="landing-nav-link">
              Login
            </Link>
            <Link to="/signup" className="landing-nav-button">
              Sign Up
            </Link>
          </nav>
        </div>
      </header>

      <main className="landing-main">
        <section className="landing-hero">
          <div className="landing-container">
            <div className="landing-hero-content">
              <h1 className="landing-hero-title">
                Create Professional CVs with Ease
              </h1>
              <p className="landing-hero-subtitle">
                Build stunning resumes and CVs that stand out. Our intuitive
                platform helps you create professional documents that get you
                noticed by employers.
              </p>
              <div className="landing-hero-buttons">
                <Link to="/signup" className="landing-cta-button">
                  Get Started Free
                </Link>
                <Link to="/login" className="landing-secondary-button">
                  Sign In
                </Link>
              </div>
            </div>
            <div className="landing-hero-image">
              <div className="landing-mockup">
                <div className="landing-mockup-screen">
                  <img
                    src="/demo-001.png"
                    alt="CV Cloud App Demo"
                    className="landing-mockup-image"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-features">
          <div className="landing-container">
            <h2 className="landing-features-title">Why Choose CV Cloud?</h2>
            <div className="landing-features-grid">
              <div className="landing-feature">
                <div className="landing-feature-icon">📝</div>
                <h3>Easy to Use</h3>
                <p>
                  Intuitive interface that makes CV creation simple and
                  enjoyable.
                </p>
              </div>
              <div className="landing-feature">
                <div className="landing-feature-icon">🎨</div>
                <h3>Professional Templates</h3>
                <p>
                  Beautiful, industry-standard templates that impress employers.
                </p>
              </div>
              <div className="landing-feature">
                <div className="landing-feature-icon">📱</div>
                <h3>Cross-Platform</h3>
                <p>
                  Create and edit your CV on web and mobile devices seamlessly.
                </p>
              </div>
              <div className="landing-feature">
                <div className="landing-feature-icon">🔒</div>
                <h3>Secure & Private</h3>
                <p>Your data is protected with enterprise-grade security.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-cta">
          <div className="landing-container">
            <h2>Ready to Create Your Professional CV?</h2>
            <p>
              Join thousands of professionals who trust CV Cloud for their
              career success.
            </p>
            <Link to="/signup" className="landing-cta-button large">
              Start Building Your CV
            </Link>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="landing-container">
          <p>&copy; 2024 CV Cloud. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
