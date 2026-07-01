import { useEffect } from 'react';

export interface SEOMetadata {
  title: string;
  description: string;
  keywords?: string[];
  canonicalPath?: string;
  ogType?: 'website' | 'article' | 'profile';
  ogImage?: string;
  structuredData?: object | object[];
  noIndex?: boolean;
}

export const useSEO = ({
  title,
  description,
  keywords = [],
  canonicalPath,
  ogType = 'website',
  ogImage,
  structuredData,
  noIndex = false,
}: SEOMetadata) => {
  useEffect(() => {
    // 1. Title
    const formattedTitle = `${title} | CrackPlace AI`;
    document.title = formattedTitle;

    // Helper to get or create meta tag
    const setMetaTag = (attrName: string, attrVal: string, content: string) => {
      let element = document.querySelector(`meta[${attrName}="${attrVal}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attrName, attrVal);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Helper to get or create link tag
    const setLinkTag = (rel: string, href: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`);
      if (!element) {
        element = document.createElement('link');
        element.setAttribute('rel', rel);
        document.head.appendChild(element);
      }
      element.setAttribute('href', href);
    };

    // 2. Meta Tags
    setMetaTag('name', 'description', description);
    if (keywords.length > 0) {
      setMetaTag('name', 'keywords', keywords.join(', '));
    } else {
      const defaultKeywords = ['Placement Preparation', 'AI Placement Prep', 'Coding Interview', 'Technical Mock Tests'];
      setMetaTag('name', 'keywords', defaultKeywords.join(', '));
    }
    setMetaTag('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow');

    // 3. Canonical URL
    const baseUrl = 'https://bhuvaneswari791.github.io/CrackPlace-AI';
    const path = canonicalPath !== undefined ? canonicalPath : window.location.pathname;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const canonicalUrl = `${baseUrl}${cleanPath.replace('/CrackPlace-AI', '')}`;
    setLinkTag('canonical', canonicalUrl);

    // 4. Open Graph Tags
    const dynamicOgUrl = window.location.href;
    const fallbackImage = `${baseUrl}/assets/hero.png`;
    const imageToUse = ogImage || fallbackImage;

    setMetaTag('property', 'og:title', formattedTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:type', ogType);
    setMetaTag('property', 'og:url', dynamicOgUrl);
    setMetaTag('property', 'og:image', imageToUse);
    setMetaTag('property', 'og:site_name', 'CrackPlace AI');
    setMetaTag('property', 'og:locale', 'en_US');

    // 5. Twitter Card Tags
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', formattedTitle);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', imageToUse);
    setMetaTag('name', 'twitter:site', '@CrackPlaceAI');
    setMetaTag('name', 'twitter:creator', '@CrackPlaceAI');

    // 6. JSON-LD Structured Data
    const scriptElements: HTMLScriptElement[] = [];
    if (structuredData) {
      const dataArray = Array.isArray(structuredData) ? structuredData : [structuredData];
      dataArray.forEach((data, index) => {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = `ld-json-schema-${index}`;
        script.text = JSON.stringify(data);
        document.head.appendChild(script);
        scriptElements.push(script);
      });
    }

    return () => {
      // Clean up dynamic structured data script tags on unmount
      scriptElements.forEach(script => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      });
    };
  }, [title, description, keywords, canonicalPath, ogType, ogImage, structuredData, noIndex]);
};
