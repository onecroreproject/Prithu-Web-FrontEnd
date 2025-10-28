import React from "react";

export default function TagFriends({ taggedFriends, setTaggedFriends }) {
  const allFriends = ["Alice", "Bob", "Charlie", "Diana", "Eve"];

  const toggleTag = (name) => {
    setTaggedFriends((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  return (
    <div className="mt-4 p-3 border rounded bg-[#F9FAFB]">
      <p className="text-sm mb-2">Tag friends:</p>
      <div className="flex flex-wrap gap-2">
        {allFriends.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => toggleTag(name)}
            className={`px-3 py-1 rounded-full text-sm transition-all ${
              taggedFriends.includes(name)
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {taggedFriends.length > 0 && (
        <p className="mt-2 text-sm">
          Tagged: <strong>{taggedFriends.join(", ")}</strong>
        </p>
      )}
    </div>
  );
}
