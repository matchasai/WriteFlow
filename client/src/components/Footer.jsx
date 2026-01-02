import { useNavigate } from 'react-router-dom'
import { assets, blogCategories } from '../assets/assets'

const Footer = () => {
    const navigate = useNavigate()

  return (
        <footer className='mt-16 border-t border-primary/10 bg-gradient-to-b from-white to-blue-50/30'>
            <div className='h-[2px] w-full' style={{ background: 'var(--gradient-primary)' }} />

            <div className='px-6 md:px-16 lg:px-24 xl:px-32'>
                <div className='grid grid-cols-1 gap-10 py-12 md:grid-cols-12'>
                    <div className='md:col-span-5'>
                        <button
                            type='button'
                            onClick={() => navigate('/')}
                            className='inline-flex items-center gap-3 hover:opacity-90 transition'
                            aria-label='Go to home'
                            title='WriteFlow'
                        >
                            <svg aria-hidden='true' viewBox='0 0 64 64' className='h-10 w-10 shrink-0'>
                                <rect width='64' height='64' rx='14' fill='#4F46E5' />
                                <path d='M20 44l6-18 18-18 6 6-18 18-18 6z' fill='#ffffff' />
                            </svg>
                            <span className='text-lg font-semibold text-gray-900'>WriteFlow</span>
                        </button>

                        <p className='mt-3 max-w-md text-sm text-gray-700'>
                            A modern blogging platform to publish ideas, share stories, and keep your words flowing.
                        </p>
                    </div>

                    <div className='md:col-span-4'>
                        <h3 className='text-sm font-semibold text-gray-900'>Categories</h3>
                        <div className='mt-3 flex flex-wrap gap-2'>
                            {blogCategories.filter((c) => c !== 'All').map((c) => (
                                <span key={c} className='chip'>{c}</span>
                            ))}
                        </div>
                    </div>

                    <div className='md:col-span-3'>
                        <h3 className='text-sm font-semibold text-gray-900'>Follow</h3>
                        <div className='mt-3 flex items-center gap-3'>
                            <a
                                className='inline-flex h-12 w-12 items-center justify-center rounded-full bg-white border border-primary/10 hover:bg-gray-50 transition'
                                href='https://facebook.com'
                                target='_blank'
                                rel='noreferrer'
                                aria-label='Facebook'
                                title='Facebook'
                            >
                                <img src={assets.facebook_icon} alt='' className='h-6 w-6' />
                            </a>
                            <a
                                className='inline-flex h-12 w-12 items-center justify-center rounded-full bg-white border border-primary/10 hover:bg-gray-50 transition'
                                href='https://twitter.com'
                                target='_blank'
                                rel='noreferrer'
                                aria-label='Twitter'
                                title='Twitter'
                            >
                                <img src={assets.twitter_icon} alt='' className='h-6 w-6' />
                            </a>
                            <a
                                className='inline-flex h-12 w-12 items-center justify-center rounded-full bg-white border border-primary/10 hover:bg-gray-50 transition'
                                href='https://youtube.com'
                                target='_blank'
                                rel='noreferrer'
                                aria-label='YouTube'
                                title='YouTube'
                            >
                                <img src={assets.googleplus_icon} alt='' className='h-6 w-6' />
                            </a>
                        </div>

                        <p className='mt-4 text-xs text-gray-600'>Built with React, Tailwind, and a variable-driven theme.</p>
                    </div>
                </div>

                <div className='border-t border-primary/10 py-6 text-center text-xs sm:text-sm text-gray-600'>
                    © {new Date().getFullYear()} WriteFlow — Let your words flow. All rights reserved.
                </div>
            </div>
        </footer>
  )
}

export default Footer
