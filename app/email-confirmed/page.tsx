"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import logo from "@/app/assets/panda-logo.png";

export default function EmailConfirmedPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 100);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/dashboard");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-[#00D4D0] flex flex-col items-center justify-center px-4">

      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-cyan-200 rounded-full opacity-20 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#00D4D0] rounded-full opacity-20 blur-3xl" />
      </div>

      <div
        className={`relative z-10 bg-white rounded-2xl shadow-xl border border-cyan-100 max-w-md w-full overflow-hidden transition-all duration-700 ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div className="bg-gradient-to-r from-cyan-400 to-[#00D4D0] px-8 py-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
           <Image src={logo} alt="PandoMind AI Logo" className="w-10 h-10" />
            <span className="text-white text-xl font-bold tracking-wide">
              PandoMind <span className="text-cyan-100">AI</span>
            </span>
          </div>
          <p className="text-cyan-100 text-xs">AI-Powered Learning Platform</p>
        </div>

        <div className="flex justify-center -mt-8 mb-2">
          <div className="bg-white rounded-full p-2 shadow-md border border-cyan-100">
            <div className="bg-gradient-to-br from-cyan-400 to-[#00D4D0] rounded-full w-14 h-14 flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="px-8 pb-8 pt-2 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Email confirmé !</h1>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">
            Votre adresse email a été vérifiée avec succès. Bienvenue sur{" "}
            <span className="text-cyan-500 font-semibold">PandoMind AI</span> —
            vous pouvez maintenant créer des quiz intelligents avec l&apos;IA.
          </p>

          <div className="mb-6">
            <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
              <div
                className="bg-gradient-to-r from-cyan-400 to-[#00D4D0] h-1.5 rounded-full transition-all duration-1000"
                style={{ width: `${((5 - countdown) / 5) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-400">
              Redirection vers le dashboard dans{" "}
              <span className="text-cyan-500 font-semibold">{countdown}s</span>
            </p>
          </div>

          <button
            onClick={() => router.push("/dashboard")}
            className="w-full bg-gradient-to-r from-cyan-400 to-[#00D4D0] hover:from-cyan-500 hover:to-[#00D4D0] text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-cyan-200 active:scale-95"
          >
            Aller au dashboard →
          </button>

          <button
            onClick={() => router.push("/")}
            className="mt-3 text-xs text-gray-400 hover:text-cyan-500 transition-colors"
          >
            Retour à l&apos;accueil
          </button>
        </div>
      </div>

      <p className="mt-6 text-xs text-gray-400 text-center">
        © {new Date().getFullYear()} PandoMind AI · Tous droits réservés
      </p>
    </div>
  );
}