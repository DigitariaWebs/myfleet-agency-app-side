import { Tabs } from "expo-router";
import {
  LayoutDashboard,
  Car,
  ScanLine,
  CalendarDays,
  Menu,
} from "lucide-react-native";
import React from "react";
import { useTranslation } from "react-i18next";

import { TabBar, type TabItem } from "@/components/ui/TabBar";
import { useTheme } from "@/hooks/useTheme";

export default function AppLayout() {
  const theme = useTheme();
  const { t } = useTranslation();

  const tabs: TabItem[] = [
    { name: "(home)", label: t("tabs.dashboard"), icon: LayoutDashboard },
    { name: "(fleet)", label: t("tabs.fleet"), icon: Car },
    { name: "(inspections)", label: t("inspection.title"), icon: ScanLine },
    { name: "(bookings)", label: t("tabs.bookings"), icon: CalendarDays },
    { name: "(more)", label: t("tabs.more"), icon: Menu },
  ];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => (
        <TabBar
          tabs={tabs}
          activeTab={props.state.routes[props.state.index].name}
          onTabPress={(name) => {
            const route = props.state.routes.find((r) => r.name === name);
            if (route) {
              props.navigation.navigate(route.name);
            }
          }}
        />
      )}
    >
      <Tabs.Screen name="(home)" />
      <Tabs.Screen name="(fleet)" />
      <Tabs.Screen name="(inspections)" />
      <Tabs.Screen name="(bookings)" />
      <Tabs.Screen name="(more)" />
    </Tabs>
  );
}
