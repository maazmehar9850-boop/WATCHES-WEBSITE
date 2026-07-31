import { StrictMode, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider, useDispatch, useSelector } from 'react-redux';
import store from './store';
import { logout } from './store/authSlice';
import App from './App.jsx';
import './index.css';

function Bootstrap({ children }) {
  const dispatch = useDispatch();
  const token = useSelector((s) => s.auth.token);
  const user = useSelector((s) => s.auth.user);

  useEffect(() => {
    if (token && user && user.role !== 'admin') {
      dispatch(logout());
    }
  }, [token, user, dispatch]);

  return children;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <Bootstrap>
        <App />
      </Bootstrap>
    </Provider>
  </StrictMode>
);
