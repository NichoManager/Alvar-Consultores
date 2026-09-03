import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { SiteLayout } from '../components/layout/SiteLayout';
import { AboutPage } from '../pages/AboutPage';
import { BlogPage } from '../pages/BlogPage';
import { BlogPostPage } from '../pages/BlogPostPage';
import { ContactPage } from '../pages/ContactPage';
import { HomePage } from '../pages/HomePage';
import { LegalPage } from '../pages/LegalPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { PropertiesPage } from '../pages/PropertiesPage';
import { PropertyDetailPage } from '../pages/PropertyDetailPage';
import { ReviewsPage } from '../pages/ReviewsPage';
import { ServicesPage } from '../pages/ServicesPage';

const router = createBrowserRouter([
  {
    element: <SiteLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/inmuebles', element: <PropertiesPage /> },
      { path: '/inmuebles/:slug', element: <PropertyDetailPage /> },
      { path: '/servicios', element: <ServicesPage /> },
      { path: '/nosotros', element: <AboutPage /> },
      { path: '/opiniones', element: <ReviewsPage /> },
      { path: '/contacto', element: <ContactPage /> },
      { path: '/blog', element: <BlogPage /> },
      { path: '/blog/:slug', element: <BlogPostPage /> },
      { path: '/aviso-legal', element: <LegalPage kind="legal" /> },
      { path: '/privacidad', element: <LegalPage kind="privacy" /> },
      { path: '/cookies', element: <LegalPage kind="cookies" /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

export function AppRoutes() {
  return <RouterProvider router={router} />;
}
