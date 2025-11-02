import React, { useEffect, useState } from "react";

export default function DrawerWrapper({
  title,
  children,
  onClose,
  onSave,
  isOpen,
  data = {},
  editedData = {},
}) {
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const changed =
      Object.keys(editedData).some(
        (key) => editedData[key] !== data[key]
      ) && Object.keys(editedData).length > 0;
    setHasChanges(changed);
  }, [editedData, data]);

  return (
    <div
      className={`fixed inset-0 z-50 transition-all duration-300 ${
        isOpen ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
    >
      {/* Background Overlay */}
      <div
        className="absolute inset-0 bg-black/40 dark:bg-black/60"
        onClick={onClose}
      ></div>

      {/* Drawer Panel */}
      <div
        className={`absolute right-0 top-0 h-full w-[400px] p-6 flex flex-col
          bg-white text-siena-darkGreen shadow-xl transition-transform duration-300
          dark:bg-siena-darkGreen dark:text-siena-gold
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Header */}
        <header className="flex justify-between items-center mb-4 border-b border-siena-green/30 pb-2">
          <h2 className="font-display text-lg tracking-wide">{title}</h2>
          <button
            onClick={onClose}
            className="text-siena-darkGreen dark:text-siena-gold hover:opacity-80"
          >
            ✕
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">{children}</div>

        {/* Footer */}
        <footer className="mt-6 flex justify-end gap-3 pt-3 border-t border-siena-green/30">
          <button
            onClick={onClose}
            className="px-3 py-1 border border-siena-green text-siena-green dark:border-siena-gold dark:text-siena-gold rounded hover:bg-siena-green hover:text-siena-white transition"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={!hasChanges}
            className={`px-3 py-1 rounded font-medium transition ${
              hasChanges
                ? "bg-siena-gold text-siena-darkGreen hover:bg-siena-green hover:text-siena-gold"
                : "bg-gray-300 text-gray-600 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400"
            }`}
          >
            Save
          </button>
        </footer>
      </div>
    </div>
  );
}