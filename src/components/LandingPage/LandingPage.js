import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cvQuotes } from '../App/Dashboard/cvQuotes';
import demoImage from '../../assets/images/landingPhone.png';
import './LandingPage.css';

const LandingPage = () => {
  // Typing effect state
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [showCursor, setShowCursor] = useState(true);

  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Typing effect logic
  useEffect(() => {
    const currentQuote = cvQuotes[currentQuoteIndex];
    const fullText = `"${currentQuote.quote}" - ${currentQuote.author}`;

    let timeout;

    if (isTyping) {
      // Typing effect
      if (displayedText.length < fullText.length) {
        timeout = setTimeout(
          () => {
            setDisplayedText(fullText.slice(0, displayedText.length + 1));
          },
          50 + Math.random() * 50
        ); // Variable typing speed for realism
      } else {
        // Finished typing, wait before starting to delete
        timeout = setTimeout(() => {
          setIsTyping(false);
        }, 3000);
      }
    } else {
      // Deleting effect
      if (displayedText.length > 0) {
        timeout = setTimeout(
          () => {
            setDisplayedText(displayedText.slice(0, -1));
          },
          30 + Math.random() * 30
        ); // Faster deletion
      } else {
        // Finished deleting, move to next quote
        setCurrentQuoteIndex(prevIndex => (prevIndex + 1) % cvQuotes.length);
        setIsTyping(true);
      }
    }

    return () => clearTimeout(timeout);
  }, [displayedText, isTyping, currentQuoteIndex]);

  // Cursor blinking effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 500);

    return () => clearInterval(cursorInterval);
  }, []);

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

          {/* Mobile Menu Button */}
          <button
            className="landing-mobile-menu-button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <span
              className={`landing-hamburger ${isMobileMenuOpen ? 'active' : ''}`}
            >
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>

          {/* Mobile Menu */}
          <div
            className={`landing-mobile-menu ${isMobileMenuOpen ? 'active' : ''}`}
          >
            <Link
              to="/login"
              className="landing-mobile-nav-link"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="landing-mobile-nav-button"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      <main className="landing-main">
        <section className="landing-hero">
          <div className="landing-container">
            <div className="landing-hero-content">
              {/* Typing Quote Effect */}
              <div className="landing-quote-container">
                <div className="landing-quote-text">
                  {displayedText}
                  <span
                    className={`landing-cursor ${showCursor ? 'visible' : ''}`}
                  >
                    |
                  </span>
                </div>
              </div>
              <h1 className="landing-hero-title">
                First impressions count
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
              {/* Store badges: Apple, Google Play, AppGallery (images from Wikimedia Commons) */}
              <div className="landing-store-badges">
                <p className="landing-store-badges-label">Also on mobile</p>
                <div className="landing-store-badges-list">
                  <a
                    href="https://apps.apple.com/us/app/cv-cloud/id1600222322"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="landing-store-badge"
                    aria-label="Download on the App Store"
                  >
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg"
                      alt="Download on the App Store"
                      className="landing-store-badge-img"
                    />
                  </a>
                  <a
                    href="https://play.google.com/store/apps/details?id=com.cvcloud.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="landing-store-badge"
                    aria-label="Get it on Google Play"
                  >
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                      alt="Get it on Google Play"
                      className="landing-store-badge-img"
                    />
                  </a>
                  <a
                    href="https://appgallery.huawei.com/#/app/C105286461"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="landing-store-badge"
                    aria-label="Explore it on AppGallery"
                  >
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/e/e7/Huawei_AppGallery_white_badge_EN.png"
                      alt="Explore it on AppGallery"
                      className="landing-store-badge-img"
                    />
                  </a>
                </div>
              </div>
            </div>
            <div className="landing-hero-image">
              <div className="landing-mockup">
                <div className="landing-mockup-screen">
                  <img
                    src={demoImage}
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
