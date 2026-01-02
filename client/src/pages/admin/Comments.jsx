import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import CommentTableItem from '../../components/admin/CommentTableItem'
import { useAppContext } from '../../context/AppContext'

const Comments = () => {
  const [comments, setComments] = useState([])
  const[filter, setFilter] = useState("Not Approved")
  const {axios} = useAppContext();
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get('/api/admin/comments');
      if(data.success){
        setComments(data.comments);
      }else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(`Error fetching comments: ${error?.response?.data?.message || error.message || 'Unknown error'}`);
    } finally { setLoading(false); }
  }, [axios]);

  

  useEffect(() => {
    fetchComments();
  }, [fetchComments])

  return (
    <div className='flex-1 min-h-screen p-4 md:p-8 lg:p-10 bg-gradient-to-br from-blue-50/50 to-cyan-50/30 admin-surface overflow-y-auto fade-in'>
      <div className='w-full max-w-7xl mx-auto'>
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8'>
          <h1 className='text-3xl font-bold text-gray-800'>Comments</h1>
          <div className='flex gap-2 w-full sm:w-auto'>
            <button onClick={()=> setFilter('Approved')} className={`flex-1 sm:flex-none ${filter === 'Approved' ? 'chip chip-selected' : 'chip'}`}>Approved</button>
            <button onClick={()=> setFilter('Not Approved')} className={`flex-1 sm:flex-none ${filter === 'Not Approved' ? 'chip chip-selected' : 'chip'}`}>Not Approved</button>
          </div>
        </div>
        
        {loading ? (
          <div className='flex flex-col items-center justify-center py-16 card flex-1'>
            <div className='w-24 h-24 skeleton-rounded skeleton mb-4'></div>
            <div className='skeleton-text skeleton w-48 mb-2'></div>
            <div className='skeleton-text skeleton w-64'></div>
          </div>
        ) : comments.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-16 card flex-1'>
            <div className='text-center'>
              <p className='text-gray-400 text-lg mb-2'>No comments yet</p>
              <p className='text-gray-500 text-sm'>Comments from readers will appear here</p>
            </div>
          </div>
        ) : comments.filter((comment)=>{
          if(filter === "Approved") return comment.isApproved === true;
          else return comment.isApproved === false;
        }).length === 0 ? (
          <div className='flex flex-col items-center justify-center py-16 card flex-1'>
            <div className='text-center'>
              <p className='text-gray-400 text-lg mb-2'>No {filter.toLowerCase()} comments</p>
              <p className='text-gray-500 text-sm'>Try switching the filter</p>
            </div>
          </div>
        ) : (
          <div className='admin-card overflow-hidden flex flex-col slide-up'>
            <div className='overflow-x-auto'>
              <table className='w-full text-sm text-gray-600'>
                <thead className='bg-gray-50 border-b border-gray-200'>
                  <tr>
                    <th scope='col' className='px-4 py-4 text-left font-semibold text-gray-700'>Blog Title & Comment</th>
                    <th scope='col' className='px-4 py-4 text-left font-semibold text-gray-700 max-sm:hidden'>Date</th>
                    <th scope='col' className='px-4 py-4 text-left font-semibold text-gray-700'>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {comments.filter((comment)=>{
                    if(filter === "Approved") return comment.isApproved === true;
                    else return comment.isApproved === false;
                  }).map((comment, index) => <CommentTableItem key={comment._id}
                  comment={comment} index={index + 1} fetchComments={fetchComments} />)}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Comments
