import { FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

export default function MediaUploader({
  files,
  fileRef,
  onFilesChange,
  onDropFiles,
  onRemoveFile,
  type,
}) {
  const acceptedTypes =
    type === "video"
      ? "video/*"
      : type === "image"
      ? "image/*"
      : "image/*,video/*";

  return (
    <motion.div
      className="mt-4 p-3 border border-dashed border-gray-400 rounded-lg bg-[#F9FAFB] min-h-[120px] flex flex-col items-center justify-center"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.2 }}
    >
      <input
        ref={fileRef}
        type="file"
        multiple
        accept={acceptedTypes}
        onChange={onFilesChange}
        className="hidden"
      />

      <div
        onDrop={onDropFiles}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileRef.current?.click()}
        className="cursor-pointer text-gray-500 text-center"
      >
        <p>
          Drop {type ? type + "s" : "files"} here or{" "}
          <span className="underline text-blue-600">click to upload</span>
        </p>
      </div>

      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            className="flex flex-wrap gap-2 mt-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {files.map((f, i) => (
              <motion.div
                key={i}
                className="relative group w-20 h-20 rounded overflow-hidden bg-gray-100"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
              >
                {f.type.startsWith("image/") ? (
                  <img
                    src={f.preview}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={f.preview}
                    className="w-full h-full object-cover"
                  />
                )}
                <button
                  type="button"
                  onClick={() => onRemoveFile(i)}
                  className="absolute top-0 right-0 bg-red-500 text-white w-5 h-5 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition"
                >
                  <FaTimes className="text-xs" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
