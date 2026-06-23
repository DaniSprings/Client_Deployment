
function Footer() {
    const getFullYear = () => new Date().getFullYear();
    return (
        <footer>
            <div>
                <h1 style={{ color: '#666' }}>RevReview</h1>
            </div>
                <p>&copy;{getFullYear()} Copyright. All rights reserved.</p>
        </footer>
    );
}

export default Footer;