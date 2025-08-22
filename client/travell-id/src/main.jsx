import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { Provider, useDispatch } from 'react-redux'
import store from './store'
import { bootstrapAuth } from './store/slices/authSlice'

function Bootstrapper({ children }){
  const dispatch = useDispatch();
  useEffect(()=>{ dispatch(bootstrapAuth()); },[dispatch]);
  return children;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <Bootstrapper>
        <App />
      </Bootstrapper>
    </Provider>
  </StrictMode>,
)
