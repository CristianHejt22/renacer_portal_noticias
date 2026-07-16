'use client';

import { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import LinkExtension from '@tiptap/extension-link';
import ImageExtension from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { Bold, Italic, Strikethrough, Underline as UnderlineIcon, Heading1, Heading2, List, ListOrdered, Quote, Link as LinkIcon, Image as ImageIcon, DollarSign, AlignLeft, AlignCenter, AlignRight, AlignJustify, Code } from 'lucide-react';


const MenuBar = ({ editor, availableBanners = [] }) => {
  const [showAdMenu, setShowAdMenu] = useState(false);

  if (!editor) {
    return null;
  }

  const toggleLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const addImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true; // Allow selecting multiple images
    input.accept = 'image/*,video/*,audio/*';
    
    input.onchange = async (e) => {
      const files = Array.from(e.target.files);
      if (files.length > 0) {
        for (const file of files) {
          const formData = new FormData();
          formData.append('file', file, file.name);
          try {
            const res = await fetch('/api/upload', {
              method: 'POST',
              body: formData,
            });
            const data = await res.json();
            if (data.url) {
              // Use insertContent to avoid replacing an already selected image
              editor.chain().focus().insertContent(`<img src="${data.url}" class="rounded-lg max-w-full h-auto" /><p></p>`).run();
            }
          } catch (err) {
            console.error('Upload failed for', file.name, err);
            alert(`Error al subir ${file.name}`);
          }
        }
      }
    };
    
    input.click();
  };

  const insertCode = (code) => {
    editor.chain().focus().insertContent(`<p>${code}</p>`).run();
    setShowAdMenu(false);
  };

  const insertHtmlEmbed = () => {
    let htmlCode = window.prompt('Pega aquí el enlace (YouTube, Twitter, Instagram, TikTok) o tu código HTML/Iframe:');
    if (!htmlCode) return;
    
    htmlCode = htmlCode.trim();

    // Auto-detect Twitter/X URL
    const twMatch = htmlCode.match(/^(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/[a-zA-Z0-9_]+\/status\/([0-9]+)/i);
    if (twMatch && twMatch[1]) {
      insertCode(`[tweet:${twMatch[1]}]`);
      return;
    }

    // Auto-detect YouTube URL
    const ytMatch = htmlCode.match(/^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    if (ytMatch && ytMatch[1]) {
      htmlCode = `<iframe width="100%" height="400" src="https://www.youtube.com/embed/${ytMatch[1]}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    } 
    // Auto-detect Instagram URL
    else if (htmlCode.match(/^(?:https?:\/\/)?(?:www\.)?(?:instagram\.com|instagr\.am)\/(?:p|reel|tv)\/([a-zA-Z0-9_-]+)/i)) {
      const igMatch = htmlCode.match(/^(?:https?:\/\/)?(?:www\.)?(?:instagram\.com|instagr\.am)\/(?:p|reel|tv)\/([a-zA-Z0-9_-]+)/i);
      htmlCode = `<iframe src="https://www.instagram.com/p/${igMatch[1]}/embed" width="100%" height="480" frameborder="0" scrolling="no" allowtransparency="true"></iframe>`;
    }
    // Auto-detect TikTok URL
    else if (htmlCode.match(/^(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@[^\/]+\/video\/([0-9]+)/i)) {
      const tkMatch = htmlCode.match(/^(?:https?:\/\/)?(?:www\.)?tiktok\.com\/@[^\/]+\/video\/([0-9]+)/i);
      htmlCode = `<iframe src="https://www.tiktok.com/embed/v2/${tkMatch[1]}" width="100%" height="700" frameborder="0" allowfullscreen scrolling="no" allow="encrypted-media;"></iframe>`;
    }
    // Auto-detect Facebook Post URL
    else if (htmlCode.match(/^(?:https?:\/\/)?(?:www\.)?facebook\.com\/.+/i) && !htmlCode.includes('<iframe')) {
      const encodedFbUrl = encodeURIComponent(htmlCode);
      htmlCode = `<iframe src="https://www.facebook.com/plugins/post.php?href=${encodedFbUrl}&show_text=true&width=500" width="100%" height="500" style="border:none;overflow:hidden" scrolling="no" frameborder="0" allowfullscreen="true" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"></iframe>`;
    }

    try {
      const encoded = btoa(unescape(encodeURIComponent(htmlCode)));
      insertCode(`[embed]${encoded}[/embed]`);
    } catch (e) {
      alert('Error procesando el código HTML.');
    }
  };

  const buttonClass = (isActive) =>
    `p-2 rounded-md transition-colors ${
      isActive ? 'bg-primary text-white' : 'hover:bg-white/10 text-gray-300'
    }`;

  return (
    <div className="flex flex-wrap gap-2 border-b border-border p-2 bg-surface rounded-t-xl">
      <button onClick={() => editor.chain().focus().toggleBold().run()} className={buttonClass(editor.isActive('bold'))} title="Negrita">
        <Bold size={18} />
      </button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} className={buttonClass(editor.isActive('italic'))} title="Cursiva">
        <Italic size={18} />
      </button>
      <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={buttonClass(editor.isActive('underline'))} title="Subrayado">
        <UnderlineIcon size={18} />
      </button>
      <button onClick={() => editor.chain().focus().toggleStrike().run()} className={buttonClass(editor.isActive('strike'))} title="Tachado">
        <Strikethrough size={18} />
      </button>
      <div className="w-px h-6 bg-border mx-1 self-center" />
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={buttonClass(editor.isActive('heading', { level: 1 }))} title="Título 1">
        <Heading1 size={18} />
      </button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={buttonClass(editor.isActive('heading', { level: 2 }))} title="Título 2">
        <Heading2 size={18} />
      </button>
      <div className="w-px h-6 bg-border mx-1 self-center" />
      <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={buttonClass(editor.isActive({ textAlign: 'left' }))} title="Alinear Izquierda">
        <AlignLeft size={18} />
      </button>
      <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={buttonClass(editor.isActive({ textAlign: 'center' }))} title="Centrar">
        <AlignCenter size={18} />
      </button>
      <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className={buttonClass(editor.isActive({ textAlign: 'right' }))} title="Alinear Derecha">
        <AlignRight size={18} />
      </button>
      <button onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={buttonClass(editor.isActive({ textAlign: 'justify' }))} title="Justificar">
        <AlignJustify size={18} />
      </button>
      <div className="w-px h-6 bg-border mx-1 self-center" />
      <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={buttonClass(editor.isActive('bulletList'))} title="Lista">
        <List size={18} />
      </button>
      <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={buttonClass(editor.isActive('orderedList'))} title="Lista Numerada">
        <ListOrdered size={18} />
      </button>
      <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={buttonClass(editor.isActive('blockquote'))} title="Cita">
        <Quote size={18} />
      </button>
      <div className="w-px h-6 bg-border mx-1 self-center" />
      <button onClick={toggleLink} className={buttonClass(editor.isActive('link'))} title="Enlace">
        <LinkIcon size={18} />
      </button>
      <button onClick={addImage} className={buttonClass()} title="Imagen">
        <ImageIcon size={18} />
      </button>
      <button onClick={insertHtmlEmbed} className={buttonClass()} title="Insertar Código HTML / Iframe (YouTube, etc.)">
        <Code size={18} className="text-blue-400" />
      </button>
      <div className="w-px h-6 bg-border mx-1 self-center" />
      <div className="relative">
        <button onClick={() => setShowAdMenu(!showAdMenu)} className={buttonClass(showAdMenu)} title="Insertar Anuncio">
          <DollarSign size={18} className="text-yellow-500" />
        </button>
        {showAdMenu && (
          <div className="absolute top-full right-0 mt-1 w-64 bg-surface border border-border rounded-lg shadow-xl z-50 py-2">
            <button onClick={() => insertCode('[banner:in-article]')} className="w-full text-left px-4 py-2 text-sm hover:bg-white/10 transition-colors">
              Banner General (Aleatorio)
            </button>
            <button onClick={() => insertCode('[adsterra:in-article]')} className="w-full text-left px-4 py-2 text-sm hover:bg-white/10 transition-colors text-yellow-500">
              Script de Adsterra
            </button>
            {availableBanners.length > 0 && (
              <>
                <div className="w-full h-px bg-border my-2" />
                <div className="px-4 py-1 text-xs text-gray-500 font-bold uppercase tracking-wider">Banners Específicos</div>
                {availableBanners.map(b => (
                  <button key={b.id} onClick={() => insertCode(`[banner:id:${b.id}]`)} className="w-full text-left px-4 py-2 text-sm hover:bg-white/10 transition-colors truncate">
                    {b.name}
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default function RichTextEditor({ content, onChange, availableBanners = [] }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline cursor-pointer',
        },
      }),
      ImageExtension.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto',
        },
      }),
    ],
    content: content || '<p>Escribe tu artículo aquí...</p>',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        className: 'prose prose-slate dark:prose-invert max-w-none w-full min-h-[300px] focus:outline-none p-4',
      },
    },
  });

  return (
    <div className="border border-border rounded-xl overflow-hidden glass">
      <MenuBar editor={editor} availableBanners={availableBanners} />
      <EditorContent editor={editor} className="bg-background text-foreground" />
    </div>
  );
}
