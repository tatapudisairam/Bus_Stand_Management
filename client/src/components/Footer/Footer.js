import React from 'react'
import '../../pages/Homepage/Homepage.css'

const Footer = () => {
    return (
        <div>
            <footer>
                <div className="top-footer">
                    <p className="top-footer-title">Logo</p>
                    <div className="search-container">
                        <div className="search-box">
                            <div className="input-container">
                                <input type="text" className="search-input" placeholder="Enter your email" />
                                <input type="button" value="Search" className="search-button" />
                            </div>
                        </div>
                    </div>
                </div>
                <div className="middle-footer">
                    <div className="footer-content">
                        <p className="footer-title">Product</p>
                        <ul>
                            <li>Features</li>
                            <li>Pricing</li>
                        </ul>
                    </div>
                    <div className="footer-content">
                        <p className="footer-title">Resources</p>
                        <ul>
                            <li>Blog</li>
                            <li>User guides</li>
                            <li>Webinars</li>
                        </ul>
                    </div>
                    <div className="footer-content">
                        <p className="footer-title">Company</p>
                        <ul>
                            <li>About us</li>
                            <li>Contact us</li>
                        </ul>
                    </div>
                </div>
                <div className="footer-hr">
                    <hr className="hr-line" />
                </div>
                <div className="bottom-footer">
                    <p>Thank You</p>
                </div>
            </footer>
        </div>
    )
}

export default Footer
