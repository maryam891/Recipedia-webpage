import { Link } from 'react-router-dom'
import { GiHamburgerMenu } from "react-icons/gi";
import "../css/Navbar.css"
import { IoClose } from 'react-icons/io5';
import { useState } from 'react';
import { AuthContext } from '../AuthContext';
import { useContext } from 'react';


export default function NavBar() {
    const Auth = useContext(AuthContext)
    const [menuOpen, setMenuOpen] = useState(false);
    return (
        <>
            <nav className='Navbar'>
                <div className='nav-container'>
                    <h1>Recipedia</h1>

                    {/* Desktop links */}
                    {Auth?.isLoggedIn ?
                        <ul className="menu desktopMenu">
                            <li><Link to="/" className="nav-link">Home</Link></li>
                            <li><Link to="/Recipes" className="nav-link">Recipes</Link></li>
                            <li><Link to="/FavoriteRecipes" className="nav-link">Favorite Recipes</Link></li>
                            <li><Link to="/Profile" className="nav-link">Profile</Link></li>
                        </ul> : <ul className="menu desktopMenu">
                            <li><Link to="/" className="nav-link">Home</Link></li>
                            <li><Link to="/Recipes" className="nav-link">Recipes</Link></li>
                            <li><Link to="/Login" className="nav-link">Login</Link></li>
                        </ul>}

                    {/* Hamburger icon */}
                    <button
                        className='hamburger-menu'
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Toggle menu"
                    >
                        {menuOpen ? <IoClose size={26} /> : <GiHamburgerMenu size={26} />}
                    </button>
                </div>

                {/* Mobile dropdown */}
                <div className={`mobile-menu ${menuOpen ? 'open' : ''}`}>
                    {Auth?.isLoggedIn ?
                        <ul className="menu MobileLinks">
                            <li><Link to="/" className='nav-link' onClick={() => setMenuOpen(false)}>Home</Link></li>
                            <li><Link to="/Recipes" className='nav-link' onClick={() => setMenuOpen(false)}>Recipes</Link></li>
                            <li><Link to="/FavoriteRecipes" className='nav-link' onClick={() => setMenuOpen(false)}>Favorite Recipes</Link></li>
                            <li><Link to="/Profile" className='nav-link' onClick={() => setMenuOpen(false)}>Profile</Link></li>
                        </ul> : <ul className="menu MobileLinks">
                            <li><Link to="/" className='nav-link' onClick={() => setMenuOpen(false)}>Home</Link></li>
                            <li><Link to="/Recipes" className='nav-link' onClick={() => setMenuOpen(false)}>Recipes</Link></li>
                            <li><Link to="/Login" className='nav-link' onClick={() => setMenuOpen(false)}>Login</Link></li>
                        </ul>}
                </div>
            </nav>
        </>
    )

}
