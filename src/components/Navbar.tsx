
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { MapPin, List, Settings, Clock } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t border-border h-16 px-2 z-10">
      <div className="flex justify-around items-center h-full max-w-md mx-auto">
        <NavLink 
          to="/" 
          className={({ isActive }) => 
            `nav-link ${isActive ? 'active' : ''}`
          }
          end
        >
          <MapPin className="h-5 w-5 mb-1" />
          <span className="text-xs">Home</span>
        </NavLink>
        
        <NavLink 
          to="/routes" 
          className={({ isActive }) => 
            `nav-link ${isActive ? 'active' : ''}`
          }
        >
          <List className="h-5 w-5 mb-1" />
          <span className="text-xs">Routes</span>
        </NavLink>
        
        <NavLink 
          to="/log" 
          className={({ isActive }) => 
            `nav-link ${isActive ? 'active' : ''}`
          }
        >
          <Clock className="h-5 w-5 mb-1" />
          <span className="text-xs">Log</span>
        </NavLink>
        
        <NavLink 
          to="/settings" 
          className={({ isActive }) => 
            `nav-link ${isActive ? 'active' : ''}`
          }
        >
          <Settings className="h-5 w-5 mb-1" />
          <span className="text-xs">Settings</span>
        </NavLink>
      </div>
    </nav>
  );
};

export default Navbar;
