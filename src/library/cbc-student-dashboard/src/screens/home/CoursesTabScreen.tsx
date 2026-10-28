import { useEffect, useState } from "react";

import { FlatList, Pressable, StyleSheet, View } from "react-native";

import type { CompositeScreenProps } from "@react-navigation/native";

import type { BottomTabScreenProps } from "@react-navigation/bottom-tabs";

import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { AppText } from "@/components/AppText";

import { CourseListCard } from "@/components/courses/CourseListCard";

import { EmptyCatalogState } from "@/components/catalog/EmptyCatalogState";

import { Screen } from "@/components/Screen";

import { LoadingState, ErrorState } from "@/components/StatusStates";

import { useTheme } from "@/theme/ThemeProvider";

import { coursesApi } from "@/services/resources";

import { filterCoursesByClass, useStudentClassStore } from "@/store/studentClassStore";

import { notificationsApi } from "@/services/resources";

import type { Course, NotificationItem } from "@/services/types";

import type { MainTabParamList, RootStackParamList } from "@/navigation/types";



type Props = CompositeScreenProps<

  BottomTabScreenProps<MainTabParamList, "CoursesTab">,

  NativeStackScreenProps<RootStackParamList>

>;



type TabKey = "courses" | "test-series";



export default function CoursesTabScreen({ navigation }: Props) {

  const { colors, radius } = useTheme();

  const selectedClass = useStudentClassStore((s) => s.selectedClass);

  const [activeTab, setActiveTab] = useState<TabKey>("courses");

  const [courses, setCourses] = useState<Course[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    notificationsApi.list()
      .then((res) => {
        const unread = (res.results ?? []).filter((n: NotificationItem) => !n.is_read).length;
        setUnreadNotifications(unread);
      })
      .catch(() => {});
  }, []);



  const load = () => {

    setIsLoading(true);

    setError(null);

    coursesApi.list({ is_published: true })

      .then((res) => setCourses(filterCoursesByClass(res.results, selectedClass)))

      .catch(() => setError("Couldn't load courses."))

      .finally(() => setIsLoading(false));

  };



  useEffect(load, [selectedClass]);



  return (

    <Screen padded={false} scroll={false}>

      <View style={[styles.topBar, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}>

        <Pressable onPress={() => navigation.navigate("SelectCategory")} style={[styles.classPill, { borderColor: colors.border, borderRadius: radius.pill }]}>

          <AppText style={{ fontWeight: "700", fontSize: 13 }}>{selectedClass}</AppText>

          <AppText style={{ fontSize: 10, marginLeft: 4 }}>▼</AppText>

        </Pressable>

        <Pressable onPress={() => navigation.navigate("Notifications")} style={styles.iconBtn} hitSlop={8}>
          {unreadNotifications > 0 && (
            <View style={styles.badge}>
              <AppText style={styles.badgeText}>{unreadNotifications > 99 ? "99+" : unreadNotifications}</AppText>
            </View>
          )}
          <AppText style={{ fontSize: 20 }}>🔔</AppText>
        </Pressable>

      </View>



      <View style={styles.tabRow}>

        {(["courses", "test-series"] as TabKey[]).map((tab) => (

          <Pressable

            key={tab}

            onPress={() => setActiveTab(tab)}

            style={[

              styles.tab,

              { borderRadius: radius.pill },

              activeTab === tab ? { backgroundColor: "#1B2B4B" } : { backgroundColor: colors.border },

            ]}

          >

            <AppText style={{ fontWeight: "700", color: activeTab === tab ? "#fff" : colors.muted, fontSize: 13 }}>

              {tab === "courses" ? "Courses" : "Test Series"}

            </AppText>

          </Pressable>

        ))}

      </View>



      {activeTab === "test-series" ? (

        <EmptyCatalogState message="No any test series available" />

      ) : isLoading ? (

        <LoadingState label="Loading courses..." />

      ) : error ? (

        <ErrorState message={error} onRetry={load} />

      ) : courses.length === 0 ? (

        <EmptyCatalogState message="No any course available" />

      ) : (

        <FlatList

          style={{ flex: 1, backgroundColor: "#F2F4F7" }}

          contentContainerStyle={styles.list}

          data={courses}

          keyExtractor={(c) => c.id}

          showsVerticalScrollIndicator={false}

          renderItem={({ item }) => (

            <CourseListCard

              course={item}

              variant="tab"

              onPress={() => navigation.navigate("CourseDetails", { courseId: item.id })}

            />

          )}

        />

      )}

    </Screen>

  );

}



const styles = StyleSheet.create({

  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },

  classPill: { flexDirection: "row", alignItems: "center", borderWidth: 1, paddingHorizontal: 14, paddingVertical: 6 },

  tabRow: { flexDirection: "row", gap: 10, paddingHorizontal: 16, paddingVertical: 14, backgroundColor: "#fff" },

  tab: { paddingHorizontal: 22, paddingVertical: 10 },

  list: { paddingTop: 4, paddingBottom: 24 },
  iconBtn: { width: 36, alignItems: "center", position: "relative" },
  badge: { position: "absolute", top: -4, right: -4, backgroundColor: "#EF4444", borderRadius: 10, minWidth: 18, height: 18, alignItems: "center", justifyContent: "center", paddingHorizontal: 4 },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "800" },

});


