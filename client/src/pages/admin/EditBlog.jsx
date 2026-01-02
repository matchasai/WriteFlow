import { parse } from 'marked';
import Quill from 'quill';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { assets, blogCategories } from '../../assets/assets';
import { useAppContext } from '../../context/AppContext';

const EditBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { axios } = useAppContext();
  const [isUpdating, setIsUpdating] = useState(false);
  const [loading, setLoading] = useState(false);
  const [seoLoading, setSeoLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const [fetchingBlog, setFetchingBlog] = useState(true);

  const editorRef = useRef(null);
  const quillRef = useRef(null);

  const [image, setImage] = useState(false);
  const [existingImage, setExistingImage] = useState('');
  const [title, setTitle] = useState('');
  const [subTitle, setSubTitle] = useState('');
  const [category, setCategory] = useState('Startup');
  const [isPublished, setIsPublished] = useState(false);
  const [metaDescription, setMetaDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [initialDescription, setInitialDescription] = useState('');

  // Fetch existing blog data
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const { data } = await axios.get(`/api/blogs/${id}`);
        if (data.success) {
          const blog = data.blog;
          setTitle(blog.title);
          setSubTitle(blog.subTitle || '');
          setCategory(blog.category);
          setIsPublished(blog.isPublished);
          setExistingImage(blog.image);
          setMetaDescription(blog.metaDescription || '');
          setTagsInput(Array.isArray(blog.tags) ? blog.tags.join(', ') : '');
          setInitialDescription(blog.description || '');
          
          // Set quill content after it's initialized
          if (quillRef.current) {
            quillRef.current.clipboard.dangerouslyPasteHTML(blog.description || '', 'silent');
          }
        } else {
          toast.error('Blog not found');
          navigate('/admin/blogs');
        }
      } catch (error) {
        toast.error(`Error fetching blog: ${error?.response?.data?.message || error.message}`);
        navigate('/admin/blogs');
      } finally {
        setFetchingBlog(false);
      }
    };

    if (id) {
      fetchBlog();
    }
  }, [id, axios, navigate]);

  // Initialize Quill editor
  useEffect(() => {
    // The editor DOM isn't mounted while `fetchingBlog` is true (component returns early).
    // Initialize Quill only after the form is rendered.
    if (fetchingBlog) return;

    if (!quillRef.current && editorRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: 'snow',
        placeholder: 'Write blog content here...',
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link', 'image'],
            ['clean']
          ]
        }
      });

      if (initialDescription) {
        quillRef.current.clipboard.dangerouslyPasteHTML(initialDescription, 'silent');
      }
    }
  }, [fetchingBlog, initialDescription]);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setIsUpdating(true);

    try {
      if (!quillRef.current?.root) {
        toast.error('Editor is not ready yet. Please wait a moment and try again.');
        return;
      }

      const tags = tagsInput
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      const blog = {
        title,
        subTitle,
        description: quillRef.current.root.innerHTML,
        category,
        isPublished,
        metaDescription,
        tags,
        imageUrl: existingImage || undefined
      };

      const formData = new FormData();
      formData.append('blog', JSON.stringify(blog));
      
      // Only append image if a new one is selected
      if (image) {
        formData.append('image', image);
      }

      const { data } = await axios.put(`/api/blogs/update/${id}`, formData);
      
      if (data.success) {
        toast.success('Blog updated successfully');
        navigate('/admin/blogs');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(`Error updating blog: ${error?.response?.data?.message || error.message || 'Unknown error'}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const generateImage = async () => {
    if (!title.trim()) {
      return toast.error('Please enter a title to generate an image');
    }
    try {
      setImageLoading(true);
      const { data } = await axios.post('/api/blogs/generate-image', { title, category });
      if (data.success) {
        setExistingImage(data.imageUrl);
        setImage(false);
        toast.success('Image generated');
      } else {
        toast.error(data.message || 'Failed to generate image');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to generate image');
    } finally {
      setImageLoading(false);
    }
  }

  const generateContent = async () => {
    if (!title.trim()) {
      return toast.error('Please enter title to generate content');
    }

    if (!quillRef.current?.clipboard) {
      return toast.error('Editor is not ready yet.');
    }
    
    try {
      setLoading(true);
      const prompt = `Write a complete, high-quality blog post in MARKDOWN for WriteFlow.

    WriteFlow style: tech + startups + productivity. Audience: developers, builders, and early-stage founders.

Topic/title: ${title}

Requirements:
- Length: ~1200–1800 words (unless the topic is extremely narrow).
- Structure: strong hook, clear sections with H2/H3, short paragraphs, bullets where helpful.
- Include: at least 2 real-world examples or mini case studies.
- Include: a short "Key takeaways" list.
- Include: a short FAQ (3–5 Q&A).
- Include: an "Image ideas" section with 3–5 tech-relevant suggestions (alt text + caption + where to place). Prefer diagrams, simple charts, workflow visuals, UI mockups, code snippets-as-images, or annotated screenshots. Do NOT use external image URLs.
- Tone: modern, friendly, practical; avoid fluff.

Return ONLY markdown.`;
      const { data } = await axios.post('/api/blogs/generate-content', { prompt });
      
      if (data.success) {
        const html = parse(data.content);
        quillRef.current.clipboard.dangerouslyPasteHTML(html, 'silent');
        toast.success('Content generated successfully');
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(`Error generating content: ${error?.response?.data?.message || error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const generateSEO = async () => {
    if(!title.trim() && !quillRef.current?.root?.innerHTML){
      return toast.error('Add a title or content first');
    }
    try{
      setSeoLoading(true);
      const payload = { title, content: quillRef.current?.root?.innerHTML || '' };
      const { data } = await axios.post('/api/blogs/generate-seo', payload);
      if (data.success){
        setMetaDescription(data.metaDescription);
        setTagsInput(data.tags.join(', '));
        toast.success('SEO fields generated');
      } else {
        toast.error(data.message || 'Failed to generate SEO');
      }
    }catch(error){
      toast.error(error?.response?.data?.message || 'Failed to generate SEO');
    }finally{
      setSeoLoading(false);
    }
  }

  if (fetchingBlog) {
    return (
      <div className='flex-1 min-h-screen bg-gradient-to-br from-blue-50/50 to-cyan-50/30 flex items-center justify-center p-4'>
        <div className='text-center'>
          <div className='w-12 h-12 mx-auto mb-4 border-4 border-primary border-t-transparent rounded-full animate-spin'></div>
          <p className='text-gray-600 text-lg'>Loading blog...</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmitHandler} className='flex-1 min-h-0 w-full bg-gradient-to-br from-blue-50/50 to-cyan-50/30 flex flex-col p-4 overflow-hidden fade-in'>
      <div className='flex-1 min-h-0 min-w-0 w-full bg-white shadow-2xl rounded-lg p-8 md:p-12 flex flex-col overflow-y-auto slide-up'>
        <h2 className='text-3xl font-bold mb-8 text-gray-800'>Edit Blog</h2>
        
        {/* Upload thumbnail */}
        <div className='mb-8'>
          <label htmlFor="image" className='block'>
            <p className='text-lg font-semibold text-gray-700 mb-3'>Upload thumbnail</p>
            <img 
              src={image ? URL.createObjectURL(image) : existingImage || assets.upload_area} 
              alt="Blog thumbnail" 
              className='h-40 w-40 rounded-lg cursor-pointer hover:opacity-80 transition object-cover border-2 border-dashed border-gray-300'
            />
            <input 
              onChange={(e) => setImage(e.target.files[0])} 
              type="file" 
              id='image' 
              name="image"
              hidden 
              accept="image/*"
            />
          </label>
          <p className='text-xs text-gray-500 mt-2'>Leave empty to keep existing image</p>

          <div className='mt-3 flex items-center justify-end gap-3'>
            <button
              type='button'
              disabled={imageLoading}
              onClick={generateImage}
              className='text-sm px-4 py-2 rounded btn-gradient disabled:opacity-50 cursor-pointer transition'
            >
              {imageLoading ? 'Generating…' : 'Generate Image With AI'}
            </button>
          </div>
        </div>

        {/* Blog title */}
        <div className='mb-6'>
          <label htmlFor="blog-title" className='block'>
            <p className='text-lg font-semibold text-gray-700 mb-2'>Blog title</p>
            <input 
              id="blog-title"
              name="title"
              type="text" 
              placeholder='Enter blog title' 
              required 
              className='w-full p-3 border border-gray-300 bg-white text-gray-800 outline-none rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/10' 
              onChange={e=> setTitle(e.target.value)} 
              value={title} 
            />
          </label>
        </div>

        {/* Blog subtitle */}
        <div className='mb-6'>
          <label htmlFor="blog-subtitle" className='block'>
            <p className='text-lg font-semibold text-gray-700 mb-2'>Blog subtitle</p>
            <input 
              id="blog-subtitle"
              name="subTitle"
              type="text" 
              placeholder='Enter blog subtitle' 
              required 
              className='w-full p-3 border border-gray-300 bg-white text-gray-800 outline-none rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/10' 
              onChange={e => setSubTitle(e.target.value)} 
              value={subTitle} 
            />
          </label>
        </div>

        {/* Blog Description */}
        <div className='mb-6'>
          <p className='text-lg font-semibold text-gray-700 mb-3'>Blog Description</p>

          <div className='blog-editor w-full min-h-96 max-h-96 relative overflow-hidden flex flex-col'>
            <div ref={editorRef} className='flex-1 min-h-0 overflow-y-auto'></div>
            {loading && (
              <div className='absolute right-0 top-0 bottom-0 left-0 flex items-center justify-center bg-black/10 pointer-events-none'>
                <div className="w-8 h-8 rounded-full border-2 border-t-white animate-spin pointer-events-auto"></div>
              </div>
            )}
          </div>

          <div className='mt-3 flex items-center justify-end'>
            <button
              disabled={loading}
              type='button'
              onClick={generateContent}
              className='text-sm px-4 py-2 rounded btn-gradient disabled:opacity-50 cursor-pointer transition'
            >
              {loading ? 'Generating...' : 'Generate With AI'}
            </button>
          </div>
        </div>

        {/* Meta Description */}
        <div className='mb-6'>
          <label htmlFor="meta-description" className='block mb-3'>
            <p className='text-lg font-semibold text-gray-700'>Meta Description <span className='text-xs text-gray-400'>(~160 chars)</span></p>
          </label>
          <textarea 
            id="meta-description"
            name="metaDescription"
            placeholder='Short SEO description for search results'
            className='w-full h-24 resize-none overflow-y-auto p-3 border border-gray-300 bg-white text-gray-800 outline-none rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/10'
            rows={3}
            maxLength={200}
            value={metaDescription}
            onChange={e => setMetaDescription(e.target.value)}
          />
          <div className='text-right text-xs text-gray-400 mt-1'>{metaDescription.length}/200</div>

          <div className='mt-3 flex items-center justify-end'>
            <button 
              type='button' 
              disabled={seoLoading} 
              onClick={generateSEO} 
              className='text-sm px-4 py-2 rounded btn-gradient disabled:opacity-50 cursor-pointer transition'
            >
              {seoLoading ? 'Generating…' : (metaDescription || tagsInput ? 'Regenerate' : 'Generate SEO')}
            </button>
          </div>
        </div>

        {/* Tags */}
        <div className='mb-6'>
          <label htmlFor="tags-input" className='block'>
            <p className='text-lg font-semibold text-gray-700 mb-2'>Tags <span className='text-xs text-gray-400'>(comma-separated)</span></p>
            <input
              id="tags-input"
              name="tags"
              type='text'
              placeholder='e.g. ai, productivity, startups'
              className='w-full p-3 border border-gray-300 bg-white text-gray-800 outline-none rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/10'
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  if (tagsInput.trim() && !tagsInput.trim().endsWith(',')) {
                    setTagsInput(tagsInput.trim() + ', ');
                  }
                }
              }}
            />
          </label>

          {/* Tag chips */}
          <div className='mt-3 flex flex-wrap gap-2'>
            {tagsInput.split(',').map(t => t.trim()).filter(Boolean).map((t, idx) => (
              <span key={idx} className='px-3 py-1 text-sm rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center gap-2'>
                {t}
                <button type='button' className='text-primary/70 hover:text-primary font-bold' onClick={() => {
                  const arr = tagsInput.split(',').map(x => x.trim()).filter(Boolean).filter(x => x !== t);
                  setTagsInput(arr.join(', '));
                }}>✕</button>
              </span>
            ))}
          </div>
        </div>

        {/* Category */}
        <div className='mb-6'>
          <label htmlFor="category" className='block'>
            <p className='text-lg font-semibold text-gray-700 mb-2'>Blog category</p>
            <select 
              id="category"
              onChange={e => setCategory(e.target.value)} 
              value={category}
              name="category" 
              className='w-full p-3 border border-gray-300 text-gray-700 bg-white outline-none rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/10 cursor-pointer'
            >
              {blogCategories.map((item, index) => (
                <option key={index} value={item}>{item}</option>
              ))}
            </select>
          </label>
        </div>

        {/* Publish Now */}
        <div className='mb-8 flex items-center gap-3'>
          <label htmlFor="isPublished" className='flex items-center gap-3 cursor-pointer'>
            <input 
              id="isPublished"
              name="isPublished"
              type="checkbox" 
              checked={isPublished} 
              onChange={e => setIsPublished(e.target.checked)} 
              className='w-5 h-5 cursor-pointer' 
            />
            <p className='text-lg font-semibold text-gray-700'>Publish Now</p>
          </label>
        </div>

        {/* Action Buttons */}
        <div className='flex flex-col sm:flex-row gap-4'>
          <button 
            disabled={isUpdating} 
            type="submit" 
            className='flex-1 sm:flex-none sm:w-48 h-12 btn-gradient cursor-pointer text-white text-lg font-semibold disabled:opacity-60 transition rounded-lg'
          >
            {isUpdating ? 'Updating...' : 'Update Blog'}
          </button>
          <button 
            type="button" 
            onClick={() => navigate('/admin/listBlog')}
            className='flex-1 sm:flex-none sm:w-48 h-12 bg-gray-200 text-gray-700 rounded-lg cursor-pointer text-lg font-semibold hover:bg-gray-300 transition'
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
};

export default EditBlog;
