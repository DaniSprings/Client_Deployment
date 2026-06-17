import { useState } from "react";
import "./Form.css";

function Form() {

    const [values, setValues] = useState({
        Firstname: '',
        Surname: '',
        Contact: '',
        email: ''
    })

    const handleChanges = (e) => {
        setValues({ ...values, [e.target.name]: e.target.value })
    }


    const handleSubmit = (e) => {
        e.preventDefault()
        console.log(values)
    }

    return (
        <div>
            <h1>Contact Us</h1>
            <div className="footer-container">
                <form className="footer-form" onSubmit={handleSubmit}>
                    <label id="Firstname">Name:
                        <input type="text" placeholder="Name"
                            onChange={(e) => handleChanges(e)} required />
                    </label>

                    <label id="Surname">Surname:
                        <input type="text" placeholder="Surname"
                            onChange={(e) => handleChanges(e)} required />
                    </label>

                    <label id="Contact">Cell No:
                        <input type="int" placeholder="+27 ** *** ****"
                            onChange={(e) => handleChanges(e)} required />
                    </label>

                    <label id="email">Email:
                        <input type="text" placeholder="john@doe.co.za"
                            onChange={(e) => handleChanges(e)} required />
                    </label>

                    <button type="Submit">Submit</button>
                </form>
                <div className="image">
                    <iframe width="300px" height="300px" src="https://www.google.com/maps/embed?pb=!1m13!1m8!1m3!1d917891.6876275981!2d28.1273794!3d-26.0167199!3m2!1i1024!2i768!4f13.1!3m2!1m1!2s!5e0!3m2!1sen!2sza!4v1726453115153!5m2!1sen!2sza" alt="map image"></iframe>
                </div>
            </div>
        </div>


    );

}

export default Form
