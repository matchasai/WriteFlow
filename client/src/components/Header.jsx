import { useRef } from 'react';
import { assets } from '../assets/assets';
import { useAppContext } from '../context/AppContext';


const Header = () => {
    const {setInput, input} = useAppContext();
    const inputRef = useRef(null);

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setInput(inputRef.current.value);
    }

    const onClear = () => {
        setInput('');
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    }

  return (
    <div className='mx-8 sm:mx-16 xl:mx-24 relative fade-in'>
        <div className='text-center mt-20 mb-8'>

            <div className='inline-flex items-center justify-center gap-4 px-6 py-1.5 mb-4 chip chip-selected'>
                <p>Welcome to my blog</p>
                <img src={assets.star_icon} className='w-2.5' alt="" />
            </div>

            <h1 className='text-3xl sm:text-6xl font-semibold sm:leading-16 text-gray-800 gradient-text'>Thoughts, stories &amp;<br /> things I’m learning.</h1>
            <p className='my-6 sm:my-8 max-w-2xl m-auto max-sm:text-xs text-gray-500'>
                A personal space to share writing, ideas, and notes.
                Search posts by title, category, tags, or keywords.
            </p>

            <form onSubmit={onSubmitHandler} className='flex flex-col sm:flex-row items-stretch max-w-lg mx-auto border border-gray-200 bg-white rounded overflow-hidden slide-up'>
                <input id="search-query" name="search" ref={inputRef} type="text" placeholder='Search posts...' required aria-label="Search blogs" className='w-full px-4 py-3 sm:py-0 outline-none bg-transparent text-gray-800'/>
                <button type="submit" className='btn-gradient px-6 sm:px-8 py-2 m-1.5 cursor-pointer'>Search</button>
            </form>



        </div>
        <div className='text-center'>
            {
            input &&<button onClick={onClear} className='border font-light text-xs py-1 px-3 rounder-sm 
            shadow-custom-sm cursor-pointer border-gray-300 text-gray-700'>Clear Search</button>
            }
        </div>
        <img src={assets.gradientBackground} alt="" className='absolute -top-50 z-[-1] opacity-40 pointer-events-none select-none' />

    </div>
  )
}

export default Header
