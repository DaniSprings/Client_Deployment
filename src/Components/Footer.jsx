import { Link } from "react-router-dom";
import PrivacyPolicy from "../Pages/PrivacyPolicy";



function Footer() {
    const getFullYear = () => new Date().getFullYear();
    return (
        <footer className="Footer">
            <div>
                <h1 style={{ color: '#666' }}>RevReview</h1>
            </div>
                <p>&copy;{getFullYear()} Copyright. All rights reserved.</p>
            <nav>
                <Link to="/PrivacyPolicy">Privacy Policy</Link>
            </nav>
        </footer>
    );
}

export default Footer;