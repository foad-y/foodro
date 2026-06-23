import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface ImageItem {
  id: string;
  img: string;
  name?: string;
}

interface ImageSelectProps {
  images: ImageItem[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function ImageSelect({
  images,
  value,
  onChange,
  placeholder = "انتخاب عکس",
}: ImageSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = images.find((img) => img.img === value);

  return (
    <div className="relative w-full" ref={ref}>
      {/* Trigger */}
      <div
        onClick={() => setOpen(!open)}
        className="min-h-12.5 bg-white w-full border border-border rounded-lg px-4 py-2 flex items-center justify-between cursor-pointer"
      >
        {selected ? (
          <div className="flex items-center gap-3">
            <img
              src={selected.img}
              alt=""
              className="w-8 h-8 rounded object-cover"
            />
            <span>{selected.name || "عکس انتخاب شده"}</span>
          </div>
        ) : (
          <span className="text-gray-400">{placeholder}</span>
        )}

        <ChevronDown
          className={`transition-transform ${open ? "rotate-180" : ""}`}
          size={18}
        />
      </div>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-50 mt-2 w-full bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
          {images.map((img) => (
            <div
              key={img.id}
              onClick={() => {
                onChange(img.img);
                setOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-2 hover:bg-gradiantbtnto/40 cursor-pointer"
            >
              <img
                src={img.img}
                alt=""
                className="w-8 h-8 rounded object-cover"
              />
              <span>{img.name || img.img}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
