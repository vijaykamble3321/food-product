import React, { useState } from 'react';
import { Link } from 'react-router';
import { FiShoppingCart, FiUser, FiMenu, FiX } from 'react-icons/fi';
import { FaOpencart } from 'react-icons/fa';
import { HiOutlineShoppingBag } from 'react-icons/hi';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Menu', path: '/' },
    { name: 'About', path: '/' },
    { name: 'Contact', path: '/' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link
            to="/"
            className="text-2xl font-bold text-gray-800 hover:text-rose-600 flex items-center"
          >
            <HiOutlineShoppingBag className="text-rose-600 text-3xl mr-2" />
            <span className="hidden sm:inline">FoodExpress</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-gray-700 hover:text-rose-600 font-medium relative group transition"
              >
                {link.name}
                <span className="absolute left-0 -bottom-1 h-0.5 w-0 bg-rose-600 transition-all group-hover:w-full"></span>
              </Link>
            ))}
          </nav>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <button className="p-2 text-gray-700 hover:text-rose-600 hover:bg-gray-100 rounded-full transition">
              <FiUser className="h-5 w-5" />
            </button>
            <button className="p-2 text-gray-700 hover:text-rose-600 hover:bg-gray-100 rounded-full transition relative">
              <FaOpencart className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                3
              </span>
            </button>
            <button className="px-4 py-2 bg-rose-600 text-white font-medium rounded-full hover:bg-rose-700 transition shadow-md hover:shadow-rose-200">
              Order Now
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-gray-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4 animate-fadeIn">
            {/* Horizontal Nav Links */}
            <nav className="flex flex-wrap justify-center gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="text-sm px-4 py-2 bg-gray-100 text-gray-800 rounded-full font-medium hover:bg-rose-100 hover:text-rose-600 transition"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </nav>

            {/* User Actions - Mobile */}
            <div className="flex justify-center space-x-4 pt-2">
              <button className="p-2 text-gray-700 hover:text-rose-600 hover:bg-gray-100 rounded-full transition">
                <FiUser className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-700 hover:text-rose-600 hover:bg-gray-100 rounded-full transition relative">
                <FaOpencart className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  3
                </span>
              </button>
              <button className="px-4 py-2 bg-rose-600 text-white rounded-full font-medium hover:bg-rose-700 transition shadow-md">
                Order Now
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
