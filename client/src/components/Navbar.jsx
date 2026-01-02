import { useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';
import { useAppContext } from '../context/AppContext';

const Navbar = () => {
  
  const routerNavigate = useNavigate();
  const {navigate, token, accentMode, cycleAccent} = useAppContext();
  const safeNavigate = (to) => {
    try {
      if (typeof navigate === 'function') navigate(to);
      else if (typeof routerNavigate === 'function') routerNavigate(to);
      else window.location.href = to;
    } catch (err) {
      console.error('Navbar navigate error:', err);
      window.location.href = to;
    }
  };
  return (
        <div
          role="navigation"
          aria-label="Main navigation"
          className='site-nav relative flex flex-wrap justify-between items-center gap-2 py-2 px-4 sm:px-12 xl:px-20 border-b border-primary/10 bg-gradient-to-r from-indigo-600 via-violet-500 to-cyan-500 text-white backdrop-blur-md z-50'
          style={{ zIndex: 9999 }}
        >
          <button
            type="button"
            onClick={() => safeNavigate('/')}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                safeNavigate('/');
              }
            }}
            aria-label="Go to home"
            title="WriteFlow"
            className='inline-flex items-center gap-2 cursor-pointer hover:opacity-90 transition select-none'
          >
            <svg aria-hidden="true" viewBox="0 0 64 64" className='h-9 w-9 sm:h-10 sm:w-10 shrink-0'>
              <rect width="64" height="64" rx="14" fill="#4F46E5" />
              <path d="M20 44l6-18 18-18 6 6-18 18-18 6z" fill="#ffffff" />
            </svg>
            <span className='font-semibold tracking-tight'>WriteFlow</span>
          </button>
        <div className='flex flex-wrap items-center justify-end gap-2 sm:gap-3'>
          <button
            type="button"
            onClick={() => {
              try {
                if (typeof cycleAccent === 'function') {
                  cycleAccent();
                }
              } catch (err) { 
                console.error('cycleAccent handler error', err); 
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (typeof cycleAccent === 'function') {
                  cycleAccent();
                }
              }
            }}
            aria-label='Toggle accent mode'
            aria-pressed={accentMode !== 'aurora'}
            title={accentMode === 'aurora' ? 'Accent: Aurora' : accentMode === 'bold' ? 'Accent: Bold' : 'Accent: Cool'}
            className='rounded-full bg-white/20 hover:bg-white/25 text-white px-3 py-1.5 text-xs flex items-center gap-2 transition cursor-pointer active:scale-95'
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className='w-4 h-4 opacity-90 hidden sm:block'>
              <path fill="currentColor" d="M12 2l1.2 5.3L18 9l-4.8 1.7L12 16l-1.2-5.3L6 9l4.8-1.7L12 2zm7 8l.7 3.1L22 14l-2.3.9L19 18l-.7-3.1L16 14l2.3-.9L19 10zM5 12l.7 3.1L8 16l-2.3.9L5 20l-.7-3.1L2 16l2.3-.9L5 12z"/>
            </svg>
            <span className='w-2.5 h-2.5 rounded-full' style={{ background: 'var(--gradient-primary)' }}></span>
            <span className='hidden sm:inline'>{accentMode === 'aurora' ? 'Aurora' : accentMode === 'bold' ? 'Bold' : 'Cool'}</span>
            <span className='sm:hidden'>{accentMode === 'aurora' ? 'A' : accentMode === 'bold' ? 'B' : 'C'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              const dest = token ? '/admin' : '/login';
              safeNavigate(dest);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const dest = token ? '/admin' : '/login';
                safeNavigate(dest);
              }
            }}
            className='flex items-center gap-2 rounded-full text-xs sm:text-sm cursor-pointer bg-black/25 hover:bg-black/35 text-white px-3 py-1.5 sm:px-6 sm:py-2 transition active:scale-95'
          >
            {token ? 'Dashboard' : 'Login'}
            <img src={assets.arrow} className='w-3 invert' alt="arrow" />
          </button>
        </div>
    </div>
  )
}   


export default Navbar