import React, { FC } from 'react';
import 'spinkit/css/spinkit.css';

interface LoaderProps {
  className?: string,
}

const Loader: FC<LoaderProps> = ({ className }) => (
  <div className={`sk-three-bounce ${className || ''}`}>
    <div className="sk-child sk-bounce1" />
    <div className="sk-child sk-bounce2" />
    <div className="sk-child sk-bounce3" />
  </div>);

export default Loader;
