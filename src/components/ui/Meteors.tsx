import { cn } from "@/lib/utils";

export const Meteors = ({ number, className }: { number?: number; className?: string }) => {
  const meteors = new Array(number || 30).fill(true);

  const getRandomColor = () => {
    const colors = [
      "#ff073a",
      "#f5b700",
      "#08f7fe",
      "#fe53bb",
      "#00ff85",
      "#f5d300",
      "#ff2281",
      "#faff00",
      "#00f0ff",
      "#6effe8",
      "#ff00e4",
      "#f500ff",
      "#ff7b00",
      "#0091ff",
      "#65ff00",
      "#d100ff",
      "#ff8a00",
      "#d7ff00",
      "#00c2ff",
      "#ff2965",
      "#00ff9f",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const generateStyle = () => {
    const color = getRandomColor();
    return {
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * (0.8 - 0.2) + 0.2}s`,
      animationDuration: `${Math.random() * (10 - 2) + 2}s`,
      backgroundColor: color,
      "--meteor-color": color,
      boxShadow: `0 0 4px 1px ${color}, 0 0 3px 1px ${color}`,
    };
  };

  return (
    <>
      {meteors.map((el, idx) => (
        <span
          key={"meteor" + idx}
          className={cn(
            "animate-meteor-effect absolute h-1 w-1 rounded-full shadow-md rotate-[215deg]",
            "before:content-[''] before:absolute before:top-1/2 before:transform before:-translate-y-[50%] before:w-[75px] before:h-[2px] before:bg-gradient-to-r before:from-[var(--meteor-color)] before:to-transparent",
            className
          )}
          style={generateStyle()}
        ></span>
      ))}
    </>
  );
};
