import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  url?: string;
}

const SEO = ({ title, description, keywords, url }: SEOProps) => {
  useEffect(() => {
    // Update title
    document.title = `${title} | WestCoastGod Photography`;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, property = false) => {
      const attribute = property ? "property" : "name";
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      
      element.setAttribute("content", content);
    };

    // Standard meta tags
    updateMetaTag("description", description);
    if (keywords) {
      updateMetaTag("keywords", keywords);
    }

    // Open Graph
    updateMetaTag("og:title", `${title} | WestCoastGod Photography`, true);
    updateMetaTag("og:description", description, true);
    if (url) {
      updateMetaTag("og:url", url, true);
    }

    // Twitter
    updateMetaTag("twitter:title", `${title} | WestCoastGod Photography`, true);
    updateMetaTag("twitter:description", description, true);
    if (url) {
      updateMetaTag("twitter:url", url, true);
    }
  }, [title, description, keywords, url]);

  return null;
};

export default SEO;
