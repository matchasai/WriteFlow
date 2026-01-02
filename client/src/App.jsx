import 'quill/dist/quill.snow.css'
import { Toaster } from 'react-hot-toast'
import { Route, Routes } from 'react-router-dom'
import Login from './components/admin/Login'
import RouteTransition from './components/RouteTransition'
import { useAppContext } from './context/AppContext'
import AddBlog from './pages/admin/AddBlog'
import Comments from './pages/admin/Comments'
import Dashboard from './pages/admin/Dashboard'
import EditBlog from './pages/admin/EditBlog'
import Layout from './pages/admin/Layout'
import ListBlog from './pages/admin/ListBlog'
import Blog from './pages/Blog'
import Home from './pages/Home'



const App = () => {

  const {token} = useAppContext();

  return (
    <div>
      <Toaster
        position="top-center"
        gutter={12}
        containerStyle={{
          top: 84,
          zIndex: 10000,
        }}
      />
      <Routes>
        <Route path='/' element={<RouteTransition><Home/></RouteTransition>} />    
        <Route path='/blog/:id' element={<RouteTransition><Blog/></RouteTransition>} />
        <Route path='/login' element={<RouteTransition><Login/></RouteTransition>} />    
        <Route path='/admin' element={token ? <RouteTransition><Layout/></RouteTransition> : <RouteTransition><Login/></RouteTransition>}>
          <Route index element={<RouteTransition><Dashboard/></RouteTransition>} />
          <Route path='addBlog' element={<RouteTransition><AddBlog/></RouteTransition>} />
          <Route path='edit-blog/:id' element={<RouteTransition><EditBlog/></RouteTransition>} />
          <Route path='blogs' element={<RouteTransition><ListBlog/></RouteTransition>} />
          <Route path='listBlog' element={<RouteTransition><ListBlog/></RouteTransition>} />
          <Route path='comments' element={<RouteTransition><Comments/></RouteTransition>} />
        </Route>
      </Routes>
    </div>
  )
}

export default App
