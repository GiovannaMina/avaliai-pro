interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className = '', size = 'md' }: LogoProps) {
  const sizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
  };

  return (
    <div className={`flex items-center gap-1.5 font-bold ${sizes[size]} ${className}`}>
      <span className="text-foreground">avali</span>
      <span className="text-gradient">AI</span>
    </div>
  );
}
