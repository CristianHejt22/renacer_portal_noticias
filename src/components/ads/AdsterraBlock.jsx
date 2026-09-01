"use client";
import React from 'react';

export default function AdsterraBlock({ html }) {
  if (!html) return null;
  
  // Use srcDoc to sandbox the ad script and prevent document.write from breaking React
  const srcDocHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body {
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            background: transparent;
            width: 100%;
            height: 100%;
            overflow: hidden;
          }
        </style>
      </head>
      <body>
        ${html}
      </body>
    </html>
  `;

  return (
    <iframe
      title="Publicidad"
      srcDoc={srcDocHtml}
      width="300"
      height="250"
      className="border-none w-[300px] h-[250px]"
      scrolling="no"
      sandbox="allow-scripts allow-popups allow-same-origin allow-forms allow-top-navigation-by-user-activation"
    />
  );
}
