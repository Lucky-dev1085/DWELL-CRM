import React from 'react';
import 'spinkit/css/spinkit.css';

const Loader = (): JSX.Element => (
  <div className="sk-three-bounce">
    <div className="sk-child sk-bounce1" />
    <div className="sk-child sk-bounce2" />
    <div className="sk-child sk-bounce3" />
  </div>);

export default Loader;
