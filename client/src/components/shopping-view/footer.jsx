import React from 'react';
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube, FaLinkedin, FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer style={styles.footer}>
      
      <div style={styles.container}>
        
        <div style={styles.column}>
          <h4 style={styles.heading}>About Us</h4>
          <p style={styles.text}>
            SwiftTech Commerce Private Limited is a leading platform for electronics and gadgets. 
            Explore a wide range of high-quality products designed to make life easier and more connected.
          </p>
        </div>

       
        <div style={styles.column}>
          <h4 style={styles.heading}>Customer Support</h4>
          <p style={styles.text}>
            We are here to help you 24/7. Reach out to us anytime for assistance with your orders, shipping, or other inquiries.
          </p>
          <p style={styles.contact}>
            <FaPhoneAlt style={styles.iconSmall} /> +1-800-123-4567
          </p>
          <p style={styles.contact}>
            <FaEnvelope style={styles.iconSmall} /> support@swifttech.com
          </p>
          <p style={styles.contact}>
            <FaMapMarkerAlt style={styles.iconSmall} /> Chitwan, Mugling
          </p>
        </div>

      
        <div style={styles.column}>
          <h4 style={styles.heading}>Stay Connected</h4>
          <div style={styles.socialIcons}>
            <FaFacebookF style={styles.icon} />
            <FaInstagram style={styles.icon} />
            <FaTwitter style={styles.icon} />
            <FaYoutube style={styles.icon} />
            <FaLinkedin style={styles.icon} />
          </div>
          <p style={styles.text}>Follow us for updates, exclusive deals, and tech news.</p>
        </div>
      </div>

      
      <div style={styles.bottomBar}>
        <p style={styles.bottomText}>&copy; {new Date().getFullYear()} SwiftTech Commerce Private Limited. All rights reserved.</p>
        <p style={styles.bottomText}>Made with ❤️ by SwiftTech Tech Team.</p>
      </div>
    </footer>
  );
};

const styles = {
  footer: {
    backgroundColor: '#000',
    color: '#fff',
    padding: '30px 20px',
    marginTop: '20px',
    fontFamily: 'Arial, sans-serif',
  },
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '20px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  column: {
    flex: '1',
    minWidth: '250px',
    maxWidth: '350px',
    padding: '0 10px',
  },
  heading: {
    fontSize: '18px',
    marginBottom: '10px',
    fontWeight: 'bold',
  },
  text: {
    fontSize: '14px',
    lineHeight: '1.5',
    color: '#ccc',
  },
  contact: {
    fontSize: '14px',
    lineHeight: '1.5',
    color: '#fff',
    marginTop: '5px',
  },
  socialIcons: {
    display: 'flex',
    gap: '10px',
    marginTop: '10px',
  },
  icon: {
    fontSize: '18px',
    color: '#fff',
    cursor: 'pointer',
    transition: 'color 0.3s ease',
  },
  iconSmall: {
    fontSize: '16px',
    marginRight: '8px',
  },
  bottomBar: {
    borderTop: '1px solid #444',
    paddingTop: '10px',
    textAlign: 'center',
  },
  bottomText: {
    fontSize: '12px',
    color: '#aaa',
    margin: '5px 0',
  },
};

export default Footer;