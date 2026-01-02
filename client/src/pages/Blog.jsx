import Moment from 'moment';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { assets } from '../assets/assets';
import Footer from '../components/Footer';
import Loader from '../components/Loader';
import Navbar from '../components/Navbar';
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

const Blog = () => {
  const {id} = useParams();
  const {axios, setInput, navigate} = useAppContext();


  const [data, setData] = useState(null);
  const [comments, setComments] = useState([]);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchBlogData = useCallback(async () => {
    try {
      const{data} = await axios.get(`/api/blogs/${id}`);
      data.success ? setData(data.blog) : toast.error(data.message);
    } catch (error) {
      if (error?.response?.status === 429) return;
      toast.error(`Error fetching blog data: ${error?.response?.data?.message || error.message || 'Unknown error'}`);
    } finally { setLoading(false); }
  }, [axios, id]);

  const fetchComments = useCallback(async () => {
    try {
      const{data} = await axios.get(`/api/blogs/comments/${id}`);
      data.success ? setComments(data.comments) : toast.error(data.message);
    } catch (error) {
      if (error?.response?.status === 429) return;
      toast.error(`Error fetching comments: ${error?.response?.data?.message || error.message || 'Unknown error'}`);
    }
  }, [axios, id]);
  const addComment = async (e) => {
    e.preventDefault();
    try {
      const{data} = await axios.post(`/api/blogs/add-comment/${id}`, {name, content: comment});
      if(data.success){
        toast.success("Comment added successfully");
        setName('');
        setComment('');
        fetchComments();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      if (error?.response?.status === 429) return;
      toast.error(`Error adding comment: ${error?.response?.data?.message || error.message || 'Unknown error'}`);
    }
  }

  useEffect(() => {
    fetchBlogData();
    fetchComments();
  }, [fetchBlogData, fetchComments]);

  useEffect(() => {
    if (!data) return;
    try {
      document.title = data.title ? `${data.title} | WriteFlow` : 'WriteFlow';

      const fallback = htmlToText(data.description || '').slice(0, 160);
      const nextDescription = (data.metaDescription || '').trim() || fallback;

      const meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute('content', nextDescription);
    } catch {
      // ignore
    }
  }, [data]);

  const readableHtml = useMemo(() => {
    const html = data?.description || '';
    if (!html) return '';

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const paragraphs = Array.from(doc.querySelectorAll('p'));

      for (const p of paragraphs) {
        // Only split plain-text paragraphs (no inline tags) to avoid breaking formatting.
        if (p.children.length > 0) continue;

        const text = (p.textContent || '').trim();
        if (text.length < 420) continue;

        const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
        if (sentences.length < 2) continue;

        const chunks = [];
        let current = '';
        const TARGET_CHUNK_LEN = 260;

        for (const s of sentences) {
          const next = current ? `${current} ${s}` : s;
          if (next.length > TARGET_CHUNK_LEN && current) {
            chunks.push(current);
            current = s;
          } else {
            current = next;
          }
        }
        if (current) chunks.push(current);

        if (chunks.length < 2) continue;

        const frag = doc.createDocumentFragment();
        for (const chunk of chunks) {
          const np = doc.createElement('p');
          np.textContent = chunk;
          frag.appendChild(np);
        }

        p.replaceWith(frag);
      }

      return doc.body.innerHTML;
    } catch {
      return html;
    }
  }, [data?.description]);

  const shareUrl = useMemo(() => {
    try {
      return typeof window !== 'undefined' ? window.location.href : '';
    } catch {
      return '';
    }
  }, []);

  const onCopyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  if (loading) {
    return (
      <div className='relative bg-white min-h-screen'>
        <Navbar/>
        <div className='mx-5 max-w-5xl md:mx-auto my-10 mt-24'>
          <div className='skeleton-text skeleton w-56 mb-4'></div>
          <div className='skeleton-text skeleton w-96 mb-2'></div>
          <div className='skeleton-rounded skeleton w-full aspect-video mb-6'></div>
          <div className='space-y-3 max-w-3xl'>
            <div className='skeleton-text skeleton w-full'></div>
            <div className='skeleton-text skeleton w-5/6'></div>
            <div className='skeleton-text skeleton w-4/6'></div>
          </div>
        </div>
      </div>
    )
  }

  return data ? (
    <div className='relative bg-white min-h-screen'>
      <img src={assets.gradientBackground} alt="" className='absolute -top-50 z-[-1] opacity-40 pointer-events-none select-none'/>
      <Navbar/>

      <div className='text-center mt-20 text-gray-600 fade-in'>
        <p className='text-primary py-4 font-medium'>Published on {Moment(data.createdAt).format('MMMM Do, YYYY')}</p>
        <h1 className='text-2xl sm:text-5xl font-extrabold max-w-2xl mx-auto gradient-text serif-title'>{data.title}</h1>
        {data.subTitle ? (
          <h2 className='my-5 max-w-3xl mx-auto text-base sm:text-lg font-medium text-gray-800/90 leading-relaxed'>
            {data.subTitle}
          </h2>
        ) : null}
        {data.metaDescription ? (
          <p className='max-w-3xl mx-auto text-sm sm:text-base text-gray-700/90 leading-relaxed mb-4'>
            {data.metaDescription}
          </p>
        ) : null}
        {Array.isArray(data.tags) && data.tags.length ? (
          <div className='flex flex-wrap justify-center gap-2 mb-6'>
            {data.tags.map((t) => {
              const tag = String(t).trim();
              if (!tag) return null;
              return (
                <button
                  key={tag}
                  type='button'
                  className='chip text-xs cursor-pointer'
                  onClick={() => {
                    setInput(tag);
                    navigate('/');
                  }}
                  aria-label={`Filter by tag ${tag}`}
                  title={`Filter by ${tag}`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        ) : null}
        <span className='chip mb-6'>
          {data.author || 'WriteFlow'}
        </span>
      </div>

      <div className='mx-5 max-w-5xl md:mx-auto my-10 mt-6'>
        <img src={data.image} alt="" className='w-full h-auto rounded-3xl mb-5 object-cover' />

        <div className='rich-text max-w-3xl mx-auto leading-relaxed' dangerouslySetInnerHTML={{__html: readableHtml}}></div>

        <div className='mt-14 mb-10 max-w-3xl mx-auto'>
          <p className='font-semibold mb-4'>Comments ({comments.length})</p>
          <div className='flex flex-col gap-4'>
            {comments.map((item, index) => (
              <div key={index} className='relative card max-w-xl p-4 text-gray-700'>
                <div className='flex items-center gap-2 mb-2'>
                  <img src={assets.user_icon} alt="" className='w-6' />
                  <p className='font-medium'>{item.name}</p>
                </div>
                <p className='text-sm max-w-md ml-8'>{item.content}</p>
                <div className='absolute right-4 bottom-3 flex items-center gap-2 text-xs text-gray-500'>{Moment(item.createdAt).fromNow()}</div>
              </div>
            ))}
          </div>
        </div>

        <div className='max-w-3xl mx-auto'>
            <p className='font-semibold mb-4'>Add your comment</p>
            <form onSubmit={addComment} className='flex flex-col items-start gap-4 max-w-lg'>
              <input id="comment-name" name="name" onChange={(e) => setName(e.target.value)} value={name} type="text" placeholder='Name' required className='w-full p-2 border border-gray-300 bg-white text-gray-800 rounded outline-none'/>

              <textarea id="comment-content" name="content" onChange={(e) => setComment(e.target.value)} value={comment} placeholder='Comment' className='w-full p-2 border border-gray-300 bg-white text-gray-800 rounded outline-none h-48' required></textarea>
              <button type="submit" className='btn-gradient p-2 px-8 cursor-pointer'>Submit</button>
            </form>
        </div>

        <div className='my-24 max-w-3xl mx-auto'>
          <p className='font-semibold my-4'>Share this article on social media</p>
          <div className='flex flex-wrap gap-3'>
            <a
              className='inline-flex h-12 w-12 items-center justify-center rounded-full bg-white border border-primary/10 hover:bg-gray-50 transition'
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
              target='_blank'
              rel='noreferrer'
              aria-label='Share on Facebook'
              title='Share on Facebook'
            >
              <img src={assets.facebook_icon} alt='' className='h-6 w-6' />
            </a>

            <a
              className='inline-flex h-12 w-12 items-center justify-center rounded-full bg-white border border-primary/10 hover:bg-gray-50 transition'
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(data.title || 'WriteFlow')}`}
              target='_blank'
              rel='noreferrer'
              aria-label='Share on X (Twitter)'
              title='Share on X (Twitter)'
            >
              <img src={assets.twitter_icon} alt='' className='h-6 w-6' />
            </a>

            <button
              type='button'
              onClick={onCopyLink}
              className='inline-flex h-12 w-12 items-center justify-center rounded-full bg-white border border-primary/10 hover:bg-gray-50 transition cursor-pointer'
              aria-label='Copy link'
              title='Copy link'
            >
              <img src={assets.googleplus_icon} alt='' className='h-6 w-6' />
            </button>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  ) : <Loader/>
  
}

export default Blog
