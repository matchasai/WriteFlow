import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useAppContext } from '../../context/AppContext'

const SubscribersPage = () => {
  const { axios } = useAppContext()

  const [subscribers, setSubscribers] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchSubscribers = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await axios.get('/api/admin/subscribers')
      if (data.success) {
        setSubscribers(data.subscribers || [])
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(
        `Error fetching subscribers: ${error?.response?.data?.message || error.message || 'Unknown error'}`
      )
    } finally {
      setLoading(false)
    }
  }, [axios])

  const deleteSubscriber = async (id) => {
    try {
      const { data } = await axios.delete(`/api/admin/subscribers/${id}`)
      if (data.success) {
        toast.success(data.message || 'Subscriber removed')
        fetchSubscribers()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(
        `Error removing subscriber: ${error?.response?.data?.message || error.message || 'Unknown error'}`
      )
    }
  }

  const confirmDeleteSubscriber = (id, email) => {
    toast(
      (t) => (
        <div className='card flex items-center gap-3'>
          <div className='flex-1 min-w-0'>
            <p className='text-gray-800 font-semibold'>Remove subscriber?</p>
            <p className='text-gray-500 text-sm truncate'>{email}</p>
          </div>
          <button
            type='button'
            className='chip chip-selected'
            onClick={async () => {
              toast.dismiss(t.id)
              await deleteSubscriber(id)
            }}
          >
            Yes
          </button>
          <button type='button' className='chip' onClick={() => toast.dismiss(t.id)}>
            Cancel
          </button>
        </div>
      ),
      { duration: 8000 }
    )
  }

  useEffect(() => {
    fetchSubscribers()
  }, [fetchSubscribers])

  return (
    <div className='flex-1 min-h-screen p-4 md:p-8 lg:p-10 bg-gradient-to-br from-blue-50/50 to-cyan-50/30 admin-surface overflow-y-auto fade-in'>
      <div className='w-full max-w-7xl mx-auto'>
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8'>
          <h1 className='text-3xl font-bold text-gray-800'>Subscribers</h1>
          <p className='text-sm text-gray-500'>Total: {subscribers.length}</p>
        </div>

        {loading ? (
          <div className='flex flex-col items-center justify-center py-16 card flex-1'>
            <div className='w-24 h-24 skeleton-rounded skeleton mb-4'></div>
            <div className='skeleton-text skeleton w-48 mb-2'></div>
            <div className='skeleton-text skeleton w-64'></div>
          </div>
        ) : subscribers.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-16 card flex-1'>
            <div className='text-center'>
              <p className='text-gray-400 text-lg mb-2'>No subscribers yet</p>
              <p className='text-gray-500 text-sm'>Newsletter subscribers will appear here</p>
            </div>
          </div>
        ) : (
          <div className='admin-card overflow-hidden flex flex-col slide-up'>
            <div className='overflow-x-auto'>
              <table className='w-full text-sm text-gray-600'>
                <thead className='bg-gray-50 border-b border-gray-200'>
                  <tr>
                    <th scope='col' className='px-4 py-4 text-left font-semibold text-gray-700'>#</th>
                    <th scope='col' className='px-4 py-4 text-left font-semibold text-gray-700'>Email</th>
                    <th scope='col' className='px-4 py-4 text-left font-semibold text-gray-700 max-sm:hidden'>Date</th>
                    <th scope='col' className='px-4 py-4 text-left font-semibold text-gray-700'>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((sub, index) => (
                    <tr key={sub._id} className='border-b border-gray-100 last:border-b-0'>
                      <td className='px-4 py-4 whitespace-nowrap text-gray-500'>{index + 1}</td>
                      <td className='px-4 py-4 whitespace-nowrap text-gray-800 font-medium'>{sub.email}</td>
                      <td className='px-4 py-4 whitespace-nowrap text-gray-500 max-sm:hidden'>
                        {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : '-'}
                      </td>
                      <td className='px-4 py-4 whitespace-nowrap'>
                        <button
                          type='button'
                          onClick={() => confirmDeleteSubscriber(sub._id, sub.email)}
                          className='chip'
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default SubscribersPage
