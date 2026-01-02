import toast from 'react-hot-toast';
import { useAppContext } from '../../context/AppContext';

const CommentTableItem = ({comment, fetchComments}) => {
  const BlogDate = new Date(comment.createdAt);
  const {blog, _id} = comment;
  const blogTitle = blog?.title || '-';
  const {axios} = useAppContext();

    const approveComment = async () => {
      try {
        const {data} = await axios.patch(`/api/admin/comments/approve-comment/${_id}`);
        if(data.success){
          toast.success("Comment approved successfully");
          await fetchComments();
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error(`Error approving comment: ${error?.response?.data?.message || error.message || 'Unknown error'}`);
      }
    }

    const deleteComment = async () => {
        try {
            const isConfirmed = window.confirm("Are you sure you want to delete this comment?");
            if (!isConfirmed) {
                toast.error("Deletion cancelled");
                return;
            }
            const {data} = await axios.delete(`/api/admin/comments/delete-comment/${_id}`);
            if(data.success){
                toast.success("Comment deleted successfully");
                await fetchComments();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(`Error deleting comment: ${error?.response?.data?.message || error.message || 'Unknown error'}`);
        }
    }


  return (
    <tr className='border-y border-gray-300'>
        <td className='px-6 py-4'>
            <b className='font-medium text-gray-600'>Blog</b> : { blogTitle }
            <br />
            <br />
            <b className='font-medium text-gray-600'>Name</b> : { comment.name }
            <br />
            <b className='font-medium text-gray-600'>Comment</b> : { comment.content }
        </td>
        <td className='px-6 py-4 max-sm:hidden'>
            { BlogDate.toLocaleDateString() }
        </td>
        <td className='px-6 py-4'>
            <div className='flex flex-wrap items-center gap-2'>
                {!comment.isApproved ? (
                  <button aria-label={`Approve comment by ${comment.name}`} title="Approve" onClick={approveComment} className='admin-action-btn admin-action-btn-success'>
                    Approve
                  </button>
                ) : (
                  <p className='text-xs border border-green-600 bg-green-100 text-green-600 rounded-full px-3 py-1'>Approved</p>
                )}

                <button aria-label={`Delete comment by ${comment.name}`} title="Delete comment" onClick={deleteComment} className='admin-action-btn admin-action-btn-danger'>
                  Delete
                </button>
            </div>
        </td>
    </tr>
  )
}

export default CommentTableItem
