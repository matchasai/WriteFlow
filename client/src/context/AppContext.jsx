import axios from 'axios';
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';

const AppContext = createContext()

const debugLog = (...args) => {
    try {
        if (import.meta.env.DEV) console.debug(...args);
    } catch {
        // ignore
    }
};

export const AppProvider = ({children}) => {

    const navigate = useNavigate()

    const[token, setToken] = useState (null);
    const[blogs, setBlogs] = useState([]);
    const[input, setInput] = useState("");

    const ACCENT_MODES = ['aurora', 'bold', 'cool'];
    const [accentMode, setAccentMode] = useState(() => {
        const stored = localStorage.getItem('accentMode');
        if (stored && ACCENT_MODES.includes(stored)) return stored;

        // Backward compatibility: migrate old boolean preference.
        const legacyBold = localStorage.getItem('accentBold') === 'true';
        return legacyBold ? 'bold' : 'aurora';
    });
    const[isRateLimited, setIsRateLimited] = useState(false);
    const accentDidMountRef = useRef(false);
    const lastRateLimitToastAtRef = useRef(0);
    const rateLimitResetTimerRef = useRef(null);

    const fetchBlogs = async () => {
        try{
            const { data } = await axios.get('/api/blogs/all');
            if(data.success && data.blogs) {
                setBlogs(data.blogs);
            }
        }
        catch(error){
            // Handle rate limiting gracefully
            if (error.response?.status === 429) {
                const retryAfter = error.response?.data?.retryAfter || 60;
                console.warn(`Rate limited. Retry after ${retryAfter}s`);
                setIsRateLimited(true);
                setTimeout(() => setIsRateLimited(false), retryAfter * 1000);
                return;
            }
            // Silently fail if backend is not available during development
            debugLog('Blogs API unavailable:', error.code || 'Connection failed');
        }
    }

    // Check if token is still valid
    const isTokenValid = (token) => {
        if (!token) return false;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            // Check if token is expired
            return payload.exp * 1000 > Date.now();
        } catch {
            return false;
        }
    };

    // Clear token if expired or on browser close
    const clearExpiredToken = () => {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('tokenExpiry');
        localStorage.removeItem('sessionInitTime');
        sessionStorage.removeItem('isLoggedIn');
        setToken(null);
    };

    useEffect(() => {
        axios.defaults.headers.common['Authorization'] = token ? `Bearer ${token}` : '';
    }, [token]);

    useEffect(() => {
        fetchBlogs();
        
        // Session recovery logic: 12-hour token expiry + 30-min browser-close recovery
        const wasLoggedIn = sessionStorage.getItem('isLoggedIn');
        const token = localStorage.getItem('adminToken') || null;
        const tokenExpiry = localStorage.getItem('tokenExpiry');
        const sessionInitTime = localStorage.getItem('sessionInitTime');
        
        if(token){
            const now = Date.now();
            
            // Check if token is expired (12 hours from login)
            if (tokenExpiry && now > parseInt(tokenExpiry)) {
                debugLog('Token expired (12-hour limit)');
                clearExpiredToken();
                return;
            }
            
            // Validate token signature/expiry
            if (!isTokenValid(token)) {
                debugLog('Token is invalid');
                clearExpiredToken();
                return;
            }
            
            // If browser was closed (wasLoggedIn is missing)
            if (!wasLoggedIn) {
                // Allow 30-minute recovery window from session init time
                if (sessionInitTime) {
                    const sessionAge = now - parseInt(sessionInitTime);
                    const RECOVERY_WINDOW = 30 * 60 * 1000; // 30 minutes
                    
                    if (sessionAge > RECOVERY_WINDOW) {
                        debugLog('Browser recovery window expired (>30 mins)');
                        clearExpiredToken();
                        return;
                    }
                    // Restore session within recovery window
                    debugLog('Restoring session within 30-min recovery window');
                } else {
                    clearExpiredToken();
                    return;
                }
            }
            
            setToken(token);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            sessionStorage.setItem('isLoggedIn', 'true');
        }
        
        // Intercept API errors (401 session expiry, 429 rate limiting)
        const interceptor = axios.interceptors.response.use(
            response => response,
            error => {
                if (error.response?.status === 429) {
                    const retryAfter = Number(error.response?.data?.retryAfter) || 60;
                    setIsRateLimited(true);

                    if (rateLimitResetTimerRef.current) {
                        clearTimeout(rateLimitResetTimerRef.current);
                    }
                    rateLimitResetTimerRef.current = setTimeout(() => {
                        setIsRateLimited(false);
                        rateLimitResetTimerRef.current = null;
                    }, retryAfter * 1000);

                    const now = Date.now();
                    if (now - lastRateLimitToastAtRef.current > 2500) {
                        lastRateLimitToastAtRef.current = now;
                        toast.error(`Too many requests. Try again in ${retryAfter}s.`);
                    }

                    return Promise.reject(error);
                }

                if (error.response?.status === 401 && error.response?.data?.expired) {
                    clearExpiredToken();
                    navigate('/login');
                    toast.error('Session expired. Please log in again.');
                }
                return Promise.reject(error);
            }
        );
        
        return () => {
            axios.interceptors.response.eject(interceptor);
            if (rateLimitResetTimerRef.current) {
                clearTimeout(rateLimitResetTimerRef.current);
                rateLimitResetTimerRef.current = null;
            }
        };
    }, [navigate]);

    useEffect(() => {
        try {
            localStorage.setItem('accentMode', accentMode);
        } catch {
            // ignore storage failures (private mode, quota, etc.)
        }

        try {
            document.documentElement.setAttribute('data-accent', accentMode);
            // Keep legacy class selector working for existing CSS.
            document.documentElement.classList.toggle('accent-bold', accentMode === 'bold');
        } catch (err) {
            debugLog('Failed to apply accent mode on document:', err);
        }

        // Avoid firing toasts on initial boot
        if (accentDidMountRef.current) {
            try {
                const label = accentMode === 'aurora' ? 'Aurora' : accentMode === 'bold' ? 'Bold' : 'Cool';
                toast.success(`Accent: ${label}`, { duration: 1200 });
            } catch (err) {
                debugLog('toast error:', err);
            }
        } else {
            accentDidMountRef.current = true;
        }
    }, [accentMode]);

    const cycleAccent = () => {
        setAccentMode((prev) => {
            const idx = ACCENT_MODES.indexOf(prev);
            const nextIdx = idx === -1 ? 0 : (idx + 1) % ACCENT_MODES.length;
            return ACCENT_MODES[nextIdx];
        });
    };

    const value = {
        axios,
        navigate,
        token,
        setToken,
        blogs,
        setBlogs,
        input,
        setInput,
        accentMode,
        cycleAccent,
        isRateLimited,
    };

    return (
        <AppContext.Provider value={value}>
            { children }
        </AppContext.Provider>
    )
}
export const useAppContext = () =>{
    return useContext(AppContext);
}

export { AppContext };
export default AppProvider;