'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import LinkExtension from '@tiptap/extension-link';
import ImageExtension from '@tiptap/extension-image';
import { Bold, Italic, Strikethrough, Heading1, Heading2, List, ListOrdered, Quote, Link as LinkIcon, Image as ImageIcon, DollarSign } from 'lucide-react';


const MenuBar = ({ editor, availableBanners = [] }) => {
  const [showAdMenu, setShowAdMenu] = React.useState(false);

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
    input.accept = 'image/*,video/*,audio/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        try {
          const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
          const data = await res.json();
          if (data.url) {
            editor.chain().focus().setImage({ src: data.url }).run();
          }
        } catch (err) {
          console.error('Upload failed', err);
          alert('Error al subir el archivo');
        }
      }
    };
    input.click();
  };

  const insertCode = (code) => {
    editor.chain().focus().insertContent(`<p>${code}</p>`).run();
    setShowAdMenu(false);
  };

  const buttonClass = (isActive) =>
    `p-2 rounded-md transition-colors ${
      isActive ? 'bg-primary text-white' : 'hover:bg-white/10 text-gray-300'
    }`;

  return (
    <div className="flex flex-wrap gap-2 border-b border-border p-2 bg-surface rounded-t-xl">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={buttonClass(editor.isActive('bold'))}
        title="Negrita"
      >
        <Bold size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={buttonClass(editor.isActive('italic'))}
        title="Cursiva"
      >
        <Italic size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={buttonClass(editor.isActive('strike'))}
        title="Tachado"
      >
        <Strikethrough size={18} />
      </button>
      <div className="w-px h-6 bg-border mx-1 self-center" />
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={buttonClass(editor.isActive('heading', { level: 1 }))}
        title="Título 1"
      >
        <Heading1 size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={buttonClass(editor.isActive('heading', { level: 2 }))}
        title="Título 2"
      >
        <Heading2 size={18} />
      </button>
      <div className="w-px h-6 bg-border mx-1 self-center" />
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={buttonClass(editor.isActive('bulletList'))}
        title="Lista"
      >
        <List size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={buttonClass(editor.isActive('orderedList'))}
        title="Lista Numerada"
      >
        <ListOrdered size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={buttonClass(editor.isActive('blockquote'))}
        title="Cita"
      >
        <Quote size={18} />
      </button>
      <div className="w-px h-6 bg-border mx-1 self-center" />
      <button onClick={toggleLink} className={buttonClass(editor.isActive('link'))} title="Enlace">
        <LinkIcon size={18} />
      </button>
      <button onClick={addImage} className={buttonClass()} title="Imagen">
        <ImageIcon size={18} />
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
        className: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none dark:prose-invert',
      },
    },
  });

  return (
    <div className="border border-border rounded-xl overflow-hidden glass">
      <MenuBar editor={editor} availableBanners={availableBanners} />
      <EditorContent editor={editor} className="p-4 min-h-[300px] bg-background text-foreground" />
    </div>
  );
}
