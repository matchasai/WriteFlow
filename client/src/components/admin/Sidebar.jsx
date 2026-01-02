import { NavLink } from 'react-router-dom';
import { assets } from '../../assets/assets';

const Sidebar = ({ open = false, onClose }) => {
  const linkBase =
    'flex items-center gap-3 py-3.5 px-4 md:px-9 cursor-pointer text-gray-700 transition-colors hover:bg-black/5';

  return (
    <aside
      className={`
        fixed md:static
        top-0 md:top-auto left-0
        h-screen md:h-full
        w-72 max-w-[85vw]
        bg-white
        border-r border-gray-200
        z-40
        transform transition-transform duration-200 ease-out
        ${open ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}
      aria-label="Admin sidebar"
    >
      <div className='flex items-center justify-between px-4 md:px-9 pt-6 pb-4 border-b border-gray-100'>
        <img src="/logo.svg" alt="WriteFlow Logo" className='h-8 md:h-9' />
        <button
          type="button"
          onClick={() => onClose?.()}
          aria-label="Close sidebar"
          className='md:hidden p-2 rounded-lg hover:bg-black/5 transition'
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <nav className='py-2'>
        <NavLink
          end={true}
          to="/admin"
          onClick={() => onClose?.()}
          className={({ isActive }) => `${linkBase} ${isActive ? 'nav-active' : ''}`}
        >
          <img src={assets.home_icon} alt="" className='min-w-4 w-5' />
          <p>Dashboard</p>
        </NavLink>

        <NavLink
          to="/admin/addBlog"
          onClick={() => onClose?.()}
          className={({ isActive }) => `${linkBase} ${isActive ? 'nav-active' : ''}`}
        >
          <img src={assets.add_icon} alt="" className='min-w-4 w-5' />
          <p>Add Blog</p>
        </NavLink>

        <NavLink
          to="/admin/listBlog"
          onClick={() => onClose?.()}
          className={({ isActive }) => `${linkBase} ${isActive ? 'nav-active' : ''}`}
        >
          <img src={assets.list_icon} alt="" className='min-w-4 w-5' />
          <p>Blog Lists</p>
        </NavLink>

        <NavLink
          to="/admin/comments"
          onClick={() => onClose?.()}
          className={({ isActive }) => `${linkBase} ${isActive ? 'nav-active' : ''}`}
        >
          <img src={assets.comment_icon} alt="" className='min-w-4 w-5' />
          <p>Comments</p>
        </NavLink>
      </nav>
    </aside>
  )
}

export default Sidebar
