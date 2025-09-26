import { cn } from "@/lib/utils";
import icon from "../../assets/main/icon.png";

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

export const Logo = ({ className, showText = true, size = "md" }: LogoProps) => {
  const iconSizes = {
    sm: "h-8 w-8",
    md: "h-10 w-10", 
    lg: "h-12 w-12"
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl"
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Logo Icon - Orange square with "IQ" */}
      <div className={cn(
        "rounded-lg  flex items-center justify-center  font-bold",
        iconSizes[size],
        size === "sm" ? "text-sm" : size === "md" ? "text-base" : "text-lg"
      )}>
      <img src={icon} alt="" />
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <span className={cn("font-bold text-foreground leading-none", textSizes[size])}>
            IQARENA
          </span>
          <span className="text-xs text-muted-foreground leading-none">
            NSCET Quiz Platform
          </span>
        </div>
      )}
    </div>
  );
};