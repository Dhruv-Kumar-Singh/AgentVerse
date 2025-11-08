import { useState } from "react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Settings, LogOut, Bell, Moon, Sun, Volume2, VolumeX, Shield, HelpCircle } from "lucide-react";
import { useLocation } from "wouter";

export default function SettingsMenu() {
  const [, setLocation] = useLocation();
  const [notifications, setNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const handleLogout = () => {
    setLocation("/");
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" data-testid="button-settings">
          <Settings className="w-5 h-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Settings</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuCheckboxItem
          checked={notifications}
          onCheckedChange={setNotifications}
          data-testid="settings-notifications"
        >
          <Bell className="w-4 h-4 mr-2" />
          Notifications
        </DropdownMenuCheckboxItem>

        <DropdownMenuCheckboxItem
          checked={soundEffects}
          onCheckedChange={setSoundEffects}
          data-testid="settings-sound"
        >
          {soundEffects ? (
            <Volume2 className="w-4 h-4 mr-2" />
          ) : (
            <VolumeX className="w-4 h-4 mr-2" />
          )}
          Sound Effects
        </DropdownMenuCheckboxItem>

        <DropdownMenuCheckboxItem
          checked={darkMode}
          onCheckedChange={toggleDarkMode}
          data-testid="settings-dark-mode"
        >
          {darkMode ? (
            <Moon className="w-4 h-4 mr-2" />
          ) : (
            <Sun className="w-4 h-4 mr-2" />
          )}
          Dark Mode
        </DropdownMenuCheckboxItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem data-testid="settings-privacy">
          <Shield className="w-4 h-4 mr-2" />
          Privacy & Security
        </DropdownMenuItem>

        <DropdownMenuItem data-testid="settings-help">
          <HelpCircle className="w-4 h-4 mr-2" />
          Help & Support
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogout}
          className="text-destructive focus:text-destructive focus:bg-destructive/10"
          data-testid="button-logout"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
