import { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../context/AppContext';

const BlogTableItem = ({blog, fetchBlogs, index}) => {
    const {title, createdAt} = blog;
    const BlogDate = new Date(createdAt);
    const {axios} = useAppContext();
  const navigate = useNavigate();
    const [confirmingDelete, setConfirmingDelete] = useState(false);

    const deleteBlog = async () => {
      try {
        const {data} = await axios.delete(`/api/blogs/${blog._id}`);
        if(data.success){
          toast.success("Blog deleted successfully");
          await fetchBlogs();
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error(`Error deleting blog: ${error?.response?.data?.message || error.message || 'Unknown error'}`);
      }
    }

    const togglePublish = async () => {
      try {
        const {data} = await axios.post(`/api/blogs/toggle-publish/${blog._id}`);
        if(data.success){
          toast.success("Blog publish status updated");
          await fetchBlogs();
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error(`Error updating publish status: ${error?.response?.data?.message || error.message || 'Unknown error'}`);
      }
    }


  return (
    <tr className='border-y border-gray-300'>
        <th className='px-2 py-4'>{ index }</th>
        <td className='px-2 py-4'>{ title }</td>
        <td className='px-2 py-4 max-sm:hidden'>{ BlogDate.toLocaleDateString() }</td>
        <td className='px-2 py-4 max-sm:hidden'>
            <p className={`${blog.isPublished ? 'text-green-600' : 'text-red-600'}`}>{ blog.isPublished ? 'Published' : 'Unpublished' }</p>
        </td>
        <td className='px-2 py-4'>
          <div className='flex flex-wrap gap-2 items-center'>
            <button
              aria-label={`Edit ${title}`}
              title={`Edit ${title}`}
              onClick={() => navigate(`/admin/edit-blog/${blog._id}`)}
              className='admin-action-btn admin-action-btn-primary'
            >
              Edit
            </button>

            <button
              aria-pressed={blog.isPublished}
              aria-label={blog.isPublished ? 'Unpublish' : 'Publish'}
              title={blog.isPublished ? 'Unpublish' : 'Publish'}
              onClick={togglePublish}
              className={`admin-action-btn ${blog.isPublished ? 'admin-action-btn-muted' : 'admin-action-btn-success'}`}
            >
              {blog.isPublished ? 'Unpublish' : 'Publish'}
            </button>

            {!confirmingDelete ? (
              <button
                aria-label={`Delete ${title}`}
                title='Delete'
                onClick={() => {
                  setConfirmingDelete(true);
                  toast.loading('Confirm deletion…', { id: `del-${blog._id}`, duration: 1500 });
                }}
                className='admin-action-btn admin-action-btn-danger'
              >
                Delete
              </button>
            ) : (
              <div className='flex flex-wrap items-center gap-2'>
                <button onClick={deleteBlog} className='admin-action-btn admin-action-btn-danger'>Confirm</button>
                <button onClick={() => { setConfirmingDelete(false); toast.success('Deletion cancelled'); }} className='admin-action-btn'>Cancel</button>
              </div>
            )}
          </div>
        </td>
    </tr>
  )
}

export default BlogTableItem