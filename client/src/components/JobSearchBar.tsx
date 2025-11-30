import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useState } from "react";

export interface JobSearchQuery {
  readonly search?: string;
  readonly tag?: readonly string[];
  readonly [key: string]: unknown;
}

export interface JobSearchBarProps {
  readonly onSearch: (q: JobSearchQuery) => void;
  readonly backgroundImage?: string;
}

export function JobSearchBar({ onSearch, backgroundImage }: JobSearchBarProps) {
  const [keyword, setKeyword] = useState("");

  const handleSearch = () => {
    const text = keyword.trim();
    const query: JobSearchQuery = text ? { search: text } : {};
    onSearch(query);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <section
      className="
      relative w-full py-14 px-4 md:px-10 mb-10
      flex flex-col items-center justify-start
      text-white shadow-lg rounded-b-[40px]
      bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400
      pt-8
    "
      style={{
        backgroundImage: backgroundImage
          ? `url(${backgroundImage})`
          : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* TEXT BLOCK */}
      <motion.div
        className="relative z-10 max-w-3xl text-center space-y-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <h2 className="text-lg md:text-2xl lg:text-3xl font-extrabold leading-snug drop-shadow">
          Tìm kiếm việc làm - tuyển dụng hiệu quả
        </h2>
      </motion.div>

      {/* SEARCH BOX */}
      <motion.div
        className="
        relative z-10 w-full max-w-2xl mt-6
        bg-white shadow-xl rounded-2xl p-3
      "
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
      >
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Input */}
          <div
            className="
            flex items-center bg-gray-100 rounded-xl px-4 py-2.5 flex-1
            focus-within:ring-2 focus-within:ring-blue-500 transition
          "
          >
            <Search className="text-gray-500 mr-2" size={20} />

            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Nhập vị trí tuyển dụng hoặc tên công ty..."
              className="
              bg-transparent outline-none flex-1
              text-gray-700 placeholder-gray-400 text-sm md:text-base
            "
            />
          </div>

          {/* Button */}
          <button
            onClick={handleSearch}
            className="
            bg-blue-600 hover:bg-blue-700
            transition-all duration-200
            text-white px-6 py-2.5 rounded-xl font-semibold text-base
            shadow-md hover:shadow-lg w-full md:w-auto
          "
          >
            Tìm kiếm
          </button>
        </div>
      </motion.div>
    </section>
  );
}
