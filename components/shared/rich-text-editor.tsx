"use client";

import React, {
  useMemo,
  useRef,
  useEffect,
  useState,
  useCallback,
} from "react";
import "quill/dist/quill.snow.css";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder,
}) => {
  const [isRTL, setIsRTL] = useState(true);
  const [autoDetectDir, setAutoDetectDir] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const quillInstanceRef = useRef<any>(null);

  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        [
          "bold",
          "italic",
          "underline",
          "strike",
          { script: "sub" },
          { script: "super" },
        ],
        [{ color: [] }, { background: [] }],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: [] }, { direction: "rtl" }],
        ["blockquote", "code-block", "link", "image"],
        ["clean"],
      ],
      clipboard: { matchVisual: true },
      history: { delay: 500, maxStack: 200, userOnly: true },
    }),
    []
  );

  const formats = useMemo(
    () => [
      "header",
      "bold",
      "italic",
      "underline",
      "strike",
      "script",
      "color",
      "background",
      "list",
      "indent",
      "blockquote",
      "code-block",
      "align",
      "link",
      "image",
      "direction",
    ],
    []
  );

  const applyDirStyling = useCallback(() => {
    const q = quillInstanceRef.current;
    if (!q) return;
    const root = q.root as HTMLElement;
    root.dir = isRTL ? "rtl" : "ltr";
    root.style.textAlign = isRTL ? "right" : "left";
  }, [isRTL]);

  const detectDirection = useCallback(
    (text: string) => {
      if (!autoDetectDir) return;
      const hasArabic = /[\u0600-\u06FF]/.test(text);
      if (hasArabic !== isRTL) {
        setIsRTL(hasArabic);
      }
    },
    [autoDetectDir, isRTL]
  );

  useEffect(() => {
    if (quillInstanceRef.current) return; // initialize once
    if (!containerRef.current) return;
    // Ensure client-side
    if (typeof window === "undefined") return;
    // clear container to avoid duplicate toolbars if any
    containerRef.current.innerHTML = "";
    let isMounted = true;
    (async () => {
      const { default: Quill } = await import("quill");
      if (!isMounted || !containerRef.current) return;
      const q = new Quill(containerRef.current, {
        theme: "snow",
        modules,
        formats,
        placeholder,
      });
      quillInstanceRef.current = q;

      // initial value
      if (value) {
        q.clipboard.dangerouslyPasteHTML(value);
      }

      // change handler
      const handleChange = () => {
        const html = q.root.innerHTML;
        onChange(html);
        detectDirection(q.getText());
      };
      q.on("text-change", handleChange);

      // initial dir
      applyDirStyling();
    })();

    return () => {
      isMounted = false;
    };
    // deliberately only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // update when external value changes
  useEffect(() => {
    const q = quillInstanceRef.current;
    if (!q) return;
    const current = q.root.innerHTML;
    if (value !== current) {
      const sel = q.getSelection();
      q.clipboard.dangerouslyPasteHTML(value || "");
      if (sel) {
        q.setSelection(sel);
      }
    }
  }, [value]);

  // update dir styling when toggled
  useEffect(() => {
    applyDirStyling();
  }, [applyDirStyling]);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 justify-end">
        <label className="text-xs">
          <input
            type="checkbox"
            className="mr-1"
            checked={autoDetectDir}
            onChange={(e) => setAutoDetectDir(e.target.checked)}
          />
          تلقائي RTL
        </label>
        <button
          type="button"
          className="text-xs px-2 py-1 rounded border"
          onClick={() => setIsRTL((v) => !v)}
        >
          {isRTL ? "LTR" : "RTL"}
        </button>
      </div>
      <div ref={containerRef} />
      <style jsx global>{`
        .ql-editor {
          min-height: 300px;
          line-height: 1.8;
        }
        .ql-container.ql-snow {
          border-radius: 0.5rem;
        }
        /* Fix list alignment for RTL */
        .ql-editor[dir="rtl"] ol,
        .ql-editor[dir="rtl"] ul {
          padding-right: 1.5rem;
          padding-left: 0;
          list-style-position: inside;
        }
        .ql-editor[dir="rtl"] li {
          text-align: right;
        }
        .ql-editor ol,
        .ql-editor ul {
          margin: 0.5rem 0;
        }
        /* Heading dropdown layout: make options row-reverse */
        .ql-snow .ql-picker .ql-picker-label {
          display: flex;
          flex-direction: row-reverse;
        }
      `}</style>
    </div>
  );
};
