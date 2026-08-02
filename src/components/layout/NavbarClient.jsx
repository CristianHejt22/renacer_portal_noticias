'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Plus, Minus } from 'lucide-react';
import WeatherWidget from './WeatherWidget';

export default function NavbarClient({ categories = [], pages = [], siteLogo, siteName }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  // Organizar categorías en padres e hijos
  const mainCategories = (categories || []).filter(c => !c.parentId);
  
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const toggleDropdown = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (openDropdownId === id) setOpenDropdownId(null);
    else setOpenDropdownId(id);
  };

  // Close mobile menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header 
        className="fixed top-0 w-full z-50 border-b border-[#d1c9b4] shadow-sm transition-all"
        style={{ backgroundColor: '#F5EEDC', color: '#1a1a1a' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo Area */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                {siteLogo ? (
                  <img src={siteLogo} alt={siteName || 'Logo'} className="h-14 py-1 object-contain" />
                ) : (
                  <span className="text-2xl font-bold tracking-wider" style={{ fontFamily: 'serif', color: '#1a1a1a' }}>
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
                  type="button"
                  onClick={toggleMobileMenu}
                  className="p-2 text-gray-800 hover:text-black transition-colors rounded-lg focus:outline-none"
                  aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
                >
                  {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Universal Dropdown Menu */}
        <div 
          className={`absolute top-16 left-0 w-full border-b border-[#d1c9b4] transition-all duration-300 overflow-hidden ${
            isMobileMenuOpen ? 'max-h-[85vh] py-4 shadow-2xl opacity-100' : 'max-h-0 py-0 opacity-0 pointer-events-none'
          }`}
          style={{ backgroundColor: '#F5EEDC' }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-1.5 overflow-y-auto max-h-[75vh] pb-6 no-scrollbar">
            <Link 
              href="/" 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="block px-3 py-2.5 text-base font-medium rounded-lg hover:bg-black/5 text-gray-900 hover:text-black transition-colors"
            >
              Inicio
            </Link>
            <Link 
              href="/noticias" 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="block px-3 py-2.5 text-base font-medium rounded-lg hover:bg-black/5 text-gray-900 hover:text-black transition-colors"
            >
              Noticias
            </Link>
            <Link 
              href="/clasificados" 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="block px-3 py-2.5 text-base font-medium rounded-lg hover:bg-black/5 text-gray-900 hover:text-black transition-colors"
            >
              Clasificados
            </Link>
            
            {mainCategories.map((cat) => {
              const children = (categories || []).filter(c => c.parentId === cat.id);
              const hasChildren = children.length > 0;

              if (hasChildren) {
                return (
                  <div key={cat.id} className="space-y-1">
                    <div className="flex items-center justify-between px-3 py-1.5 rounded-lg hover:bg-black/5">
                      <Link 
                        href={`/noticias?category=${cat.slug}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-base font-medium text-gray-900 hover:text-black flex-grow py-1"
                      >
                        {cat.name}
                      </Link>
                      <button 
                        type="button"
                        onClick={(e) => toggleDropdown(e, cat.id)}
                        className="p-2 text-gray-700 hover:text-black rounded-md hover:bg-black/10 transition-colors"
                        aria-label={`Ver subcategorías de ${cat.name}`}
                      >
                        {openDropdownId === cat.id ? <Minus size={18} /> : <Plus size={18} />}
                      </button>
                    </div>
                    
                    {openDropdownId === cat.id && (
                      <div className="pl-6 space-y-1 border-l-2 border-[#d1c9b4] ml-4 my-1.5">
                        {children.map(child => (
                          <Link 
                            key={child.id} 
                            href={`/noticias?category=${child.slug}`} 
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="block px-3 py-2 text-sm text-gray-700 hover:text-black hover:bg-black/5 rounded-md transition-colors"
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
                <Link 
                  key={cat.id} 
                  href={`/noticias?category=${cat.slug}`} 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="block px-3 py-2.5 text-base font-medium text-gray-900 rounded-lg hover:bg-black/5 hover:text-black transition-colors"
                >
                  {cat.name}
                </Link>
              );
            })}

            <div className="pt-4 mt-4 border-t border-[#d1c9b4] space-y-1.5">
              <Link 
                href="/mi-cuenta/favoritos" 
                onClick={() => setIsMobileMenuOpen(false)} 
                className="block px-3 py-2 text-sm text-gray-800 hover:text-black rounded-lg hover:bg-black/5 font-bold transition-colors"
              >
                ⭐ Mis Favoritos
              </Link>
              {pages.map((page) => (
                <Link 
                  key={page.id} 
                  href={`/${page.slug}`} 
                  onClick={() => setIsMobileMenuOpen(false)} 
                  className="block px-3 py-2 text-sm text-gray-700 hover:text-black rounded-lg hover:bg-black/5 transition-colors"
                >
                  {page.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Backdrop to close menu on click outside */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)} 
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 animate-fade-in"
          aria-hidden="true"
        />
      )}
    </>
  );
}
