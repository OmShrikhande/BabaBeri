import { useEffect } from 'react';

/**
 * Custom hook to dynamically manage SEO title, meta description, and canonical links for SPAs.
 */
export function usePageSEO({ title, description, canonicalPath = '' }) {
  useEffect(() => {
    // 1. Update Title
    const originalTitle = document.title;
    if (title) {
      document.title = title;
    }

    // 2. Update Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    const originalDesc = metaDesc ? metaDesc.getAttribute('content') : '';
    if (description) {
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', description);
    }

    // 3. Update Canonical Link
    const baseUrl = 'https://proxstream.com';
    const canonicalUrl = `${baseUrl}${canonicalPath ? (canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`) : ''}`;
    let linkCanonical = document.querySelector('link[rel="canonical"]');
    const originalCanonical = linkCanonical ? linkCanonical.getAttribute('href') : '';
    if (!linkCanonical) {
      linkCanonical = document.createElement('link');
      linkCanonical.setAttribute('rel', 'canonical');
      document.head.appendChild(linkCanonical);
    }
    linkCanonical.setAttribute('href', canonicalUrl);

    // 4. Update OpenGraph Tags
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle && title) ogTitle.setAttribute('content', title);

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc && description) ogDesc.setAttribute('content', description);

    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', canonicalUrl);

    return () => {
      if (originalTitle) document.title = originalTitle;
      if (originalDesc && metaDesc) metaDesc.setAttribute('content', originalDesc);
      if (originalCanonical && linkCanonical) linkCanonical.setAttribute('href', originalCanonical);
    };
  }, [title, description, canonicalPath]);
}

export default usePageSEO;
