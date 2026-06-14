import React from 'react';
import './Legal.css';

const Privacy = () => {
  return (
    <div className="legal-page">
      <section className="legal-hero">
        <div className="container">
          <h1>Privacy Policy</h1>
          <p className="last-updated">Last Updated: October 23, 2025</p>
        </div>
      </section>

      <section className="legal-content">
        <div className="container">
          <div className="legal-text">
            <h2>1. Introduction</h2>
            <p>
              Welcome to syncplay eSports ("we," "our," or "us"). We are committed to protecting your personal 
              information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, 
              and safeguard your information when you visit our website and register for our tournaments.
            </p>

            <h2>2. Information We Collect</h2>
            <h3>2.1 Personal Information</h3>
            <p>When you register for a tournament, we collect:</p>
            <ul>
              <li>Team name</li>
              <li>Full names of team members</li>
              <li>Email addresses</li>
              <li>Phone numbers</li>
              <li>Gamer tags/PSN IDs</li>
              <li>Gaming platform (PlayStation)</li>
              <li>Payment information (processed securely through Paystack)</li>
            </ul>

            <h3>2.2 Automatically Collected Information</h3>
            <p>When you visit our website, we automatically collect:</p>
            <ul>
              <li>IP address</li>
              <li>Browser type and version</li>
              <li>Device information</li>
              <li>Pages visited and time spent</li>
              <li>Referral source</li>
            </ul>

            <h2>3. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul>
              <li>Process tournament registrations</li>
              <li>Facilitate payment transactions</li>
              <li>Communicate tournament details and updates</li>
              <li>Verify player identities and eligibility</li>
              <li>Send promotional emails about future events (with your consent)</li>
              <li>Improve our website and services</li>
              <li>Comply with legal obligations</li>
              <li>Prevent fraud and enhance security</li>
            </ul>

            <h2>4. Payment Information</h2>
            <p>
              All payment transactions are processed through Paystack, a secure third-party payment processor. 
              We do not store your credit card information on our servers. Payment data is encrypted and handled 
              in accordance with PCI-DSS requirements.
            </p>

            <h2>5. Information Sharing and Disclosure</h2>
            <h3>5.1 We Share Information With:</h3>
            <ul>
              <li><strong>Service Providers:</strong> Paystack for payment processing</li>
              <li><strong>Tournament Partners:</strong> Game publishers and sponsors (with your consent)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
            </ul>

            <h3>5.2 We Do NOT:</h3>
            <ul>
              <li>Sell your personal information to third parties</li>
              <li>Share your information for marketing purposes without your consent</li>
            </ul>

            <h2>6. Data Security</h2>
            <p>
              We implement appropriate technical and organizational security measures to protect your personal 
              information against unauthorized access, alteration, disclosure, or destruction. However, no method 
              of transmission over the internet is 100% secure.
            </p>

            <h2>7. Your Rights</h2>
            <p>Under Nigerian Data Protection Regulation (NDPR), you have the right to:</p>
            <ul>
              <li>Access your personal data</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to processing of your data</li>
              <li>Withdraw consent at any time</li>
              <li>Data portability</li>
            </ul>

            <h2>8. Cookies and Tracking</h2>
            <p>
              We use cookies and similar tracking technologies to enhance your browsing experience. You can 
              control cookies through your browser settings. Essential cookies are necessary for the website 
              to function properly.
            </p>

            <h2>9. Children's Privacy</h2>
            <p>
              Our services are not intended for individuals under 18 years of age. We do not knowingly collect 
              personal information from children. If you are under 18, please do not register or provide any 
              information on our website.
            </p>

            <h2>10. Data Retention</h2>
            <p>
              We retain your personal information for as long as necessary to fulfill the purposes outlined in 
              this Privacy Policy, unless a longer retention period is required by law. Tournament data is 
              retained for record-keeping and statistical purposes.
            </p>

            <h2>11. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than Nigeria. We ensure 
              appropriate safeguards are in place to protect your data in accordance with this Privacy Policy.
            </p>

            <h2>12. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any significant changes 
              by posting the new policy on this page and updating the "Last Updated" date.
            </p>

            <h2>13. Contact Us</h2>
            <p>
              If you have questions or concerns about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="contact-box">
              <p><strong>Email:</strong> info@syncplay.co</p>
              <p><strong>Address:</strong> Nigeria - Online Platform</p>
            </div>

            <div className="legal-footer">
              <p>
                By using syncplay eSports, you acknowledge that you have read and understood this Privacy Policy 
                and agree to its terms.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Privacy;

