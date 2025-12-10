// src/components/profile/MySkillsCard.tsx
import { motion } from "framer-motion";
import { PlusCircle, Wrench, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { SkillModal } from "@/components/profile";
import { useMySkills, useDeleteSkill } from "@/hooks";
import type { UserSkill } from "@/types";

export function MySkillsCard() {
  const { data, isLoading, error } = useMySkills();
  const deleteSkill = useDeleteSkill();

  const [openSkillModal, setOpenSkillModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState<UserSkill | null>(null);

  async function handleDelete(id: string) {
    try {
      await deleteSkill.mutateAsync(id);
      toast.success("Đã xoá kỹ năng!");
    } catch {
      toast.error("Xoá kỹ năng thất bại!");
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      className="
        rounded-2xl border bg-white p-6 shadow-sm
        hover:shadow-md transition-all duration-300
      "
    >
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Wrench size={20} className="text-blue-500" />
          Kỹ năng của tôi
        </h2>

        <motion.button
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => {
            setEditingSkill(null);
            setOpenSkillModal(true);
          }}
          className="
            inline-flex items-center gap-2 bg-blue-600 text-white
            px-4 py-2 rounded-lg text-sm font-medium shadow
            hover:bg-blue-700 active:scale-95 transition cursor-pointer
          "
        >
          <PlusCircle size={18} />
          Thêm kỹ năng
        </motion.button>
      </div>

      {/* LOADING */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 bg-gray-100 rounded-xl animate-pulse"
            />
          ))}
        </div>
      )}

      {/* ERROR */}
      {error && (
        <p className="text-red-500 text-sm mt-4">
          Không thể tải danh sách kỹ năng.
        </p>
      )}

      {/* EMPTY */}
      {data?.total === 0 && (
        <div className="text-gray-500 text-center py-10">
          Bạn chưa thêm kỹ năng nào.
        </div>
      )}

      {/* LIST */}
      {data?.skills && data.skills.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          {data.skills.map((skill) => (
            <SkillItem
              key={skill.id}
              skill={skill}
              onDelete={() => {
                void handleDelete(skill.id);
              }}
              onEdit={() => {
                setEditingSkill(skill);
                setOpenSkillModal(true);
              }}
            />
          ))}
        </div>
      )}

      {/* MODAL */}
      <SkillModal
        open={openSkillModal}
        onClose={() => setOpenSkillModal(false)}
        skill={editingSkill}
      />
    </motion.div>
  );
}

// =========================
// Child component: Skill item
// =========================
function SkillItem({
  skill,
  onDelete,
  onEdit,
}: {
  readonly skill: UserSkill;
  readonly onDelete: () => void;
  readonly onEdit: () => void;
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.04, y: -4 }}
      transition={{ type: "spring", stiffness: 220, damping: 18 }}
      className="
    relative p-5 rounded-2xl border bg-white/90 backdrop-blur 
    shadow-sm hover:shadow-xl hover:border-blue-400/40
    transition-all duration-300 overflow-hidden
  "
    >
      {/* GLOW BACKGROUND */}
      <div
        className="
      absolute inset-0 
      bg-gradient-to-br from-blue-300/20 via-indigo-300/10 to-purple-300/20
      opacity-0 group-hover:opacity-60 transition-opacity duration-300
      blur-2xl rounded-3xl pointer-events-none
    "
      />

      {/* CONTENT */}
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-lg text-gray-800">{skill.name}</h3>

          <div className="flex items-center gap-3">
            <button
              aria-label="Sửa kỹ năng"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="
            text-blue-500 hover:text-blue-700 
            transition active:scale-90 cursor-pointer
          "
            >
              <Pencil size={18} />
            </button>

            <button
              aria-label="Xoá kỹ năng"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="
            text-red-500 hover:text-red-700 
            transition active:scale-90 cursor-pointer
          "
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        <LevelBadge level={skill.level} />

        <p className="text-xs text-gray-600 mt-2">
          {skill.years
            ? `${skill.years} năm kinh nghiệm`
            : "Không rõ kinh nghiệm"}
        </p>

        {skill.note && (
          <p className="text-xs text-gray-500 mt-1 italic">{skill.note}</p>
        )}
      </div>
    </motion.div>
  );
}

// =========================
// Level badge
// =========================
function LevelBadge({ level }: { readonly level: number }) {
  const colorMap: Record<number, string> = {
    1: "bg-gray-100 text-gray-700",
    2: "bg-blue-100 text-blue-700",
    3: "bg-indigo-100 text-indigo-700",
    4: "bg-purple-100 text-purple-700",
    5: "bg-green-100 text-green-700",
  };

  return (
    <span
      className={`
        text-xs px-2 py-1 rounded-full font-medium inline-block mt-1
        ${colorMap[level] ?? "bg-gray-100 text-gray-600"}
      `}
    >
      Level {level}
    </span>
  );
}
