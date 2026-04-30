import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function baseCn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface Option {
    id: number | string;
    nombre: string;
}

interface ComboboxProps {
    options: Option[];
    value: number | string | '';
    onChange: (value: number | string | '') => void;
    placeholder?: string;
    label?: string;
    disabled?: boolean;
    className?: string;
}

export const Combobox: React.FC<ComboboxProps> = ({
    options,
    value,
    onChange,
    placeholder = 'Seleccionar...',
    label,
    disabled = false,
    className
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.id === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = options.filter(opt =>
        opt.nombre.toLowerCase().includes(search.toLowerCase())
    );

    const handleSelect = (option: Option) => {
        onChange(option.id);
        setSearch('');
        setIsOpen(false);
    };

    return (
        <div className={baseCn("w-full space-y-2 relative", className)} ref={containerRef}>
            {label && (
                <label className="block text-sm font-bold text-slate-700 ml-1">
                    {label}
                </label>
            )}
            
            <div className="relative">
                <div
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    className={baseCn(
                        "w-full bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm cursor-pointer transition-all duration-200 flex items-center justify-between",
                        isOpen ? "border-blue-600 ring-4 ring-blue-600/5 shadow-glow" : "hover:border-blue-300",
                        disabled && "bg-slate-50 opacity-60 cursor-not-allowed",
                        !selectedOption && "text-slate-400"
                    )}
                >
                    <span className="truncate">
                        {selectedOption ? selectedOption.nombre : placeholder}
                    </span>
                    <span className={baseCn(
                        "material-symbols-rounded transition-transform duration-200 text-slate-400",
                        isOpen && "rotate-180 text-blue-600"
                    )}>
                        expand_more
                    </span>
                </div>

                {isOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl z-[60] overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-64">
                        <div className="p-2 border-b border-slate-50">
                            <div className="relative">
                                <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                                    search
                                </span>
                                <input
                                    autoFocus
                                    type="text"
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20"
                                    placeholder="Buscar..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onClick={(e) => e.stopPropagation()}
                                />
                            </div>
                        </div>

                        <div className="overflow-y-auto flex-1 custom-scrollbar">
                            {filteredOptions.length > 0 ? (
                                filteredOptions.map((option) => (
                                    <div
                                        key={option.id}
                                        onClick={() => handleSelect(option)}
                                        className={baseCn(
                                            "px-4 py-3 text-sm cursor-pointer transition-colors",
                                            value === option.id ? "bg-blue-50 text-blue-700 font-bold" : "text-slate-700 hover:bg-slate-50"
                                        )}
                                    >
                                        {option.nombre}
                                    </div>
                                ))
                            ) : (
                                <div className="px-4 py-8 text-center text-slate-400 text-xs italic">
                                    No se encontraron resultados
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
