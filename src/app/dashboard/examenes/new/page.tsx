import { Metadata } from "next";
import { WizardExamenes } from "@/components/examenes/WizardExamenes";

export const metadata: Metadata = {
  title: "Generador de Exámenes Gamificados",
  description: "Crea evaluaciones del Saber, Hacer y Ser con narrativa interactiva.",
};

export default function NuevoExamenPage() {
  return (
    <div className="flex flex-col h-full">
      <WizardExamenes />
    </div>
  );
}
