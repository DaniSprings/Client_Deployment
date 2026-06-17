import { useState } from "react";
import "./Card.css";



function Card(){
    const [selected, setSelected] = useState(null);

    const handleSelect = (idx) => setSelected(idx);

    return(
        <div className="team-container">
            {[{
                img: "https://i.ibb.co/bdLVsW9/Daniel-Profile-Edited.jpg",
                name: "Daniel",
                title: "Founder",
                paragraph: `Started the company off an just and ran with it.
                    Creating something that will help many understand
                    the basic knowledge of cars an allowing the consumer to
                    feel happy with their purchase.`
            }, {
                img: "https://i.ibb.co/BfV1hGk/Enrico-Profile-Edited.jpg",
                name: "Enrico",
                title: "CTO",
                paragraph: `Software and understanding code has always been my passion.
                   Trying to create a streamline UI that bridges the gap between what you see and do not.`
            }, {
                img: "https://i.ibb.co/h2Mgk5f/Doyak-Profile-Edited.jpg",
                name: "Doyak",
                title: "Photographer",
                paragraph: "Hello, I am the founder and creator of RevReview"
            }, {
                img: "https://i.ibb.co/LrD1TcM/Natalie-Profile-Edited.jpg",
                name: "Natalie",
                title: "Marketing",
                paragraph: `Started the company off an just and ran with it.
                            Creating something that will help many understand
                            the basic knowledge of cars an allowing the consumer to
                            feel happy with their purchase.`
            }].map((member, idx) => (
                <div
                    key={idx}
                    className={`card${selected === idx ? " selected" : ""}`}
                    onClick={() => handleSelect(idx)}
                    tabIndex={0}
                >
                    <img src={member.img} alt="my picture" />
                    <h2 className="card-name">{member.name}</h2>
                    <h3 className="card-title">{member.title}</h3>
                    <p className="card-paragraph">{member.paragraph}</p>
                </div>
            ))}
        </div>

    );
}

export default Card