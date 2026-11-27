const CODE_LINES = [
  { width: "120px", color: "#D9C59B", delay: "0s" },
  { width: "90px", color: "#7FA77A", delay: "0.4s" },
  { width: "140px", color: "#8FA9C9", delay: "0.8s" },
];

export function DeveloperScene({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`relative h-[380px] overflow-hidden rounded-[24px] bg-gradient-to-b from-[#EAE2D0] to-[#E3D9C3] ${className}`}
    >
      <div className="absolute left-10 top-9 h-[150px] w-[120px] rounded-lg border-[6px] border-[#CDBF9F] bg-[#DCD1B9]">
        <div className="m-[14px] h-[110px] rounded-sm bg-[#BFCBB2]" />
      </div>

      <svg
        viewBox="0 0 500 380"
        preserveAspectRatio="xMidYMax meet"
        className="absolute inset-0 h-full w-full"
      >
        <path d="M420 300 C410 250 430 220 446 196" stroke="#5E7A55" strokeWidth="3" fill="none" />
        <path d="M446 196 C470 190 476 214 452 222 Z" fill="#7C9A6E" />
        <path d="M432 236 C406 222 398 248 424 254 Z" fill="#6D8B61" />
        <path d="M440 214 C464 200 478 224 452 232 Z" fill="#87A578" />
        <rect x="404" y="296" width="40" height="40" rx="6" fill="#B9774F" />

        <g className="anim-breathe">
          <path d="M186 380 C186 300 214 270 258 268 C302 270 330 300 330 380Z" fill="var(--accent)" />
          <path d="M234 272 L246 300 M282 272 L270 300" stroke="#D9C59B" strokeWidth="2" />
          <path d="M214 286 C214 262 232 246 258 246 C284 246 302 262 302 286" stroke="#2B2F2B" strokeWidth="7" fill="none" strokeLinecap="round" />
          <rect x="246" y="232" width="24" height="24" rx="8" fill="#C99572" />
          <ellipse cx="258" cy="196" rx="38" ry="42" fill="#DCA57F" />
          <path d="M218 190 C212 152 236 140 260 141 C286 142 304 160 298 192 C292 172 278 164 262 164 C246 164 228 170 218 190Z" fill="#2A1E17" />
          <rect x="232" y="190" width="21" height="15" rx="5" fill="none" stroke="#1C211D" strokeWidth="2.4" />
          <rect x="263" y="190" width="21" height="15" rx="5" fill="none" stroke="#1C211D" strokeWidth="2.4" />
          <path d="M253 196 L263 196" stroke="#1C211D" strokeWidth="2.4" />
          <g className="anim-blink">
            <circle cx="242" cy="198" r="2.6" fill="#1C211D" />
            <circle cx="273" cy="198" r="2.6" fill="#1C211D" />
          </g>
          <path d="M248 218 Q258 224 268 218" stroke="#7A4A33" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        </g>

        <rect x="0" y="318" width="500" height="62" fill="#C8B794" />
        <rect x="0" y="318" width="500" height="6" fill="#B8A680" />
        <path d="M170 318 L188 238 L330 238 L348 318Z" fill="#2B2F2B" />
        <path d="M176 316 L192 244 L326 244 L342 316Z" fill="#363B36" />
        <rect x="156" y="314" width="206" height="9" rx="4" fill="#4A504A" />
        <circle className="anim-glow" cx="259" cy="280" r="7" fill="#D9C59B" />

        <rect x="378" y="272" width="34" height="46" rx="7" fill="#FBF8F1" stroke="#2B2F2B" strokeWidth="2" />
        <path d="M412 284 C426 284 426 304 412 304" stroke="#2B2F2B" strokeWidth="2" fill="none" />
        <path className="anim-steam" d="M388 262 C383 252 393 246 388 236" stroke="#8C8576" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path className="anim-steam [animation-delay:1.3s]" d="M402 262 C397 252 407 246 402 236" stroke="#8C8576" strokeWidth="2" fill="none" strokeLinecap="round" />
      </svg>

      <div className="absolute right-5 top-5 flex w-[180px] flex-col gap-1.5 rounded-xl bg-[#1C211D] p-3 shadow-lg">
        <div className="mb-1 flex gap-1.5">
          <span className="h-2 w-2 rounded-full bg-[#C96A5A]" />
          <span className="h-2 w-2 rounded-full bg-[#D9C59B]" />
          <span className="h-2 w-2 rounded-full bg-[#7FA77A]" />
        </div>
        {CODE_LINES.map((line) => (
          <div
            key={line.width}
            className="anim-type h-[5px] rounded-full"
            style={{
              ["--w" as string]: line.width,
              backgroundColor: line.color,
              animationDelay: line.delay,
            }}
          />
        ))}
      </div>
    </div>
  );
}
