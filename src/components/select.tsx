import { useState, useRef, useEffect } from "react";
import { ChevronDown, LucideIcon } from "lucide-react";

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  titel?: string
  placholder?: string
  options: option[]
  icon?: LucideIcon;
}

interface option {
  label: string;
  value: string;
}
// const options = [
//   { value: "men", label: "مرد" },
//   { value: "women", label: "زن" },
//   { value: "other", label: "سایر" },
// ];

export default function Select({ value, onChange, placholder, titel, options, icon: Icon }: SelectProps) {
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

  const selected = options.find((o) => o.value === value);

  return (
    <div className="group w-full" ref={ref}>
      {
        titel &&
        <label className="block text-sm font-bold text-gray-700 mb-2">
          {titel}
        </label>
      }

      <div className="relative">

        {/* آیکون */}
        {Icon && (
          <Icon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        )}
        {/* <div className="icon-venus-and-mars"></div> */}
        {/* Trigger */}
        <div
          onClick={() => setOpen(!open)}
          className={`min-h-12 w-full border-2 bg-white border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between cursor-pointer hover:border-primary transition-all ${Icon ? "pr-11" : ""
            }`}        >
          <span className={!value ? "text-gray-400" : "text-gray-800"}>
            {selected ? selected.label : placholder}
          </span>

          <ChevronDown
            className={`transition-transform duration-200 ${open ? "rotate-180 text-primary" : "text-gray-400"
              }`}
            size={18}
          />
        </div>

        {/* Dropdown */}
        {open && (
          <div className="absolute z-50 mt-2 w-full bg-white border border-black rounded-xl shadow-lg p-2 space-y-1 animate-in fade-in zoom-in-95 duration-150">
            {options.map((item) => (
              <div
                key={item.value}
                onClick={() => {
                  onChange(item.value);
                  setOpen(false);
                }}
                className={`px-4 py-2 rounded-lg cursor-pointer transition-all
                  ${value === item.value
                    ? "bg-gradiantbtnto/30 text-primary font-medium"
                    : "hover:bg-gradiantbtnto/20 text-primarytext"
                  }`}
              >
                {item.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
