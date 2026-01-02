import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { assets } from '../../assets/assets'
import BlogTableItem from '../../components/admin/BlogTableItem'
import { useAppContext } from '../../context/AppContext'
const Dashboard = () => {

  const{axios} = useAppContext();


  const [dashboardData, setDashboardData] = useState({
    blogs: 0,
    comments: 0,
    drafts: 0,
    recentBlogs: []
  })

  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const {data} = await axios.get('/api/admin/dashboard');
      if(data.success){
        setDashboardData(data.dashboardData);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(`Error fetching dashboard data: ${error?.response?.data?.message || error.message || 'Unknown error'}`);
    } finally { setLoading(false); }
  }, [axios]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData])

  const rows = loading
    ? [...Array(5)].map((_, i) => (
        <tr key={i}>
          <td className='px-2 py-4 xl:px-6'><div className='skeleton-box skeleton w-8'></div></td>
          <td className='px-2 py-4'><div className='skeleton-text skeleton w-40'></div></td>
          <td className='px-2 py-4 max-sm:hidden'><div className='skeleton-text skeleton w-24'></div></td>
          <td className='px-2 py-4 max-sm:hidden'><div className='skeleton-text skeleton w-20'></div></td>
          <td className='px-2 py-4'><div className='skeleton-text skeleton w-28'></div></td>
        </tr>
      ))
    : dashboardData.recentBlogs.map((blog, index) => (
        <BlogTableItem key={blog._id} blog={blog} fetchBlogs={fetchDashboardData} index={index + 1} />
      ));

  return (
    <div className='flex-1 min-h-screen p-4 md:p-8 lg:p-10 bg-gradient-to-br from-blue-50/50 to-cyan-50/30 admin-surface overflow-y-auto fade-in'>
      <div className='w-full max-w-7xl mx-auto'>
        {/* Stats Cards */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8'>
          {loading ? (
            <>
              <div className='card p-6 skeleton-rounded skeleton'></div>
              <div className='card p-6 skeleton-rounded skeleton'></div>
              <div className='card p-6 skeleton-rounded skeleton'></div>
            </>
          ) : (
            <>
              <div className='flex items-center gap-4 card p-6 cursor-pointer hover:shadow-md transition-shadow'>
                <img src={assets.dashboard_icon_1} alt="Blogs icon" className='w-12 h-12' />
                <div>
                  <p className='text-2xl font-bold text-gray-700'>{dashboardData.blogs}</p>
                  <p className='text-gray-500 font-medium'>Blogs</p>
                </div>
              </div>

              <div className='flex items-center gap-4 card p-6 cursor-pointer hover:shadow-md transition-shadow'>
                <img src={assets.dashboard_icon_2} alt="Comments icon" className='w-12 h-12' />
                <div>
                  <p className='text-2xl font-bold text-gray-700'>{dashboardData.comments}</p>
                  <p className='text-gray-500 font-medium'>Comments</p>
                </div>
              </div>

              <div className='flex items-center gap-4 card p-6 cursor-pointer hover:shadow-md transition-shadow'>
                <img src={assets.dashboard_icon_3} alt="Drafts icon" className='w-12 h-12' />
                <div>
                  <p className='text-2xl font-bold text-gray-700'>{dashboardData.drafts}</p>
                  <p className='text-gray-500 font-medium'>Drafts</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Latest Blogs Section */}
        <div className='w-full'>
          <div className='flex items-center gap-3 mb-6'>
            <img src={assets.dashboard_icon_4} alt="Latest Blogs icon" className='w-6 h-6' />
            <h2 className='text-xl font-bold text-gray-700'>Latest Blogs</h2>
          </div>
          
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
                  {rows}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
