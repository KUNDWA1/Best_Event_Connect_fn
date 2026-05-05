export default function Logo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <img 
      src="/logo.svg" 
      alt="Event Connect Logo" 
      className={`${className} object-contain`}
    />
  )
}
