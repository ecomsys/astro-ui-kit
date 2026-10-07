// src/alpine/editor.ts
import type { Alpine } from "alpinejs";
import { Editor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image"; // <--- КАРТИНКИ
import { scrollLock } from "../../../lib/scrollLock";
import { html_beautify } from "js-beautify";

export default (Alpine: Alpine) => {
    Alpine.data("editor", (initialContent = "") => {
        let editor: Editor | null = null;

        return {
            ...scrollLock,
            html: initialContent,
            active: {} as any,
            isHtmlModalOpen: false,
            modalHtml: "",
            linkUrl: "",
            linkText: "",
            imageUrl: "", // <--- Для Поповера картинок
            imageAlt: "", // <--- Для Поповера картинок

            init(this: any) {
                this.initScrollLock();

                editor = new Editor({
                    element: this.$refs.editor,
                    extensions: [
                        StarterKit,
                        Link.configure({ openOnClick: false }),
                        Underline,
                        TextAlign.configure({ types: ["heading", "paragraph"] }),
                        // РАСШИРЯЕМ IMAGE: Учим Tiptap понимать width и height
                        Image.extend({
                            addAttributes() {
                                return {
                                    ...this.parent?.(),
                                    width: { default: null },
                                    height: { default: null },
                                };
                            },
                        }),
                    ],
                    content: this.html || "",
                    onUpdate: ({ editor }: any) => {
                        this.html = editor.getHTML().replace(/<p>(\s|<br\s*\/?>)*<\/p>$/, "");
                        this.$dispatch("update", this.html);
                    },
                    onSelectionUpdate: ({ editor }: any) => {
                        this.active = {
                            bold: editor.isActive("bold"),
                            italic: editor.isActive("italic"),
                            underline: editor.isActive("underline"),
                            h1: editor.isActive("heading", { level: 1 }),
                            h2: editor.isActive("heading", { level: 2 }),
                            h3: editor.isActive("heading", { level: 3 }),
                            h4: editor.isActive("heading", { level: 4 }),
                            h5: editor.isActive("heading", { level: 5 }),
                            h6: editor.isActive("heading", { level: 6 }),
                            quote: editor.isActive("blockquote"),
                            bulletList: editor.isActive("bulletList"),
                            orderedList: editor.isActive("orderedList"),
                            codeBlock: editor.isActive("codeBlock"),
                            alignLeft: editor.isActive({ textAlign: "left" }),
                            alignCenter: editor.isActive({ textAlign: "center" }),
                            alignRight: editor.isActive({ textAlign: "right" }),
                            alignJustify: editor.isActive({ textAlign: "justify" }),
                            isLinkActive: editor.isActive("link"),
                        };
                    },
                });
            },

            toggleBold() {
                editor?.chain().focus().toggleBold().run();
            },
            toggleItalic() {
                editor?.chain().focus().toggleItalic().run();
            },
            toggleUnderline() {
                editor?.chain().focus().toggleUnderline().run();
            },
            toggleH1() {
                editor?.chain().focus().toggleHeading({ level: 1 }).run();
            },
            toggleH2() {
                editor?.chain().focus().toggleHeading({ level: 2 }).run();
            },
            toggleH3() {
                editor?.chain().focus().toggleHeading({ level: 3 }).run();
            }, // <---
            toggleH4() {
                editor?.chain().focus().toggleHeading({ level: 4 }).run();
            }, // <---
            toggleH5() {
                editor?.chain().focus().toggleHeading({ level: 5 }).run();
            }, // <---
            toggleH6() {
                editor?.chain().focus().toggleHeading({ level: 6 }).run();
            }, // <---
            setParagraph() {
                editor?.chain().focus().setParagraph().run();
            },
            toggleQuote() {
                editor?.chain().focus().toggleBlockquote().run();
            },
            toggleBulletList() {
                editor?.chain().focus().toggleBulletList().run();
            },
            toggleOrderedList() {
                editor?.chain().focus().toggleOrderedList().run();
            },
            toggleCodeBlock() {
                editor?.chain().focus().toggleCodeBlock().run();
            },

            undo() {
                editor?.chain().focus().undo().run();
            },
            redo() {
                editor?.chain().focus().redo().run();
            },
            alignLeft() {
                editor?.chain().focus().setTextAlign("left").run();
            },
            alignCenter() {
                editor?.chain().focus().setTextAlign("center").run();
            },
            alignRight() {
                editor?.chain().focus().setTextAlign("right").run();
            },
            alignJustify() {
                editor?.chain().focus().setTextAlign("justify").run();
            },

            // МАГИЯ ССЫЛКИ (Popover)
            openLinkPopover(this: any) {
                if (editor) {
                    const attrs = editor.getAttributes("link");
                    this.linkUrl = attrs.href || ""; // Пустое поле, берем только старую ссылку
                    const { from, to } = editor.state.selection;
                    this.linkText = editor.state.doc.textBetween(from, to, " ");
                }
            },

            applyLink(this: any) {
                if (editor) {
                    if (this.linkUrl === "") {
                        editor.chain().focus().unsetLink().run();
                    } else {
                        let url = this.linkUrl;
                        // АВТО-ДОБАВЛЕНИЕ HTTPS:// (Если пользователь забыл)
                        if (!/^https?:\/\//i.test(url)) {
                            url = "https://" + url;
                        }
                        const textToInsert = this.linkText || url;
                        editor
                            .chain()
                            .focus()
                            .deleteSelection()
                            .insertContent(`<a href="${url}">${textToInsert}</a>&nbsp;`)
                            .run();
                    }
                }
                this.linkUrl = "";
                this.linkText = "";
            },

            // МАГИЯ КАРТИНОК (Popover)
            openImagePopover(this: any) {
                this.imageUrl = ""; // Пустое поле
                this.imageAlt = "";
            },

            insertImage(this: any) {
                if (!editor || !this.imageUrl) return;

                let url = this.imageUrl;
                // АВТО-ДОБАВЛЕНИЕ HTTPS:// для картинки
                if (!/^https?:\/\//i.test(url)) {
                    url = "https://" + url;
                }

                const alt = this.imageAlt;
                const tempImg = new window.Image();

                tempImg.onload = () => {
                    const width = tempImg.naturalWidth;
                    const height = tempImg.naturalHeight;
                    editor?.chain().focus().setImage({ src: url, alt: alt, width: width, height: height }).run();
                };

                tempImg.onerror = () => {
                    editor?.chain().focus().setImage({ src: url, alt: alt }).run();
                };

                tempImg.src = url;

                this.imageUrl = "";
                this.imageAlt = "";
            },

            clearFormatting(this: any) {
                editor?.chain().focus().unsetAllMarks().clearNodes().run();
            },

            openHtmlModal(this: any) {
                if (editor) {
                    let rawHtml = editor.getHTML();
                    rawHtml = rawHtml.replace(/<p>(\s|<br\s*\/?>)*<\/p>$/, "");
                    try {
                        this.modalHtml = html_beautify(rawHtml, {
                            indent_size: 2,
                            wrap_line_length: 0,
                            preserve_newlines: false,
                            unformatted: ["b", "i", "u", "strong", "em", "span", "a"],
                        });
                    } catch (e) {
                        this.modalHtml = rawHtml;
                    }
                }
                this.isHtmlModalOpen = true;
                this.toggleScrollLock(true, 150);
            },

            saveHtmlModal(this: any) {
                if (editor) {
                    editor.commands.setContent(this.modalHtml, { emitUpdate: false });
                    this.html = this.modalHtml;
                    this.$dispatch("update", this.html);
                }
                this.closeHtmlModal();
            },

            closeHtmlModal(this: any) {
                this.isHtmlModalOpen = false;
                this.toggleScrollLock(false, 150);
            },

            formatHtml(this: any) {
                if (!this.modalHtml) return;
                try {
                    this.modalHtml = html_beautify(this.modalHtml, {
                        indent_size: 2,
                        wrap_line_length: 0,
                        preserve_newlines: false,
                        unformatted: ["b", "i", "u", "strong", "em", "span", "a"],
                    });
                } catch (e) {
                    console.warn("Formatting error:", e);
                }
            },

            destroy(this: any) {
                if (editor) editor.destroy();
            },
        };
    });
};
