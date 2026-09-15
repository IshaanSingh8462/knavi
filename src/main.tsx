import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import App from './App.tsx';
import BlogListPage from './components/blog/BlogListPage.tsx';
import BlogPostPage from './components/blog/BlogPostPage.tsx';
import './index.css';

// The blog gets real routes (/blog, /blog/:slug) so posts are individually
// indexable and shareable — see BLOG_SETUP_README.md. Everything else
// (auth, the app itself) is unchanged and still lives entirely inside App,
// which now renders on the catch-all route.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/blog" element={<BlogListPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        <Route path="*" element={<App />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
