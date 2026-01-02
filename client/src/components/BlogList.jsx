import { useState } from 'react';
import { blogCategories } from '../assets/assets';
import { useAppContext } from "../context/AppContext";
import BlogCard from './BlogCard';

const htmlToText = (html) => {
  if (!html) return '';
  try {
    const doc = new DOMParser().parseFromString(String(html), 'text/html');
    return (doc.body.textContent || '').replace(/\s+/g, ' ').trim();
  } catch {
    return String(html).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }
};

const BlogList = () => {
    const [menu, setMenu] = useState("All");
    const{blogs, input} = useAppContext();
    const filteredBlogs = () => {
      if (!input) return blogs;

      const q = input.toLowerCase();
      return blogs.filter((blog) => {
        const title = (blog.title || '').toLowerCase();
        const category = (blog.category || '').toLowerCase();
        const meta = (blog.metaDescription || '').toLowerCase();
        const body = htmlToText(blog.description || '').toLowerCase();
        const tags = Array.isArray(blog.tags) ? blog.tags.join(' ').toLowerCase() : '';

        return (
          title.includes(q) ||
          category.includes(q) ||
          meta.includes(q) ||
          body.includes(q) ||
          tags.includes(q)
        );
      });
    };

  return (
    <div>
      <div className='flex flex-wrap justify-center gap-2 sm:gap-4 my-10 relative px-4'>
        {blogCategories.map((item) => (
            <div key={item} className='relative'>
                <button onClick={()=> setMenu(item)}
                  className={`${menu === item ? 'chip chip-selected' : 'chip'} cursor-pointer`}>
                    {item}
                </button>
            </div>
        ))}
      </div>
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8 mb-24 mx-4 sm:mx-8 md:mx-12 xl:mx-40'>
        {filteredBlogs().filter((blog)=> menu === "All" ? true : blog.category === menu).map((blog) => <BlogCard key={blog._id} blog={blog}/>)}
      </div>
    </div>
  )
}

export default BlogList
