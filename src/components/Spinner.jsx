import React from "react";

import "./styles/spinner.scss";

function Spinner() {
  return (
    <>
      <div className="overlay">
        <div className="spinner"></div>
      </div>
    </>
  );
}

export default Spinner;
