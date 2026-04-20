import { Mention } from '@tiptap/extension-mention';
import { ReactRenderer } from '@tiptap/react';
import tippy from 'tippy.js/dist/tippy.esm.js';
import 'tippy.js/dist/tippy.css'; // Add CSS for the suggestion dropdown
import SuggestionList from './SuggestionList';

export const NoteLink = Mention.extend({
  name: 'noteLink',

  addOptions() {
    return {
      ...this.parent?.(),
      HTMLAttributes: {
        class: 'note-link',
      },
      renderLabel({ options, node }) {
        return `${options.suggestion.char}${node.attrs.label ?? node.attrs.id}`;
      },
    }
  },
}).configure({
  HTMLAttributes: {
    class: 'bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-md font-bold cursor-pointer hover:bg-indigo-100 transition-colors border border-indigo-200 decoration-none inline-flex items-center gap-1',
  },
  renderLabel({ node }) {
    return `[[${node.attrs.label}]]`;
  },
  suggestion: {
    char: '[[',
    render: () => {
      let component;
      let popup;

      return {
        onStart: (props) => {
          component = new ReactRenderer(SuggestionList, {
            props,
            editor: props.editor,
          });

          if (!props.clientRect) {
            return;
          }

          popup = tippy('body', {
            getReferenceClientRect: props.clientRect,
            appendTo: () => document.body,
            content: component.element,
            showOnCreate: true,
            interactive: true,
            trigger: 'manual',
            placement: 'bottom-start',
          });
        },

        onUpdate(props) {
          component.updateProps(props);

          if (!props.clientRect) {
            return;
          }

          popup[0].setProps({
            getReferenceClientRect: props.clientRect,
          });
        },

        onKeyDown(props) {
          if (props.event.key === 'Escape') {
            popup[0].hide();
            return true;
          }

          return component.ref?.onKeyDown(props);
        },

        onExit() {
          popup[0].destroy();
          component.destroy();
        },
      };
    },
  },
});

// Since we need a SuggestionList component, I'll create it in a separate file or inline it if small.
// For now, I'll just export the definition and create the component next.
