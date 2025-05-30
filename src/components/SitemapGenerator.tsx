
import { useEffect, useState } from 'react';
import { generateSitemap, generateRobotsTxt } from '@/utils/sitemapGenerator';

const SitemapGenerator = () => {
  const [sitemap, setSitemap] = useState<string>('');
  const [robotsTxt, setRobotsTxt] = useState<string>('');

  useEffect(() => {
    const generateFiles = async () => {
      try {
        const sitemapXml = await generateSitemap();
        const robots = generateRobotsTxt();
        
        setSitemap(sitemapXml);
        setRobotsTxt(robots);
      } catch (error) {
        console.error('Error generating sitemap:', error);
      }
    };

    generateFiles();
  }, []);

  const downloadSitemap = () => {
    const blob = new Blob([sitemap], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadRobots = () => {
    const blob = new Blob([robotsTxt], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'robots.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">SEO Tools</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Sitemap</h2>
          <p className="text-gray-600 mb-4">
            Generate and download your site's XML sitemap for search engines.
          </p>
          <button
            onClick={downloadSitemap}
            disabled={!sitemap}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            Download Sitemap.xml
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Robots.txt</h2>
          <p className="text-gray-600 mb-4">
            Download the robots.txt file for your website.
          </p>
          <button
            onClick={downloadRobots}
            disabled={!robotsTxt}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            Download Robots.txt
          </button>
        </div>
      </div>
      
      {sitemap && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2">Sitemap Preview</h3>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto max-h-96">
            {sitemap}
          </pre>
        </div>
      )}
    </div>
  );
};

export default SitemapGenerator;
