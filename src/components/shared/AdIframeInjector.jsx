'use client';

export default function AdIframeInjector({ htmlCode, width = '100%', height = 'auto', minHeight = '90px' }) {
  if (!htmlCode) return null;

  const srcDoc = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body, html { margin: 0; padding: 0; overflow: hidden; background: transparent; text-align: center; }
          body { display: flex; justify-content: center; align-items: center; min-height: 100vh; }
        </style>
      </head>
      <body>
        ${htmlCode}
      </body>
    </html>
  `;

  return (
    <div className="w-full flex justify-center overflow-hidden">
      <iframe
        srcDoc={srcDoc}
        style={{ border: 'none', background: 'transparent', width: width, height: height, minHeight: minHeight }}
        scrolling="no"
        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
      />
    </div>
  );
}
