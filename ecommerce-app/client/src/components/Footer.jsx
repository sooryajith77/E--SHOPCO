  import React from 'react';
  import { FaTwitter } from "react-icons/fa";
  import { FaFacebookSquare } from "react-icons/fa";
  import { FaInstagramSquare } from "react-icons/fa";
  import { FaHeadphones } from "react-icons/fa6";
  import { FaCcVisa } from "react-icons/fa";
  import { FaCcPaypal } from "react-icons/fa";
  import { FaCcApplePay } from "react-icons/fa6";
  import { FaGooglePay } from "react-icons/fa";
  import { BiLogoMastercard } from "react-icons/bi";
  import './Footer.css'
  const Footer = () => {
    return (
      <footer className="footer">
        <div className="container">
          <div className="footer-top">
            <div className="newsletter">
              <h2>STAY UP TO DATE ABOUT OUR LATEST OFFERS</h2>
              <div className="newsletter-form">
                <input type="email" placeholder="Enter your email address" />
                <button className="btn-primary">Subscribe</button>
              </div>
            </div>
          </div>

          <div className="footer-content">
            <div className="footer-section">
              <h3>SHOP.CO</h3>
              <p>Find clothes that matches your style with our wide range of clothing, accessories, and shoes.</p>
              <div className="social-links">
                <a href="#"><FaFacebookSquare />
  </a>
                <a href="#"><FaInstagramSquare />
  </a>
                <a href="#"><FaTwitter /></a>
                <a href="#"><FaHeadphones />   
  </a>
              </div>
            </div>


            <div className="footer-section">
              <h4>SHOP</h4>
              <a href="#">Men</a>
              <a href="#">Women</a>
              <a href="#">Kids</a>
              <a href="#">Accessories</a>
            </div>

            <div className="footer-section">
              <h4>SUPPORT</h4>
              <a href="#">Contact Us</a>
              <a href="#">FAQs</a>
              <a href="#">Shipping</a>
              <a href="#">Returns</a>
            </div>

            <div className="footer-section">
              <h4>COMPANY</h4>
              <a href="#">About Us</a>
              <a href="#">Blog</a>
              <a href="#">Careers</a>
              <a href="#">Press</a>
            </div>

            <div className="footer-section">
              <h4>NEWS & UPDATES</h4>
              <a href="#">Latest News</a>
              <a href="#">Offers</a>
              <a href="#">Events</a>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© 2026 SHOP.CO. All rights reserved.</p>
            <div className="payment-methods">
              <span className='visa'><FaCcVisa />
  </span>
              <span className='applepay'><FaCcApplePay />
  </span>
              <span><FaCcPaypal />
  </span>
  <span><FaGooglePay />
  </span>
  <span><BiLogoMastercard />
  </span>
            </div>
          </div>
        </div>

      
      </footer>
    );
  };

  export default Footer;