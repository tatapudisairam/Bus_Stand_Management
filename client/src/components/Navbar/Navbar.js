import React from 'react';

const Navbar = () => {
    return (
        <div className='navbar-container'>
            <header>
                <nav>
                    <div className="left-navbar">
                        <div className="logo">Logo</div>
                        <ul className="navbar-options">
                            <li><a href='/employee-login'>Employee Portal</a></li>
                            <li><a href='http://localhost:3001/' target='_blank' rel='noopener noreferrer'>Admin Panel</a></li>
                        </ul>
                    </div>
                    <div className="right-navbar">
                        <a href="/employee-login" className="loginlogout">
                            <i className="fa-solid fa-right-to-bracket"></i> Login
                        </a>
                        <a href="/help-center">? Help</a>
                    </div>
                </nav>
            </header>
        </div>
    )
}

export default Navbar;