
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAppContext } from '../context/AppContext';

const Newsletter = () => {
  const { axios } = useAppContext();
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubscribing(true);
    
    try {
      const { data } = await axios.post('/api/newsletter/subscribe', { email });
      if (data?.success) {
        toast.success(data.message || 'Successfully subscribed to newsletter!');
        setEmail('');
      } else {
        toast.error(data?.message || 'Failed to subscribe. Please try again.');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to subscribe. Please try again.');
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-4 my-32 px-4">
      <h1 className='md:text-4xl text-2xl font-semibold'>Never Miss a Blog!</h1>
      <p className="md:text-lg text-gray-500/70 max-w-2xl">Subscribe to get the latest blog, new tech, exclusive news, and updates directly to your inbox.</p>

      <form onSubmit={handleSubmit} className="newsletter-form flex items-stretch gap-0 max-w-2xl w-full mt-6">
        <input
          className="flex-1 min-w-0 px-4 py-3 border border-gray-200 text-gray-600 rounded-l-full outline-none focus:border-indigo-400 focus:shadow-[0_8px_20px_rgba(99,102,241,0.08)]"
          type="email"
          id="newsletter-email"
          name="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isSubscribing}
          aria-label="Email address"
          required
        />

        <button
          type="submit"
          disabled={isSubscribing}
          className="inline-flex items-center justify-center px-6 py-3 btn-gradient rounded-r-full disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubscribing ? 'Subscribing...' : 'Subscribe'}
        </button>
      </form>
    </div>
  );
}

export default Newsletter
