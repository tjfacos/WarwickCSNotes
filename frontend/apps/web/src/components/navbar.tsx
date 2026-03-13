import { Link, useLocation } from "react-router-dom";
import { useTheme } from "./theme-provider";
import { Button } from "@workspace/ui/components/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@workspace/ui/components/dropdown-menu";
import { ChevronDown } from "lucide-react";

export function Navbar() {
  const { setTheme } = useTheme();
  const location = useLocation();

  return (
    <nav className="border-b bg-background p-4">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-primary text-xl">
          <span className="dragon-logo text-2xl">🐉</span>
          <span className="haskell-logo text-2xl">λ</span>
          Warwick CS Notes
        </Link>

        <div className="flex items-center gap-2">
          {[1, 2, 3].map((year) => {
            const onYearPath = location.pathname.startsWith(`/year/${year}`);
            const onModuleOrNote = location.pathname.startsWith('/module/') || location.pathname.startsWith('/notes/');
            const lastYear = onModuleOrNote ? localStorage.getItem('last-year') : null;
            const active = onYearPath || (onModuleOrNote && lastYear === String(year));
            return (
              <Link
                key={year}
                to={`/year/${year}`}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
              >
                Year {year}
              </Link>
            );
          })}

          <Link
            to="/acknowledgements"
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              location.pathname === '/acknowledgements'
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            }`}
          >
            Credits
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="cursor-pointer gap-1 hover:bg-muted ml-2">
                Theme <ChevronDown className="h-3 w-3 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>Light</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>Dark</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("ifykyk")}>🐉 ifykyk</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("cs141")}>λ 141</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
}
