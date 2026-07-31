import { createSlice } from '@reduxjs/toolkit';

const getInitial = () => {
  const saved = localStorage.getItem('theme');
  if (saved) return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const applyTheme = (theme) => {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  localStorage.setItem('theme', theme);
};

const initial = getInitial();
applyTheme(initial);

const themeSlice = createSlice({
  name: 'theme',
  initialState: { mode: initial },
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === 'dark' ? 'light' : 'dark';
      applyTheme(state.mode);
    },
    setTheme: (state, action) => {
      state.mode = action.payload;
      applyTheme(state.mode);
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
