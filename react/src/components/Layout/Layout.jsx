import React from 'react';
import { Navbar } from './Navbar';
import './Layout.css';

export const Layout = ({ children }) => {
  return (
    <div className="layout" data-easytag="id1-react/src/components/Layout/Layout.jsx">
      <Navbar />
      <main className="layout-content">
        {children}
      </main>
    </div>
  );
};
