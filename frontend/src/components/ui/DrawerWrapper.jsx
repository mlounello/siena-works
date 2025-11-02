import React from "react";

export default function DrawerWrapper({
  title,
  children,
  isOpen,
  onClose,
  onSave,
  hasChanges = true,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex justify-end bg-black/30 backdrop-blur-sm z-50">
      <div className="w-96 bg-white dark:bg-siena-darkGreen text-siena-darkGreen dark:text-siena-gold p-6 shadow-2xl overflow-y-auto transition-transform duration-300">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-display">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-siena-green dark:hover:text-siena-gold"
          >
            ✕
          </button>
        </div>
        <div className="space-y-4">{children}</div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-3 py-1 rounded border border-gray-400 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-siena-green/20"
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
        </div>
      </div>
    </div>
  );
}