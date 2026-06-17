import { useState, useRef, useEffect } from 'react';
import './MirrorImages.css';


// interface SlideProps {
// 	img: string;
// 	name: string;
// 	text: React.ReactNode;},

const slides = [
	{
		img: "https://i.ibb.co/CJGm5c3/Car-Assistance-1.png",
		name: "Car Assistance",
		text: <>Get help on everything you <br />need to know about your car!</>
	},
	{
		img: "https://i.ibb.co/8DzhykB/Easy-Access-1.png",
		name: "Easy Access",
		text: <>Use our services from anywhere, anytime!</>
	},
	{
		img: "https://i.ibb.co/qC8QyNT/Secure-1.png",
		name: "Secure",
		text: <>Secure use of our site with accurate Data from Dealers</>
	},
	{
		img: "https://i.ibb.co/GdRFbg7/Lightning-1.png",
		name: "Lightning",
		text: <>Fast responsive speed for any info you seek on your car.</>
	},
	{
		img: "https://i.ibb.co/2dqJ75x/User-Friendly-1.png",
		name: "User Friendly",
		text: <>Easily to use. <br />Best to rely on.</>
	},
	{
		img: "https://i.ibb.co/k82vf0f/Easy-Pay-1.png",
		name: "Easy Pay",
		text: <>Quick and easy payments through our site.<br />Saving you money and time.</>
	},
	{
		img: "https://i.ibb.co/WfH7m1c/Journey-1.png",
		name: "Journey",
		text: <>Travel further knowing more about your car.</>
	},
	{
		img: "https://i.ibb.co/LdG26Mp/Experience-More-1.png",
		name: "Experience More",
		text: <>Never limit your knowledge about your car.<br />Use Us to understand more...</>
	}
];

function MirrorImages() {
	const [current, setCurrent] = useState(0);
	const n = slides.length;

	// manage hover visibility
	const [visible, setVisible] = useState(null); // index of slide whose text is visible
	const hoverTimeouts = useRef({}); // map slideIndex -> timeoutId

	const clearAllHoverTimeouts = () => {
		Object.values(hoverTimeouts.current).forEach((id) => clearTimeout(id));
		hoverTimeouts.current = {};
	};

	const prevSlide = () => {
		clearAllHoverTimeouts();
		setVisible(null);
		setCurrent((c) => (c + 3) % n);
	};

	const nextSlide = () => {
		clearAllHoverTimeouts();
		setVisible(null);
		setCurrent((c) => (c - 3 + n) % n);
	};

	const goToSlide = (idx) => {
		clearAllHoverTimeouts();
		setVisible(null);
		setCurrent(idx);
	};

	const idx = (i) => (i + n) % n;
	const leftIndex = idx(current - 1);
	const rightIndex = idx(current + 1);

	const handleMouseEnter = (sIdx) => {
		if (hoverTimeouts.current[sIdx]) {
			clearTimeout(hoverTimeouts.current[sIdx]);
		}
		// changed from 2000ms -> 1000ms (1 second)
		hoverTimeouts.current[sIdx] = setTimeout(() => {
			setVisible(sIdx);
			delete hoverTimeouts.current[sIdx];
		}, 1000);
	};

	const handleMouseLeave = (sIdx) => {
		if (hoverTimeouts.current[sIdx]) {
			clearTimeout(hoverTimeouts.current[sIdx]);
			delete hoverTimeouts.current[sIdx];
		}
		if (visible === sIdx) setVisible(null);
	};

	useEffect(() => {
		return () => {
			clearAllHoverTimeouts();
		};
	}, []);

	return (
		<div className="Mirror-Images">
			<h3>Why Use Rev-Review?</h3>
			<p>Most companies offer the exact same information for consumers, here are a few reasons why we are better...</p>

			<section className="container2">
				<div className="slider-wrapper">
					{/* Three visible slides */}
					<div className="slider-track">
						{[leftIndex, current, rightIndex].map((sIdx) => (
							<div
								key={sIdx}
								className="slide"
								onMouseEnter={() => handleMouseEnter(sIdx)}
								onMouseLeave={() => handleMouseLeave(sIdx)}
							>
								{/* image wrapper so overlay height % is based on the image container */}
								<div className="Wrapper1 mirror-image-frame">
									<img
										src={slides[sIdx].img}
										className={`Images ${visible === sIdx ? 'is-blurred' : ''}`}
										alt={slides[sIdx].name}
									/>

									{/* overlay covers bottom 30% of the image */}
									<div className={`Wrapper2 ${visible === sIdx ? 'is-visible' : ''}`}
									// initial={{ opacity: 0 }}
									// animate={{ opacity: visible === sIdx ? 1 : 0 }}
									// transition={{ duration: 0.3 }}
									>
										{/* h4 and descriptive text always rendered but fade in/out */}
										<h4
											className={`slide-title ${visible === sIdx ? 'is-visible' : ''}`}
											aria-hidden={visible !== sIdx}
										>
											{/* {slides[sIdx].name}
											initial={{ opacity: 0 }}
											animate={{ opacity: visible === sIdx ? 1 : 0 }}
											transition={{ duration: 0.3 }} */}

											{slides[sIdx].name}
										</h4>

										<div className={`Wrapper3 slide-text ${visible === sIdx ? 'is-visible' : ''}`}
											aria-hidden={visible !== sIdx}
										>
											{slides[sIdx].text}
										</div>
									</div>
								</div>

								{/* remove the separate h4/text under image - overlay now contains them */}
							</div>
						))}
					</div>

					{/* Left / Right arrows */}
					<button
						onClick={prevSlide}
						className="slider-arrow slider-arrow-left"
						aria-label="Previous Slide"
					>&lt;</button>

					<button
						onClick={nextSlide}
						className="slider-arrow slider-arrow-right"
						aria-label="Next Slide"
					>&gt;</button>

					{/* Dots (no numbers inside) */}
					<div className="slider-nav">
						{slides.map((_, i) => (
							<button
								key={i}
								onClick={() => goToSlide(i)}
								className={`slider-dot ${i === current ? 'is-active' : ''}`}
								aria-label={`Go to slide ${i + 1}`}
							>
								{/* intentionally empty: dot only */}
							</button>
						))}
					</div>
				</div>
			</section>
		</div>
	);
}

export default MirrorImages;
