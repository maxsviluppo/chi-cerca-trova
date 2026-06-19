import React from "react";
import { Sparkles, HelpCircle, Save, Target, Gamepad2, Play } from "lucide-react";

interface InstructionModalProps {
  onClose: () => void;
}

export const InstructionModal: React.FC<InstructionModalProps> = ({ onClose }) => {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 shadow-sm overflow-hidden relative">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-2xl -mr-10 -mt-10" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-50 rounded-full blur-2xl -ml-10 -mb-10" />

      <div className="relative flex flex-col gap-5">
        <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
          <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full">
            <Gamepad2 className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-800 leading-none">
              Benvenuto a Cerca e Trova!
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Un magico mondo animato di enigmi e sfide visive create da te!
            </p>
          </div>
        </div>

        {/* Informative column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Playing */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 flex gap-3">
            <div className="p-2.5 bg-rose-50 text-rose-500 rounded-xl h-fit shrink-0">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 mb-1">🔍 Come si Gioca?</h4>
              <p className="text-xs text-slate-500 leading-normal">
                Osserva il cartone animato per trovare gli elementi indicati nella barra in basso. Quando ne avvisti uno nell'immagine, 
                <strong className="text-indigo-600"> cliccalo </strong> per farlo sparire con un pop stellare! Se sei bloccato, clicca sull'icona in basso per leggere un indizio.
              </p>
            </div>
          </div>

          {/* Card 2: Creative Editor */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 flex gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-500 rounded-xl h-fit shrink-0">
              <Save className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800 mb-1">🎨 Diventa un Creatore!</h4>
              <p className="text-xs text-slate-500 leading-normal">
                Passa alla modalità <strong className="text-indigo-600">Editore</strong> per caricare sfondi personalizzati (dal tuo computer o usando modelli artistici) e decora a piacimento posizionando sticker emoji con mimetismo, rotazione ed indizi!
              </p>
            </div>
          </div>
        </div>

        {/* Ambient anim indicator comment */}
        <div className="p-3 bg-amber-50 border border-amber-100 rounded-2xl flex gap-2.5 items-center text-xs text-amber-900">
          <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
          <p>
            <strong>Occhio ai dettagli animati:</strong> Nel livello base della Casetta Felice vedrai l'anta della finestra oscillare, sbuffi di fumo volare dal camino e l'erba oscillare. Guarda attentamente!
          </p>
        </div>

        {/* Start Game Action button */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
        >
          <Play className="w-4 h-4 fill-white" />
          Inizia l'Esplorazione Gioco!
        </button>
      </div>
    </div>
  );
};
