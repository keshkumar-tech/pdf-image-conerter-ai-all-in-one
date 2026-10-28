import React, { useEffect, useRef, useState } from "react";
import {
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { AppText } from "@/components/AppText";
import { useTheme } from "@/theme/ThemeProvider";
import type { Course } from "@/services/types";

const LOGO = require("../../../assets/splash-logo.jpg");
const SCREEN_WIDTH = Dimensions.get("window").width;
const SLIDE_WIDTH = SCREEN_WIDTH - 32;
const SLIDE_HEIGHT = 185;

interface CoursesBannerSliderProps {
  courses: Course[];
  onCoursePress: (course: Course) => void;
}

export function CoursesBannerSlider({
  courses,
  onCoursePress,
}: CoursesBannerSliderProps) {
  const { colors, brand, radius, resolved } = useTheme();
  const isDark = resolved === "dark";

  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const isUserScrolling = useRef(false);

  // Auto-scroll carousel every 4.5 seconds
  useEffect(() => {
    if (!courses || courses.length <= 1) return;

    const timer = setInterval(() => {
      if (isUserScrolling.current) return;
      setActiveIndex((prev) => {
        const nextIndex = (prev + 1) % courses.length;
        scrollRef.current?.scrollTo({
          x: nextIndex * SLIDE_WIDTH,
          animated: true,
        });
        return nextIndex;
      });
    }, 4500);

    return () => clearInterval(timer);
  }, [courses]);

  if (!courses || courses.length === 0) {
    return (
      <View
        style={[
          styles.fallbackBanner,
          {
            width: SLIDE_WIDTH,
            height: SLIDE_HEIGHT,
            backgroundColor: "#1B2B4B",
            borderRadius: radius.lg,
          },
        ]}
      >
        <Image
          source={LOGO}
          style={{ width: 75, height: 75, borderRadius: 37 }}
          resizeMode="cover"
        />
        <AppText
          style={{
            color: "#C9A227",
            fontWeight: "800",
            fontSize: 16,
            marginTop: 8,
          }}
        >
          Concept Builder Classes
        </AppText>
        <AppText
          style={{ color: "#fff", opacity: 0.85, marginTop: 4, fontSize: 12 }}
        >
          Build Concepts, Not Just Marks
        </AppText>
      </View>
    );
  }

  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffset = e.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffset / SLIDE_WIDTH);
    if (index >= 0 && index < courses.length) {
      setActiveIndex(index);
    }
    isUserScrolling.current = false;
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        decelerationRate="fast"
        snapToInterval={SLIDE_WIDTH}
        snapToAlignment="center"
        onScrollBeginDrag={() => {
          isUserScrolling.current = true;
        }}
        onMomentumScrollEnd={handleScrollEnd}
        contentContainerStyle={{ width: SLIDE_WIDTH * courses.length }}
      >
        {courses.map((course) => {
          const imageUri = course.banner_url || course.thumbnail_url;
          const hasImage = Boolean(imageUri);
          const isFree = course.is_free;
          const price =
            course.pricing_plan?.discount_price || course.pricing_plan?.price;
          const priceDisplay = isFree ? "FREE" : price ? `₹${price}` : "₹1,499";

          return (
            <Pressable
              key={course.id}
              onPress={() => onCoursePress(course)}
              style={[
                styles.slide,
                {
                  width: SLIDE_WIDTH,
                  height: SLIDE_HEIGHT,
                  borderRadius: radius.lg,
                },
              ]}
            >
              {/* Background Image / Banner */}
              <Image
                source={hasImage ? { uri: imageUri } : LOGO}
                style={styles.bannerImage}
                resizeMode={hasImage ? "cover" : "cover"}
              />

              {/* Dark Gradient Overlay for Contrast */}
              <View style={styles.gradientOverlay} />

              {/* Top Badges Row */}
              <View style={styles.topRow}>
                <View
                  style={[
                    styles.accessBadge,
                    {
                      backgroundColor: isFree ? "#12B76A" : "#1B2B4B",
                      borderColor: isFree ? "#12B76A" : brand.primary,
                    },
                  ]}
                >
                  <AppText style={styles.accessBadgeText}>
                    {isFree ? "🆓 FREE COURSE" : "💎 BATCH ENROLLMENT"}
                  </AppText>
                </View>

                {course.batch_name ? (
                  <View style={styles.batchTag}>
                    <AppText style={styles.batchTagText} numberOfLines={1}>
                      🌟 {course.batch_name}
                    </AppText>
                  </View>
                ) : (
                  <View style={styles.ratingTag}>
                    <AppText style={styles.ratingText}>
                      ⭐ {course.rating_average || "5.0"}
                    </AppText>
                  </View>
                )}
              </View>

              {/* Bottom Information */}
              <View style={styles.bottomContent}>
                <AppText style={styles.courseTitle} numberOfLines={2}>
                  {course.title}
                </AppText>

                <View style={styles.metaRow}>
                  <AppText style={styles.metaInstructor} numberOfLines={1}>
                    👨‍🏫 {course.instructor_name || "Concept Builder Faculty"}
                  </AppText>
                  <View style={styles.dot} />
                  <AppText style={styles.metaPrice}>{priceDisplay}</AppText>
                </View>

                <View style={styles.actionRow}>
                  <View
                    style={[styles.ctaPill, { backgroundColor: brand.primary }]}
                  >
                    <AppText style={styles.ctaText}>
                      {isFree ? "Start Free →" : "View & Enroll 🚀"}
                    </AppText>
                  </View>
                </View>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Pagination Indicator Dots */}
      {courses.length > 1 ? (
        <View style={styles.paginationRow}>
          {courses.map((c, i) => (
            <View
              key={c.id}
              style={[
                styles.dotIndicator,
                {
                  backgroundColor:
                    activeIndex === i ? brand.primary : colors.border,
                  width: activeIndex === i ? 18 : 6,
                },
              ]}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
  },
  slide: {
    overflow: "hidden",
    position: "relative",
    justifyContent: "space-between",
    padding: 14,
    backgroundColor: "#0B132B",
  },
  bannerImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(11, 19, 43, 0.65)",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 2,
  },
  accessBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  accessBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  batchTag: {
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    maxWidth: 160,
  },
  batchTagText: {
    color: "#F4EBFF",
    fontSize: 11,
    fontWeight: "700",
  },
  ratingTag: {
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  ratingText: {
    color: "#FDB022",
    fontSize: 11,
    fontWeight: "800",
  },
  bottomContent: {
    zIndex: 2,
    marginTop: "auto",
  },
  courseTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 22,
    marginBottom: 4,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  metaInstructor: {
    color: "rgba(255, 255, 255, 0.85)",
    fontSize: 12,
    fontWeight: "500",
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "rgba(255, 255, 255, 0.6)",
  },
  metaPrice: {
    color: "#34D399",
    fontSize: 12,
    fontWeight: "800",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  ctaPill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  ctaText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "800",
  },
  paginationRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 5,
    marginTop: 8,
  },
  dotIndicator: {
    height: 6,
    borderRadius: 3,
  },
  fallbackBanner: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginBottom: 14,
  },
});
