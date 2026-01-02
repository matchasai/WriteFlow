import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import Sidebar from '../../components/admin/Sidebar'
import { useAppContext } from '../../context/AppContext'


const Layout = () => {
    const navigate = useNavigate()
  const {setToken, accentMode, cycleAccent} = useAppContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);


    const logout = () => {
      localStorage.removeItem('adminToken');
      sessionStorage.removeItem('isLoggedIn');
      setToken(null);
      navigate('/')
    }
  return (
    <div className='bg-white min-h-screen'>
      <div className='flex flex-wrap items-center justify-between gap-2 py-2 px-4 sm:px-12 xl:px-20 border-b border-primary/10 bg-gradient-to-r from-indigo-600 via-violet-500 to-cyan-500 text-white backdrop-blur-md'>
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
          className='md:hidden mr-3 p-2 rounded-lg bg-white/15 hover:bg-white/20 transition'
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 6h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M4 12h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        <img src="/logo.svg" alt="WriteFlow Logo" className='h-10 sm:h-12 cursor-pointer hover:opacity-90 transition'
        onClick={()=> navigate('/')}/>
        <div className='flex flex-wrap items-center justify-end gap-2 sm:gap-3'>
          <button
            type="button"
            onClick={cycleAccent}
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
          <button onClick={logout} className='flex items-center gap-2 rounded-full text-xs sm:text-sm cursor-pointer bg-black/30 hover:bg-black/40 text-white px-4 py-1.5 sm:px-8 sm:py-2 transition'>Logout</button>
        </div>
     </div>
      <div className='flex h-[calc(100vh-70px)] relative'>
        {sidebarOpen && (
          <button
            type="button"
            aria-label="Close sidebar overlay"
            onClick={() => setSidebarOpen(false)}
            className='md:hidden fixed top-[70px] left-0 right-0 bottom-0 bg-black/30 z-30'
          />
        )}

        <div className='hidden md:block'>
          <Sidebar open={true} />
        </div>
        <div className='md:hidden'>
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        </div>

        <main className='flex-1 min-w-0 overflow-auto'>
         <Outlet />
        </main>
      </div>
    </div>
  )
}

export default Layout
