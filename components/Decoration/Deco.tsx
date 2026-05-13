'use client'
import Image from 'next/image';
import logoQuiz from '../../assets/panda-logo.png';

export function Deco() {
  return (
    <>
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Orbs de fond */}
        <div className="gradient-orb gradient-orb-primary absolute -top-40 -right-40 w-96 h-96 opacity-40" />
        <div className="gradient-orb gradient-orb-secondary absolute -bottom-32 -left-32 w-80 h-80 opacity-40" />
        <div className="gradient-orb gradient-orb-accent absolute top-1/3 -right-20 w-72 h-72 opacity-20" />

        {/* Grille */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `
              linear-gradient(0deg, transparent 24%, rgba(0, 206, 209, 0.3) 25%, rgba(0, 206, 209, 0.3) 26%, transparent 27%, transparent 74%, rgba(0, 206, 209, 0.3) 75%, rgba(0, 206, 209, 0.3) 76%, transparent 77%, transparent),
              linear-gradient(90deg, transparent 24%, rgba(0, 191, 255, 0.3) 25%, rgba(0, 191, 255, 0.3) 26%, transparent 27%, transparent 74%, rgba(0, 191, 255, 0.3) 75%, rgba(0, 191, 255, 0.3) 76%, transparent 77%, transparent)
            `,
            backgroundSize: '50px 50px',
          }}
        />

        {/* Emojis flottants — opacité réduite */}
        <div className="absolute top-20 left-10 text-4xl opacity-15 animate-bounce" style={{ animationDuration: '4s' }}>🧠</div>
        <div className="absolute top-1/4 right-20 text-5xl opacity-15 animate-bounce" style={{ animationDuration: '5s', animationDelay: '0.5s' }}>💡</div>
        <div className="absolute top-1/3 left-1/4 text-6xl opacity-10 animate-bounce" style={{ animationDuration: '6s', animationDelay: '1s' }}>⭐</div>
        <div className="absolute bottom-1/4 right-1/4 text-5xl opacity-15 animate-bounce" style={{ animationDuration: '7s', animationDelay: '1.5s' }}>🚀</div>
        <div className="absolute bottom-32 left-1/3 text-4xl opacity-15 animate-bounce" style={{ animationDuration: '5s', animationDelay: '2s' }}>✅</div>
        <div className="absolute top-2/3 right-1/3 text-5xl opacity-10 animate-bounce" style={{ animationDuration: '6s', animationDelay: '0.3s' }}>📚</div>
        <div className="absolute bottom-1/3 left-20 text-4xl opacity-15 animate-bounce" style={{ animationDuration: '4s', animationDelay: '2.5s' }}>⚡</div>
        <div className="absolute top-1/2 right-10 text-5xl opacity-10 animate-bounce" style={{ animationDuration: '5s', animationDelay: '3s' }}>🎉</div>

        {/* Cercles pulsants — opacité réduite */}
        <div className="absolute top-1/4 left-1/3 w-24 h-24 rounded-full border-2 border-primary opacity-10 animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-32 h-32 rounded-full border-2 border-secondary opacity-10 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-3/4 left-1/2 w-20 h-20 rounded-full border-2 border-primary opacity-10 animate-pulse" style={{ animationDelay: '0.5s' }} />
      </div>
    </>
  );
}

export default Deco;