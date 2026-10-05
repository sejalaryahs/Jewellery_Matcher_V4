import { Link, useLocation } from "react-router-dom";

function Header() {
  const location = useLocation();

  return (
    <header className="site-header">
      <Link to="/" className="brand">
        <span className="brand-mark">✦</span>

        <span className="brand-text">
          <strong>JewelMatch</strong>

          <small>AI</small>
        </span>
      </Link>

      <nav className="header-navigation">
        <Link
          to="/catalogue"
          className={`nav-button secondary ${
            location.pathname === "/catalogue" || location.pathname === "/"
              ? "active"
              : ""
          }`}
        >
          Catalogue
        </Link>

        <Link
          to="/management"
          className={`nav-button primary ${
            location.pathname === "/management" ? "active" : ""
          }`}
        >
          Management
        </Link>
      </nav>
    </header>
  );
}

export default Header;
