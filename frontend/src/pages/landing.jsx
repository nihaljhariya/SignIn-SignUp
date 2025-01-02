import React from "react";
import "../App.css";
import { Link } from 'react-router-dom';
export default function landing() {
  return (
    <div
      style={{ backgroundImage: `url(${"lavender.jpg"})` }}
      className="LandingPageContainer"
    >
      <nav>
        <div className="navHeader">
          <h2>DittoCalling</h2>
        </div>
        <div className="navlist">
          <p>Guest</p>
          <p>Register</p>
          <div role="button">
            <p>Login</p>
          </div>
        </div>
      </nav>
 <div className="landingMainContainer">
  <div>
    <h1 className="Connect"><span style={{color:"#050915"}}>Connect</span> with you Loved Ones</h1>
    <p  className="Cover">Cover distance with DittoCalling</p>
    <div className="StartButton" role="button">
      <Link to={"/auth"}>get Stared</Link>
    </div>
  
  </div>
  <div>
    <img src="Laptop.png"></img>
  </div>
 </div>




    </div>
  );
}

