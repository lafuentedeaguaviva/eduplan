import { useObjetivoHolisticoNivel } from '@/hooks/useObjetivoHolisticoNivel';
import { ObjetivoBanner } from './components/ObjetivoBanner';

export function ObjetivoHolisticoNivel() {
    const {
        objetivoNivel,
        typeConfig,
        colorClasses,
        backgroundClass
    } = useObjetivoHolisticoNivel();

    const typeConfigSafe = typeConfig || { color: 'slate', text: 'Desconocido', icon: 'help' };
    const colorClassesSafe = colorClasses || 'text-slate-600 bg-slate-50 border-slate-100';
    const backgroundClassSafe = backgroundClass || 'bg-slate-50/50';

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
            <ObjetivoBanner
                objetivoNivel={objetivoNivel}
                typeConfig={typeConfigSafe}
                colorClasses={colorClassesSafe}
                backgroundClass={backgroundClassSafe}
            />
        </div>
    );
}
