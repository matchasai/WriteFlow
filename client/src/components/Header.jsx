import { useState } from 'react';
import { assets } from '../assets/assets';
import blogPic1 from '../assets/blog_pic_1.png';
import blogPic2 from '../assets/blog_pic_2.png';
import blogPic3 from '../assets/blog_pic_3.png';
import { useAppContext } from '../context/AppContext';


const Header = () => {
    const { setInput, input } = useAppContext();
    const [query, setQuery] = useState('');

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setInput(query.trim());
    }

    const onClear = () => {
        setInput('');
        setQuery('');
    }

  return (
    <div className='mx-8 sm:mx-16 xl:mx-24 relative fade-in'>
        <div className='mt-16 sm:mt-20 mb-10 grid gap-10 lg:grid-cols-2 lg:items-center'>
            <div className='text-center lg:text-left'>
                <div className='inline-flex items-center justify-center lg:justify-start gap-3 px-6 py-1.5 mb-4 chip chip-selected'>
                    <p>Hi, I’m Sai Sujan 👋</p>
                    <img src={assets.star_icon} className='w-2.5' alt="" />
                </div>

                <h1 className='text-3xl sm:text-6xl font-semibold sm:leading-16 text-gray-800 gradient-text'>
                    Thoughts, stories &amp; things I’m learning in tech.
                </h1>

                <p className='mt-4 text-gray-600 max-w-2xl lg:max-w-xl mx-auto lg:mx-0'>
                    A final-year Computer Science student documenting my journey through projects, AI,
                    startups, and personal growth.
                </p>

                <form onSubmit={onSubmitHandler} className='mt-7 flex flex-col sm:flex-row items-stretch max-w-lg mx-auto lg:mx-0 border border-gray-200 bg-white rounded overflow-hidden slide-up'>
                    <input
                        id="search-query"
                        name="search"
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder='Search posts by title, tags, keywords...'
                        required
                        aria-label="Search blogs"
                        className='w-full px-4 py-3 sm:py-0 outline-none bg-transparent text-gray-800'
                    />
                    <button type="submit" className='btn-gradient px-6 sm:px-8 py-2 m-1.5 cursor-pointer'>Search</button>
                </form>

                <div className='mt-4 text-center lg:text-left'>
                    {input && (
                        <button
                            onClick={onClear}
                            className='border font-light text-xs py-1 px-3 rounder-sm shadow-custom-sm cursor-pointer border-gray-300 text-gray-700'
                        >
                            Clear Search
                        </button>
                    )}
                </div>
            </div>

            <div className='relative mx-auto w-full max-w-md'>
                <div className='relative aspect-[4/3]'>
                    <img
                        src={assets.gradientBackground}
                        alt=""
                        className='absolute inset-0 w-full h-full object-cover opacity-40 pointer-events-none select-none'
                    />

                    <img
                        src={blogPic3}
                        alt=""
                        className='absolute left-3 top-2 w-40 sm:w-48 rounded-xl card float-slow'
                        style={{ animationDelay: '0ms' }}
                    />
                    <img
                        src={blogPic2}
                        alt=""
                        className='absolute right-2 top-10 w-40 sm:w-48 rounded-xl card float-slow'
                        style={{ animationDelay: '450ms' }}
                    />
                    <img
                        src={blogPic1}
                        alt=""
                        className='absolute left-14 bottom-0 w-48 sm:w-56 rounded-xl card float-slow'
                        style={{ animationDelay: '900ms' }}
                    />
                </div>
            </div>
        </div>
    </div>
  )
}

export default Header
