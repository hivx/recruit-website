// src/components/JobSearchBar.tsx
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useTagStore } from "@/stores";
import type { JobSearchQuery } from "@/types";

export interface JobSearchBarProps {
  onSearch: (q: JobSearchQuery) => void;
  backgroundImage?: string;
}

export function JobSearchBar({
  onSearch,
  backgroundImage,
}: Readonly<JobSearchBarProps>) {
  const [keyword, setKeyword] = useState("");
  const [location, setLocation] = useState(""); // NEW
  const [salaryWanted, setSalaryWanted] = useState<number>(); // NEW
  const [openTagList, setOpenTagList] = useState(false);

  // Zustand store
  const tags = useTagStore((s) => s.tags);
  const selected = useTagStore((s) => s.selected);
  const fetchTags = useTagStore((s) => s.fetchTags);
  const toggleTag = useTagStore((s) => s.toggleTag);
  const popular = useTagStore((s) => s.popular);
  const fetchPopular = useTagStore((s) => s.fetchPopular);

  // Load tags 1 lần
  useEffect(() => {
    void fetchTags();
    void fetchPopular();
  }, [fetchTags, fetchPopular]);

  // Khi bất kỳ bộ lọc nào thay đổi -> gọi search
  useEffect(() => {
    onSearch({
      search: keyword.trim(),
      tags: selected,
      location: location.trim(),
      salaryWanted,
    });
  }, [keyword, selected, location, salaryWanted, onSearch]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSearch({
        search: keyword.trim(),
        tags: selected,
        location: location.trim(),
        salaryWanted,
      });
    }
  };

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpenTagList(false);
      }
    }

    if (openTagList) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openTagList]);

  return (
    <section
      className="
        relative w-full pt-20 pb-10 px-4 md:px-10
        text-white shadow-lg rounded-b-[40px]
        bg-gradient-to-r from-blue-600 via-blue-500 to-blue-400
        flex flex-col items-center
      "
      style={{
        backgroundImage: backgroundImage
          ? `url(${backgroundImage})`
          : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* TITLE */}
      <motion.div
        className="relative z-10 text-center max-w-5xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-lg md:text-2xl lg:text-3xl font-extrabold drop-shadow">
          Tìm kiếm việc làm - tuyển dụng hiệu quả
        </h2>
      </motion.div>

      {/* SEARCH BOX */}
      <motion.div
        className="
          relative z-10 w-full max-w-5xl mt-6
          bg-white shadow-xl rounded-2xl p-3
        "
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {/* Ô search chính */}
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div
            className="
              flex items-center bg-gray-100 rounded-xl px-4 py-2.5 flex-1
              focus-within:ring-2 focus-within:ring-blue-500 transition
            "
          >
            <Search size={20} className="text-gray-500 mr-2" />
            <input
              id="keyword"
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

          <button
            onClick={() =>
              onSearch({
                search: keyword.trim(),
                tags: selected,
                location: location.trim(),
                salaryWanted,
              })
            }
            className="
              bg-blue-600 hover:bg-blue-700 text-white
              px-6 py-2.5 rounded-xl font-semibold text-base
              shadow-md hover:shadow-lg transition w-full md:w-auto
            "
          >
            Tìm kiếm
          </button>
        </div>

        {/* Ô lọc nhanh bên dưới search */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
          <input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Địa điểm (VD: Hà Nội, HCM...)"
            className="
              w-full bg-gray-100 rounded-xl px-4 py-2
              text-gray-700 placeholder-gray-400 text-sm
              focus:ring-2 focus:ring-blue-500 outline-none
            "
          />

          <input
            id="number"
            type="number"
            value={salaryWanted ?? ""}
            min={0}
            step={1000000}
            onChange={(e) => setSalaryWanted(Number(e.target.value))}
            placeholder="Mức lương mong muốn (VD: 15000000)"
            className="
              w-full bg-gray-100 rounded-xl px-4 py-2
              text-gray-700 placeholder-gray-400 text-sm
              focus:ring-2 focus:ring-blue-500 outline-none
            "
          />
        </div>
      </motion.div>

      {/* TAG FILTER */}
      <div className="relative z-20 w-full max-w-5xl mt-4 flex flex-col items-start">
        {/* Dropdown button */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpenTagList((o) => !o)}
            className="
              bg-white/90 hover:bg-white text-gray-800
              px-4 py-2 rounded-lg font-medium text-sm
              flex items-center gap-2 transition-all
              shadow-sm hover:shadow-md hover:scale-[1.02]
              border border-gray-200
            "
          >
            <span className="flex items-center gap-1">
              Lĩnh vực{" "}
              <span
                className={`transition-transform ${
                  openTagList ? "rotate-180" : ""
                }`}
              >
                ▾
              </span>
            </span>
          </button>

          {/* DROPDOWN */}
          {openTagList && (
            <div
              className="
                absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200
                max-h-64 overflow-y-auto p-2
                animate-dropdown
              "
            >
              {tags.length === 0 && (
                <p className="text-gray-500 text-sm px-2 py-1">Đang tải…</p>
              )}

              {tags.map((tag) => {
                const active = selected.includes(tag.name);

                return (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.name)}
                    className={`
              w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-all
              ${
                active
                  ? "bg-blue-100 text-blue-600 font-semibold"
                  : "text-gray-700 hover:bg-gray-100"
              }
            `}
                  >
                    <input
                      id="checkbox"
                      type="checkbox"
                      checked={active}
                      readOnly
                      className="w-4 h-4"
                    />
                    {tag.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* POPULAR TAGS */}
        <div className="mt-4 flex flex-col items-start gap-2">
          <p className="text-white font-medium text-sm mb-1">
            Lĩnh vực đang hot
          </p>

          <div className="grid grid-cols-2 gap-2">
            {popular.length === 0 && (
              <p className="col-span-2 text-white/70 text-sm italic">
                Đang tải ngành hot…
              </p>
            )}

            {popular.map((ptag) => {
              const active = selected.includes(ptag.tagName ?? "");

              return (
                <button
                  key={`${ptag.tagId}-${ptag.tagName}`}
                  onClick={() => ptag.tagName && toggleTag(ptag.tagName)}
                  className={`
                    px-3 py-1.5 rounded-full text-xs font-semibold transition border text-left
                    ${
                      active
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white/20 text-white border-white/30 hover:bg-white/30"
                    }
                  `}
                >
                  {ptag.tagName}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
