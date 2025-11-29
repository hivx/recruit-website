import { Search } from "lucide-react";
import { useState } from "react";

export interface JobSearchQuery {
  readonly search?: string;
  readonly tag?: readonly string[];
  readonly [key: string]: unknown;
}

export interface JobSearchBarProps {
  readonly onSearch: (q: JobSearchQuery) => void;
}

export function JobSearchBar({ onSearch }: JobSearchBarProps) {
  const [keyword, setKeyword] = useState("");

  const handleSearch = () => {
    const combined = keyword.trim();

    const query: JobSearchQuery =
      combined.length > 0 ? { search: combined } : {};

    onSearch(query);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault(); // tránh reload form
      handleSearch();
    }
  };

  return (
    <div
      className="
      w-full bg-white rounded-3xl shadow-md p-5 mt-6
      transition-transform duration-300 
      hover:shadow-lg hover:-translate-y-1
    "
    >
      <div className="flex flex-col md:flex-row items-center gap-4">
        {/* Input */}
        <div
          className="
          flex items-center bg-gray-100 rounded-xl px-4 py-3 flex-1
          focus-within:ring-2 focus-within:ring-green-400 
          transition-all duration-200
        "
        >
          <Search className="text-gray-500 mr-2" size={20} />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Vị trí tuyển dụng, tên công ty..."
            className="
              bg-transparent outline-none flex-1
              text-gray-700 placeholder-gray-400
            "
          />
        </div>

        {/* Button */}
        <button
          onClick={handleSearch}
          className="
            bg-green-600 hover:bg-green-700 
            active:scale-95 
            transition-all duration-200
            text-white px-8 py-3 rounded-xl font-semibold text-lg
            shadow-md hover:shadow-lg
          "
        >
          Tìm kiếm
        </button>
      </div>
    </div>
  );
}
