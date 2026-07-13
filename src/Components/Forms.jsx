import React from 'react';
import './Forms.css';


function Forms(){
    return(
  <section className="form-container">
    <div className="form-content">
      <h2 className="form-title">
        JOIN THE ELITE ROSTER
      </h2>

      <p className="form-subtitle">
        Receive weekly deep-dives into popular automotive modals information
        and new model releases.
      </p>

      <form className="form-form">
      <input
        type="email"
        className="form-input"
        id='EmailSend'
        placeholder="johndoe@email.com"
      />

      <button
        type="submit"
        className="form-button"
      >
        Subscribe
      </button>
    </form>
  </div>
  </section>
    );
}

export default Forms;