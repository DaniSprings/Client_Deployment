import "./AboutBanner.css";

function AboutBanner() {
    return (
        <section className="About_Container">
            <div className='Banner'>

                {/* ── About section ── */}
                {/* Image block: visible on mobile/tablet, hidden on desktop */}
                <div className="about-banner-image" aria-hidden="true" />

                {/* Text block */}
                <div className="about-banner">
                <h1>About Us...</h1>
                <p styles={{fontWeight:'bold'}}>
                    Access A Comprehensive Database of car specifications. Making it easier to choose your dream car.
                </p>
            </div>

            {/* ── Our Story section ── */}
            <div className="story-banner-image" aria-hidden="true" />

                <div className='story-banner'>
                    <h1>Our Story...</h1>
                        <p>
                        RevReview was created in 2023 by a group of car enthusiasts who wanted to share
                        their passion for automobiles with the world. Our mission is to provide accurate
                        and reliable information about cars to help people make informed decisions when
                        buying a vehicle. We believe that everyone should have access to the knowledge
                        and resources they need to find the perfect car for their needs and budget.
                        </p>
            </div>

            </div>
        </section>
    );
}

export default AboutBanner;
