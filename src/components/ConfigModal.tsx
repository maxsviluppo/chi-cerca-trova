import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shield, Lock, Unlock, Play, X, Settings, ArrowRight, Eye, CheckCircle, HelpCircle, Upload, RotateCcw } from "lucide-react";
import { playBtnClick, playFairyMagicSound } from "../utils/audio";

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenEditor: () => void;
  onTriggerSplash: () => void;
  customGameLogo: string | null;
  onLogoChange: (logo: string | null) => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({
  isOpen,
  onClose,
  onOpenEditor,
  onTriggerSplash,
  customGameLogo,
  onLogoChange,
}) => {
  const [passcode, setPasscode] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [showTip, setShowTip] = useState<boolean>(true);
  const [customBg, setCustomBg] = useState<string | null>(() => {
    try {
      return localStorage.getItem("custom_splash_bg");
    } catch {
      return null;
    }
  });

  const CORRECT_PASSCODE = "1234";

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      playFairyMagicSound();
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64String = uploadEvent.target?.result as string;
        if (base64String) {
          try {
            localStorage.setItem("custom_splash_bg", base64String);
            setCustomBg(base64String);
          } catch (err) {
            setErrorMsg("Immagine troppo grande per la memoria locale!");
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetBg = () => {
    playBtnClick();
    try {
      localStorage.removeItem("custom_splash_bg");
      setCustomBg(null);
    } catch (e) {}
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      playFairyMagicSound();
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64String = uploadEvent.target?.result as string;
        if (base64String) {
          try {
            localStorage.setItem("custom_game_logo", base64String);
            onLogoChange(base64String);
          } catch (err) {
            setErrorMsg("Logo troppo grande per la memoria locale!");
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetLogo = () => {
    playBtnClick();
    try {
      localStorage.removeItem("custom_game_logo");
      onLogoChange(null);
    } catch (e) {}
  };

  const handleKeyPress = (num: string) => {
    playBtnClick();
    setErrorMsg("");
    if (passcode.length < 4) {
      const newPass = passcode + num;
      setPasscode(newPass);
      
      // Auto submit if 4 digits
      if (newPass === CORRECT_PASSCODE) {
        setTimeout(() => {
          setIsAuthenticated(true);
          playFairyMagicSound();
        }, 150);
      } else if (newPass.length === 4) {
        setTimeout(() => {
          setErrorMsg("Codice di accesso errato!");
          setPasscode("");
        }, 300);
      }
    }
  };

  const handleClear = () => {
    playBtnClick();
    setPasscode("");
    setErrorMsg("");
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === CORRECT_PASSCODE) {
      setIsAuthenticated(true);
      playFairyMagicSound();
    } else {
      setErrorMsg("Codice di accesso errato!");
      setPasscode("");
    }
  };

  // Reset states upon reopening
  React.useEffect(() => {
    if (isOpen) {
      setPasscode("");
      setIsAuthenticated(false);
      setErrorMsg("");
      try {
        setCustomBg(localStorage.getItem("custom_splash_bg"));
      } catch (e) {}
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative bg-slate-900 border-2 border-amber-500/40 rounded-3xl p-6 shadow-2xl max-w-md w-full overflow-hidden text-white"
      >
        {/* Glow ambient background decoration */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Header decoration with shield */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <div className="flex items-center gap-2">
            <div className="bg-amber-500/20 p-2.5 rounded-2xl border border-amber-500/40 shadow-inner">
              <Shield className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-wide text-amber-300">
                Area Riservata Configurazione
              </h3>
              <p className="text-[10px] text-slate-400">Inserisci pin per sbloccare le opzioni</p>
            </div>
          </div>
          <button
            onClick={() => {
              playBtnClick();
              onClose();
            }}
            className="p-1.5 rounded-xl hover:bg-white/10 transition-colors text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {!isAuthenticated ? (
            /* PIN ENTRY VIEW */
            <motion.div
              key="auth-view"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex flex-col items-center"
            >
              <div className="flex flex-col items-center justify-center mb-5 mt-2">
                <div className="p-3 bg-slate-950/40 rounded-full border border-white/5 relative mb-3">
                  <Lock className="w-8 h-8 text-amber-500" />
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1] }} 
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border border-slate-900"
                  />
                </div>
                <p className="text-xs text-center text-slate-300 max-w-[280px]">
                  Questa sezione protetta ospita i comandi avanzati di sviluppo e progettazione.
                </p>
              </div>

              {/* Passcode dots holder */}
              <div className="flex gap-4 mb-5">
                {[0, 1, 2, 3].map((idx) => (
                  <div
                    key={`dot-${idx}`}
                    className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                      passcode.length > idx
                        ? "bg-amber-400 border-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)] scale-110"
                        : "border-slate-700 bg-slate-950"
                    }`}
                  />
                ))}
              </div>

              {/* Error messages */}
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 text-xs font-bold text-rose-400"
                >
                  ⚠️ {errorMsg}
                </motion.div>
              )}

              {/* NUMERIC VIRTUAL KEYBOARD */}
              <div className="grid grid-cols-3 gap-2.5 max-w-[240px] w-full mb-6">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
                  <button
                    key={`key-${num}`}
                    onClick={() => handleKeyPress(num)}
                    className="h-12 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-white/5 active:scale-95 font-mono text-lg font-extrabold text-white transition-all shadow-md cursor-pointer"
                  >
                    {num}
                  </button>
                ))}
                <button
                  onClick={handleClear}
                  className="h-12 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 active:scale-95 text-xs font-black text-rose-300 transition-all select-none cursor-pointer uppercase"
                >
                  Canc
                </button>
                <button
                  onClick={() => handleKeyPress("0")}
                  className="h-12 rounded-xl bg-slate-800/40 hover:bg-slate-800 border border-white/5 active:scale-95 font-mono text-lg font-extrabold text-white transition-all cursor-pointer"
                >
                  0
                </button>
                <div className="h-12 flex items-center justify-center font-mono opacity-20 text-[10px]">
                  #
                </div>
              </div>

              {/* Tip info panel */}
              {showTip && (
                <div className="w-full bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex gap-2.5 items-start">
                  <div className="text-amber-400 text-xs shrink-0 mt-0.5">ℹ️</div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="text-[10px] font-black uppercase text-amber-300 tracking-wider">Suggerimento Codice</span>
                      <button 
                        onClick={() => setShowTip(false)}
                        className="text-[9px] text-slate-400 hover:text-white"
                      >
                        Nascondi
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-300 leading-tight">
                      Il codice di sblocco predefinito configurato per l'amministratore è <strong className="text-amber-300 font-extrabold font-mono text-xs bg-slate-950 px-1.5 py-0.5 rounded ml-0.5 shadow-xs border border-white/5">1234</strong>. Digitalo per accedere.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            /* AUTHENTICATED CONFIGURATION ZONE */
            <motion.div
              key="config-view"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex gap-3 items-center">
                <div className="bg-emerald-500/20 p-2 rounded-xl">
                  <Unlock className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex-1">
                  <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-widest block">Accesso Consentito</span>
                  <p className="text-xs text-white">Sei ora all'interno dello scudo di configurazione.</p>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-black tracking-widest text-slate-400 uppercase">Strumenti Avanzati</h4>
                
                {/* SETTING 1: LEVEL CREATOR MIGRATION */}
                <div className="bg-slate-950/30 border border-white/5 rounded-2xl p-4 flex flex-col justify-between hover:border-amber-500/20 transition-all">
                  <div className="mb-3">
                    <div className="flex items-center gap-1.5 mb-1 text-amber-300 font-extrabold text-sm">
                      <span>🎨</span>
                      <span>Disegna o Modifica Livello</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Crea un livello interamente personalizzato inserendo una tua immagine del computer o tablet, elenca gli oggetti nascosti e aggiungi divertenti sfide.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      playBtnClick();
                      onOpenEditor();
                      onClose();
                    }}
                    className="flex items-center justify-center gap-1.5 w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    <span>Apri Creazione Livelli</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* SETTING: LOGO PERSONALIZZATO DELLA HOME */}
                <div className="bg-slate-950/30 border border-white/5 rounded-2xl p-4 flex flex-col justify-between hover:border-amber-500/20 transition-all">
                  <div className="mb-3">
                    <div className="flex items-center gap-1.5 mb-1 text-emerald-300 font-extrabold text-sm">
                      <span>🏅</span>
                      <span>Logo Principale (Home)</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal mb-3.5">
                      Sostituisci il logo provvisorio con l'immagine allegata che hai salvato per visualizzarla all'avvio e nella barra di navigazione del gioco.
                    </p>

                    {/* Miniature thumbnail preview of current logo image if present */}
                    <div className="flex items-center gap-3 bg-slate-950/40 p-2.5 rounded-xl border border-white/5 mb-3">
                      <div className="w-10 h-10 rounded-full bg-slate-950 overflow-hidden shrink-0 border border-amber-500/30 flex items-center justify-center">
                        {customGameLogo ? (
                          <img src={customGameLogo} alt="Logo" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[10px] text-amber-400/80 font-extrabold font-mono">DEF</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[9px] uppercase font-black tracking-wider text-slate-400 block mb-0.5">Stato Del Logo</span>
                        <span className="text-[11px] font-semibold truncate text-slate-200 block">
                          {customGameLogo ? "Logo Personalizzato Attivo" : "Standard (Gamepad)"}
                        </span>
                      </div>
                    </div>

                    {/* File Upload Buttons */}
                    <div className="flex gap-2">
                      <label className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 border border-white/10 hover:border-amber-500/20 text-white font-extrabold text-[10px] sm:text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer">
                        <Upload className="w-3.5 h-3.5 text-amber-400" />
                        <span>Carica Logo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleLogoUpload}
                        />
                      </label>
                      {customGameLogo && (
                        <button
                          onClick={handleResetLogo}
                          className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-bold text-[10px] sm:text-xs rounded-lg border border-rose-500/20 transition-all flex items-center justify-center gap-1 cursor-pointer"
                          title="Ripristina predefinito"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* SETTING 2: CHOOSE TO RUN INITIAL FULLSCREEN PRESENTATION */}
                <div className="bg-slate-950/30 border border-white/5 rounded-2xl p-4 flex flex-col justify-between hover:border-amber-500/20 transition-all">
                  <div className="mb-3">
                    <div className="flex items-center gap-1.5 mb-1 text-sky-300 font-extrabold text-sm">
                      <span>💫</span>
                      <span>Pagina di Presentazione</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal mb-3.5">
                      Personalizza lo sfondo della presentazione caricando una foto copertina personalizzata dal tuo dispositivo, o riavvia la presentazione magica.
                    </p>

                    {/* Miniature thumbnail preview of current cover image if present */}
                    <div className="flex items-center gap-3 bg-slate-950/40 p-2.5 rounded-xl border border-white/5 mb-3">
                      <div className="w-14 h-10 rounded-lg bg-slate-950 overflow-hidden shrink-0 border border-white/10 flex items-center justify-center">
                        {customBg ? (
                          <img src={customBg} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[10px] text-amber-500/65 font-bold uppercase font-mono">Def</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[9px] uppercase font-black tracking-wider text-slate-400 block mb-0.5">Sfondo Copertina</span>
                        <span className="text-[11px] font-semibold truncate text-slate-200 block">
                          {customBg ? "Foto Personalizzata" : "Default (Enchanted Library)"}
                        </span>
                      </div>
                    </div>

                    {/* File Upload Buttons */}
                    <div className="flex gap-2 mb-3">
                      <label className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 border border-white/10 hover:border-amber-500/20 text-white font-extrabold text-[10px] sm:text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer">
                        <Upload className="w-3.5 h-3.5 text-amber-400" />
                        <span>Carica Foto</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                      </label>
                      {customBg && (
                        <button
                          onClick={handleResetBg}
                          className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 font-bold text-[10px] sm:text-xs rounded-lg border border-rose-500/20 transition-all flex items-center justify-center gap-1 cursor-pointer"
                          title="Ripristina predefinito"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      playBtnClick();
                      onTriggerSplash();
                      onClose();
                    }}
                    className="flex items-center justify-center gap-1.5 w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs tracking-wider uppercase rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Visualizza Presentazione</span>
                  </button>
                </div>
              </div>

              {/* Back to lobby button */}
              <div className="pt-2 border-t border-white/10 flex justify-end">
                <button
                  onClick={() => {
                    playBtnClick();
                    onClose();
                  }}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Chiudi Configurazioni
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
