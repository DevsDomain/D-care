/**
 * Bottom Navigation Component
 * Mobile-first navigation bar for the D-care app
 */

import { Home, Search, Calendar, UserCog, BotMessageSquare } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/stores/appStore';


interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  roles?: ('FAMILY' | 'CAREGIVER')[];
}

const navItems: NavItem[] = [
  {
    id: 'home',
    label: 'Início',
    icon: Home,
    path: '/',
  },
  {
    id: 'search',
    label: 'Buscar',
    icon: Search,
    path: '/search',
    roles: ['FAMILY'],
  },
  {
    id: 'bookings',
    label: 'Agendamentos',
    icon: Calendar,
    path: '/bookings',
    roles: ['FAMILY'],
  },
  {
    id: 'guide',
    label: 'Guia IA',
    icon: BotMessageSquare,
    path: '/guide',
  },
  {
    id: 'profile',
    label: 'Perfil',
    icon: UserCog,
    path: '/profile',
  },
];

export function BottomNavigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const userRole = useAppStore((state) => state.userRole);

  // Filter navigation items based on user role
  const filteredNavItems = navItems.filter(item => 
    !item.roles || item.roles.includes(userRole || 'FAMILY')
  );

  const handleNavClick = (path: string) => {
    navigate(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border safe-area-pb">
      <div className="flex items-center justify-around px-2 py-2">
        {filteredNavItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/' && location.pathname.startsWith(item.path));
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.path)}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-xl touch-target transition-all duration-200",
                "hover:bg-healthcare-soft/50 active:scale-95",
                isActive && "bg-healthcare-soft text-healthcare-dark"
              )}
            >
              <div className={cn(
                "p-1 rounded-lg transition-colors",
                isActive && "bg-healthcare-light text-white"
              )}>
                <Icon className={cn(
                  "w-5 h-5 transition-colors",
                  isActive 
                    ? "text-white" 
                    : "text-muted-foreground group-hover:text-healthcare-dark"
                )} />
              </div>
              <span className={cn(
                "text-xs font-medium transition-colors",
                isActive 
                  ? "text-healthcare-dark" 
                  : "text-muted-foreground"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// Add safe area padding for mobile devices
const globalStyles = `
  .safe-area-pb {
    padding-bottom: max(8px, env(safe-area-inset-bottom));
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = globalStyles;
  document.head.appendChild(styleElement);
}