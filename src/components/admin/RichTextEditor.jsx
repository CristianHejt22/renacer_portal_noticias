'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import LinkExtension from '@tiptap/extension-link';
import ImageExtension from '@tiptap/extension-image';
import { Bold, Italic, Strikethrough, Heading1, Heading2, List, ListOrdered, Quote, Link as LinkIcon, Image as ImageIcon, DollarSign } from 'lucide-react';


const MenuBar = ({ editor }) => {
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
          // Si el servidor lo está subiendo, lo guardará en /public/uploads
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

  const insertAd = () => {
    editor.chain().focus().insertContent('<p>[banner:in-article]</p>').run();
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
      <button onClick={insertAd} className={buttonClass()} title="Insertar Anuncio / AdSense">
        <DollarSign size={18} className="text-yellow-500" />
      </button>
    </div>
  );
};

export default function RichTextEditor({ content, onChange }) {
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
      <MenuBar editor={editor} />
      <EditorContent editor={editor} className="p-4 min-h-[300px] bg-background text-foreground" />
    </div>
  );
}
