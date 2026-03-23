import React, { useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useSettingsStore } from '../store/useSettingsStore';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/ui/sidebar';
import { Store, Library, Settings, Rocket, Package } from 'lucide-react';

type Page = 'store' | 'library' | 'settings' | 'publish';

interface NavItem {
  id: Page;
  label: string;
  icon: React.ElementType;
  publisherOnly?: boolean;
}

const navItems: NavItem[] = [
  { id: 'store', label: 'Store', icon: Store },
  { id: 'library', label: 'Library', icon: Library },
  { id: 'publish', label: 'Publish', icon: Rocket, publisherOnly: true },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function AppSidebar(): React.ReactElement {
  const activePage = useAppStore((s) => s.activePage);
  const setActivePage = useAppStore((s) => s.setActivePage);
  const publisherMode = useSettingsStore((s) => s.publisherMode);

  const filteredNavItems = useMemo(
    () => navItems.filter((item) => !item.publisherOnly || publisherMode),
    [publisherMode]
  );

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-sidebar">
      <SidebarHeader className="h-14 flex items-center px-4 border-b border-border">
        <div className="flex items-center gap-2 font-semibold text-lg">
          <div className="size-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
            <Package className="size-5" />
          </div>
          <span className="group-data-[collapsible=icon]:hidden">VibeDepot</span>
        </div>
      </SidebarHeader>
      <SidebarContent className="py-4">
        <SidebarGroup>
          <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredNavItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activePage === item.id}
                    onClick={() => setActivePage(item.id)}
                    tooltip={item.label}
                    className={`transition-all duration-200 ${
                      activePage === item.id
                        ? 'bg-accent text-accent-foreground font-medium'
                        : 'hover:bg-accent/50 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <item.icon className="size-5" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-border">
        <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold group-data-[collapsible=icon]:hidden">
          VibeDepot v0.1.0
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
