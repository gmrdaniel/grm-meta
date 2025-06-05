export default function BonusCard({
  icon,
  title,
  subtitle,
}: {
  readonly icon: React.ReactNode;
  readonly title?: string;
  readonly subtitle?: string;
}) {
  return (
    <div className="select-none bg-white rounded-2xl bg-opacity-25 backdrop-blur-sm p-5 flex items-center shadow-[0_10px_25px_rgba(0,0,0,0.08)] transition-all duration-300 ease-in-out hover:-translate-y-1">
      <div className="w-10 h-10 flex items-center justify-center mr-4 shrink-0 rounded-full bg-[linear-gradient(135deg,_#43CBFF_0%,_#9708CC_100%)]">
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-lg text-white">{title}</h3>
        <p className="text-white/80 text-sm">{subtitle}</p>
      </div>
    </div>
  );
}
