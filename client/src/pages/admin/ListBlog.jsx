import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import BlogTableItem from '../../components/admin/BlogTableItem';
import { useAppContext } from '../../context/AppContext';

const ListBlog = () => {
  const [blogs, setBlogs] = useState([]);
  const { axios } = useAppContext();

  const [loading, setLoading] = useState(true);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/admin/blogs');
      if (data.success) {
        setBlogs(data.blogs);
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error('Failed to fetch blogs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className='flex-1 min-h-screen p-4 md:p-8 lg:p-10 bg-gradient-to-br from-blue-50/50 to-cyan-50/30 admin-surface overflow-y-auto fade-in'>
      <div className='w-full max-w-7xl mx-auto'>
        <h1 className='text-3xl font-bold mb-8 text-gray-800'>Blog List</h1>

        {loading ? (
          <div className='flex flex-col items-center justify-center py-16 card flex-1'>
            <div className='w-24 h-24 skeleton-rounded skeleton mb-4'></div>
            <div className='skeleton-text skeleton w-48 mb-2'></div>
            <div className='skeleton-text skeleton w-64'></div>
          </div>
        ) : blogs.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-16 card flex-1'>
            <div className='text-center'>
              <p className='text-gray-400 text-lg mb-2'>No blogs found</p>
              <p className='text-gray-500 text-sm'>Start creating your first blog post!</p>
            </div>
          </div>
        ) : (
          <div className='admin-card overflow-hidden flex flex-col slide-up'>
            <div className='overflow-x-auto'>
              <table className='w-full text-sm text-gray-600'>
                <thead className='bg-gray-50 border-b border-gray-200'>
                  <tr>
                    <th scope='col' className='px-4 py-4 text-left font-semibold text-gray-700'>#</th>
                    <th scope='col' className='px-4 py-4 text-left font-semibold text-gray-700'>Blog Title</th>
                    <th scope='col' className='px-4 py-4 text-left font-semibold text-gray-700 max-sm:hidden'>Date</th>
                    <th scope='col' className='px-4 py-4 text-left font-semibold text-gray-700 max-sm:hidden'>Status</th>
                    <th scope='col' className='px-4 py-4 text-left font-semibold text-gray-700'>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {blogs.map((blog, index) => (
                    <BlogTableItem key={blog._id} blog={blog} fetchBlogs={fetchBlogs} index={index + 1} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListBlog;
 