'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronDown } from 'lucide-react';
import WeatherWidget from './WeatherWidget';

export default function NavbarClient({ categories, pages, siteLogo, siteName }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  // Organizar categorías en padres e hijos
  const mainCategories = categories.filter(c => c.parentId === null);
  
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const toggleDropdown = (id) => {
    if (openDropdownId === id) setOpenDropdownId(null);
    else setOpenDropdownId(id);
  };

  return (
    <header className="fixed top-0 w-full z-50 glass border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo Area */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/">
              {siteLogo ? (
                <img src={siteLogo} alt={siteName} className="h-10 object-contain" />
              ) : (
                <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                  {siteName || 'RENACER'}
                </span>
              )}
            </Link>
          </div>

          {/* Right side tools */}
          <div className="flex items-center space-x-2 md:space-x-4">
            <div className="block">
              <WeatherWidget />
            </div>

            {/* Universal Hamburger Button */}
            <div className="flex items-center">
              <button 
                onClick={toggleMobileMenu}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Universal Dropdown Menu */}
      <div className={`absolute top-16 left-0 w-full bg-background/95 backdrop-blur-xl border-b border-border transition-all duration-300 overflow-hidden ${isMobileMenuOpen ? 'max-h-[80vh] py-4 shadow-2xl' : 'max-h-0 py-0'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-2 overflow-y-auto pb-6">
          <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-3 text-base font-medium rounded-md hover:bg-white/5 hover:text-primary">
            Inicio
          </Link>
          
          {mainCategories.map((cat) => {
            const children = categories.filter(c => c.parentId === cat.id);
            const hasChildren = children.length > 0;

            if (hasChildren) {
              return (
                <div key={cat.id} className="space-y-1">
                  <div className="flex justify-between items-center px-3 py-3 rounded-md hover:bg-white/5">
                    <Link href={`/noticias?category=${cat.slug}`} onClick={() => setIsMobileMenuOpen(false)} className="text-base font-medium hover:text-primary flex-grow">
                      {cat.name}
                    </Link>
                    <button onClick={() => toggleDropdown(cat.id)} className="p-1">
                      <ChevronDown size={20} className={`transform transition-transform ${openDropdownId === cat.id ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                  
                  {openDropdownId === cat.id && (
                    <div className="pl-6 space-y-1 border-l border-border ml-3 my-2">
                      {children.map(child => (
                        <Link 
                          key={child.id} 
                          href={`/noticias?category=${child.slug}`} 
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="block px-3 py-2 text-sm text-gray-400 hover:text-primary hover:bg-white/5 rounded-md"
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link key={cat.id} href={`/noticias?category=${cat.slug}`} onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-3 text-base font-medium rounded-md hover:bg-white/5 hover:text-primary">
                {cat.name}
              </Link>
            );
          })}

          <div className="pt-4 mt-4 border-t border-border space-y-2">
            {pages.map((page) => (
              <Link key={page.id} href={`/${page.slug}`} onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 text-sm text-gray-400 hover:text-primary rounded-md">
                {page.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
