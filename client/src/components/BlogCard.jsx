import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const htmlToText = (html) => {
  if (!html) return '';
  try {
    const doc = new DOMParser().parseFromString(String(html), 'text/html');
    return (doc.body.textContent || '').replace(/\s+/g, ' ').trim();
  } catch {
    return String(html).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }
};

const truncate = (text, maxLen) => {
  const t = (text || '').trim();
  if (t.length <= maxLen) return t;
  return `${t.slice(0, maxLen - 1).trim()}…`;
};

const BlogCard = ({blog}) => {
    const {title, description, category, image, _id, metaDescription, tags} = blog;
    const navigate = useNavigate()
  const { setInput } = useAppContext();

    const excerpt = useMemo(() => {
      const fromMeta = (metaDescription || '').trim();
      if (fromMeta) return truncate(fromMeta, 140);
      return truncate(htmlToText(description), 140);
    }, [description, metaDescription]);

    const visibleTags = useMemo(() => {
      if (!Array.isArray(tags)) return [];
      return tags.map(t => String(t).trim()).filter(Boolean).slice(0, 2);
    }, [tags]);

  return (
    <div onClick={()=>navigate(`/blog/${_id}`)} className='w-full card overflow-hidden cursor-pointer'> 
      <img src={image} alt="" className='w-full aspect-video object-cover'/>
      <span className={`ml-5 mt-4 inline-flex px-3 py-1 ${category === 'All' ? 'chip chip-contrast' : 'chip'}`}>{category}</span>
      <div className='p-5'>
        <h5 className='mb-2 font-medium text-gray-900'>{title}</h5>
        <p className='mb-3 text-xs text-gray-600'>{excerpt}</p>
        {visibleTags.length ? (
          <div className='mt-3 flex flex-wrap gap-2'>
            {visibleTags.map((t) => (
              <button
                key={t}
                type='button'
                className='chip text-xs cursor-pointer'
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setInput(t);
                  navigate('/');
                }}
                aria-label={`Filter by tag ${t}`}
                title={`Filter by ${t}`}
              >
                {t}
              </button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export default BlogCard
