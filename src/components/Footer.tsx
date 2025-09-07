import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="mt-12 border-t border-gray-200 bg-white/60 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-gray-600">
          <p>
            © {new Date().getFullYear()} AquaFlow. Stay hydrated, stay healthy.
          </p>
          <div className="flex items-center gap-4">
            <a className="hover:text-sky-600" href="#">Privacy</a>
            <a className="hover:text-sky-600" href="#">Terms</a>
            <a className="hover:text-sky-600" href="#">Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


