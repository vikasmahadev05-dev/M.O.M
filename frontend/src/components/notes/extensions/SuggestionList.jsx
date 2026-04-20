import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';

const SuggestionList = forwardRef((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = index => {
    const item = props.items[index];

    if (item) {
      props.command({ id: item.id, label: item.title });
    } else {
      // If item doesn't exist, it means the user is trying to link to a non-existent note
      // The user wants to "say the notes doesnt exist"
      // For now, we can just allow them to complete the text, 
      // but we won't create a real link unless an ID is present.
      props.editor.commands.insertContent(`[[${props.query}]] (Note doesn't exist)`);
    }
  };

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => setSelectedIndex(0), [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === 'ArrowUp') {
        upHandler();
        return true;
      }

      if (event.key === 'ArrowDown') {
        downHandler();
        return true;
      }

      if (event.key === 'Enter') {
        enterHandler();
        return true;
      }

      return false;
    },
  }));

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden min-w-[200px] animate-in fade-in zoom-in duration-150">
      {props.items.length ? (
        <div className="p-1">
          {props.items.map((item, index) => (
            <button
              className={`w-full text-left px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                index === selectedIndex ? 'bg-indigo-500 text-white' : 'text-slate-700 hover:bg-slate-100'
              }`}
              key={index}
              onClick={() => selectItem(index)}
            >
              {item.title}
            </button>
          ))}
        </div>
      ) : (
        <div className="p-4 text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Note not found</p>
          <p className="text-[10px] text-slate-300 mt-1">Press Enter to keep as text</p>
        </div>
      )}
    </div>
  );
});

export default SuggestionList;
