import { useEffect } from 'react';

// This app has no SSR, so every route shares one static index.html. That's
// fine for the app itself, but a blog needs per-page <title>, meta
// description, canonical URL, Open Graph/Twitter tags, and article JSON-LD
// so each post is indexed and shared with its own preview instead of the
// homepage's. This component patches document.head on mount/update rather
// than pulling in react-helmet-async, since it's the only place in the app
// that needs it.

interface SEOHeadProps {
  title: string;
  description: string;
  /** Path only, e.g. '/blog/why-i-built-strail' */
  path: string;
  image?: string;
  type?: 'website' | 'article';
  article?: {
    publishedTime: string; // YYYY-MM-DD
    author: string;
  };
}

const SITE_URL = 'https://getstrail.me';
const SITE_NAME = 'Strail';

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export default function SEOHead({ title, description, path, image, type = 'website', article }: SEOHeadProps) {
  useEffect(() => {
    const fullTitle = `${title} | ${SITE_NAME}`;
    document.title = fullTitle;

    setMeta('name', 'description', description);
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:url', `${SITE_URL}${path}`);
    setMeta('property', 'og:site_name', SITE_NAME);
    setMeta('name', 'twitter:card', image ? 'summary_large_image' : 'summary');
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', description);
    if (image) {
      const absoluteImage = image.startsWith('http') ? image : `${SITE_URL}${image}`;
      setMeta('property', 'og:image', absoluteImage);
      setMeta('name', 'twitter:image', absoluteImage);
    }

    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', `${SITE_URL}${path}`);

    let ld = document.getElementById('seo-jsonld') as HTMLScriptElement | null;
    if (article) {
      const data = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: title,
        description,
        datePublished: article.publishedTime,
        author: { '@type': 'Person', name: article.author },
        image: image ? [image.startsWith('http') ? image : `${SITE_URL}${image}`] : undefined,
        mainEntityOfPage: `${SITE_URL}${path}`,
        publisher: { '@type': 'Organization', name: SITE_NAME },
      };
      if (!ld) {
        ld = document.createElement('script');
        ld.id = 'seo-jsonld';
        ld.type = 'application/ld+json';
        document.head.appendChild(ld);
      }
      ld.textContent = JSON.stringify(data);
    } else if (ld) {
      ld.remove();
    }
  }, [title, description, path, image, type, article?.publishedTime, article?.author]);

  return null;
}
