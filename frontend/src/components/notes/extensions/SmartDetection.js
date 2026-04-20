import { Extension } from '@tiptap/core';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { DETECTION_KEYWORDS } from './detectionKeywords';

export const SmartDetection = Extension.create({
  name: 'smartDetection',

  addOptions() {
    return {
      taskKeywords: DETECTION_KEYWORDS.tasks,
      importantKeywords: DETECTION_KEYWORDS.important,
      symbols: DETECTION_KEYWORDS.symbols,
    };
  },

  addProseMirrorPlugins() {
    const { taskKeywords, importantKeywords, symbols } = this.options;

    return [
      new Plugin({
        key: new PluginKey('smartDetection'),
        props: {
          decorations(state) {
            const decorations = [];

            state.doc.descendants((node, pos) => {
              if (node.isBlock && node.type.name === 'paragraph') {
                const text = node.textContent;
                if (!text) return;

                // Skip if already extracted
                if (node.attrs.extracted) return;

                const lowerText = text.toLowerCase();
                
                let isTask = false;
                let isImportant = false;

                // 1. Detect Task Intent
                const hasTaskWord = taskKeywords.some(word => lowerText.includes(word));
                if (hasTaskWord) isTask = true;

                // 2. Detect Important Content
                const hasImportantWord = importantKeywords.some(word => lowerText.includes(word));
                const startsWithSymbol = symbols.some(symbol => text.trim().startsWith(symbol));
                const isAllUpper = text.length > 5 && text === text.toUpperCase() && /[A-Z]/.test(text);

                if (hasImportantWord || startsWithSymbol || isAllUpper) {
                  isImportant = true;
                }

                // Apply Decorations
                if (isTask) {
                  // Node highlight
                  decorations.push(
                    Decoration.node(pos, pos + node.nodeSize, {
                      class: 'smart-task'
                    })
                  );

                  // Inline Widget (The Pencil Icon)
                  // Use getPos to ensure the position is always fresh if lines shift
                  decorations.push(
                    Decoration.widget(pos + node.nodeSize - 1, (view, getPos) => {
                      const btn = document.createElement('button');
                      btn.className = 'smart-widget-btn';
                      btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>`;
                      btn.onclick = (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // CRITICAL: Calculate fresh position
                        const currentPos = getPos();
                        // Find the start of the paragraph (widgets are at end, so we go back)
                        const nodePos = view.state.doc.resolve(currentPos).before();

                        const event = new CustomEvent('convert-to-task', {
                          detail: { text, pos: nodePos }
                        });
                        window.dispatchEvent(event);
                      };
                      return btn;
                    }, { side: 1 })
                  );
                } else if (isImportant) {
                  decorations.push(
                    Decoration.node(pos, pos + node.nodeSize, {
                      class: 'smart-important'
                    })
                  );
                }
              }
            });

            return DecorationSet.create(state.doc, decorations);
          },
        },
      }),
    ];
  },
});
