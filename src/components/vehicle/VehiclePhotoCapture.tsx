import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from "react";
import {
  View,
  Pressable,
  Modal,
  Dimensions,
  StyleSheet,
  Alert,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Image } from "@/components/ui/Image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { X, RotateCcw, Check, Eye, EyeOff } from "lucide-react-native";

import { Text } from "@/components/ui/Text";
import { useTheme } from "@/hooks/useTheme";
import { fontFamilies } from "@/theme/typography";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const ANGLES = [
  {
    key: "front",
    label: "Front",
    overlay: require("../../../assets/car-angles/front.png"),
    mirror: false,
  },
  {
    key: "front-right",
    label: "Front-Right",
    overlay: require("../../../assets/car-angles/front-right.png"),
    mirror: false,
  },
  {
    key: "right",
    label: "Right Side",
    overlay: require("../../../assets/car-angles/right-side.png"),
    mirror: false,
  },
  {
    key: "rear-right",
    label: "Rear-Right",
    overlay: require("../../../assets/car-angles/rear-right.png"),
    mirror: false,
  },
  {
    key: "rear",
    label: "Rear",
    overlay: require("../../../assets/car-angles/rear.png"),
    mirror: false,
  },
  {
    key: "rear-left",
    label: "Rear-Left",
    overlay: require("../../../assets/car-angles/rear-right.png"),
    mirror: true,
  },
  {
    key: "left",
    label: "Left Side",
    overlay: require("../../../assets/car-angles/right-side.png"),
    mirror: true,
  },
  {
    key: "front-left",
    label: "Front-Left",
    overlay: require("../../../assets/car-angles/front-right.png"),
    mirror: true,
  },
];

// ── Types ────────────────────────────────────────────────────────────────────

export interface CapturedVehiclePhoto {
  angle: string;
  uri: string;
}

interface VehiclePhotoCaptureProps {
  visible: boolean;
  onClose: () => void;
  onComplete: (photos: CapturedVehiclePhoto[]) => void;
  /**
   * Fired immediately when the user accepts a freshly captured photo
   * (Keep). Lets the parent kick off background uploads per-photo.
   */
  onPhotoKept?: (photo: CapturedVehiclePhoto) => void;
  existingPhotos?: CapturedVehiclePhoto[];
  focusAngle?: string;
}

type Phase = "existing-review" | "capture" | "review";

// ── Component ────────────────────────────────────────────────────────────────

export function VehiclePhotoCapture({
  visible,
  onClose,
  onComplete,
  onPhotoKept,
  existingPhotos = [],
  focusAngle,
}: VehiclePhotoCaptureProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("capture");
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [photos, setPhotos] = useState<CapturedVehiclePhoto[]>([]);
  const [processedAngleKeys, setProcessedAngleKeys] = useState<Set<string>>(
    new Set(),
  );
  const [showOverlay, setShowOverlay] = useState(true);

  // Derive current angle and whether it has an existing photo
  const currentAngle = ANGLES[currentIndex];
  const existingPhotoForCurrentAngle = useMemo(
    () => photos.find((p) => p.angle === currentAngle?.key),
    [photos, currentAngle],
  );
  const isLastAngle = currentIndex === ANGLES.length - 1;

  // Reset / seed state when modal opens. Only depend on `visible` + a
  // derived key so parent re-renders that produce a new `existingPhotos`
  // array identity don't blow away in-progress capture state.
  const existingPhotosKey = useMemo(
    () => existingPhotos.map((p) => `${p.angle}:${p.uri}`).join("|"),
    [existingPhotos],
  );
  const existingPhotosRef = useRef(existingPhotos);
  existingPhotosRef.current = existingPhotos;

  useEffect(() => {
    if (!visible) return;
    const seeded = [...existingPhotosRef.current];
    setPhotos(seeded);
    setCapturedUri(null);
    setShowOverlay(true);
    setProcessedAngleKeys(new Set());

    if (focusAngle) {
      const focusIndex = ANGLES.findIndex((a) => a.key === focusAngle);
      if (focusIndex !== -1) {
        const hasExisting = seeded.some((p) => p.angle === focusAngle);
        setCurrentIndex(focusIndex);
        setPhase(hasExisting ? "existing-review" : "capture");
        return;
      }
    }

    const firstUnprocessed = ANGLES.findIndex(
      (a) => !seeded.some((p) => p.angle === a.key),
    );
    if (firstUnprocessed === -1) {
      setCurrentIndex(0);
      setPhase("existing-review");
    } else {
      setCurrentIndex(firstUnprocessed);
      setPhase("capture");
    }
  }, [visible, existingPhotosKey, focusAngle]);

  // Advance to next angle that needs attention
  const advanceToNext = useCallback(
    (
      fromIndex: number,
      currentPhotos: CapturedVehiclePhoto[],
      processed: Set<string>,
    ) => {
      for (let i = fromIndex + 1; i < ANGLES.length; i++) {
        const angle = ANGLES[i];
        const hasExisting = currentPhotos.some((p) => p.angle === angle.key);
        if (!hasExisting) {
          setCurrentIndex(i);
          setPhase("capture");
          return;
        }
        if (!processed.has(angle.key)) {
          setCurrentIndex(i);
          setPhase("existing-review");
          return;
        }
      }
      // All done
      onComplete(currentPhotos);
      onClose();
    },
    [onComplete, onClose],
  );

  const handleDismiss = useCallback(() => {
    // Closing the X discards any in-review capture; only the explicit
    // "Keep" button commits a photo (it has already fired onPhotoKept).
    onComplete([]);
    onClose();
  }, [onComplete, onClose]);

  // ── Existing photo review (Keep / Retake) ─────────────────────────────────

  const handleKeepExisting = useCallback(() => {
    if (!currentAngle) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const nextProcessed = new Set(processedAngleKeys);
    nextProcessed.add(currentAngle.key);
    setProcessedAngleKeys(nextProcessed);

    if (isLastAngle) {
      onComplete(photos);
      onClose();
    } else {
      advanceToNext(currentIndex, photos, nextProcessed);
    }
  }, [
    currentAngle,
    processedAngleKeys,
    photos,
    isLastAngle,
    currentIndex,
    advanceToNext,
    onComplete,
    onClose,
  ]);

  const handleRetakeExisting = useCallback(() => {
    if (!currentAngle) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPhotos((prev) => prev.filter((p) => p.angle !== currentAngle.key));
    setPhase("capture");
  }, [currentAngle]);

  // ── Capture ───────────────────────────────────────────────────────────────

  const handleCapture = useCallback(async () => {
    if (!cameraRef.current) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.9 });
      if (photo?.uri) {
        setCapturedUri(photo.uri);
        setPhase("review");
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Unknown error";
      Alert.alert("Couldn't capture photo", message);
    }
  }, []);

  // ── Review (after capture) ────────────────────────────────────────────────

  const handleRetake = useCallback(() => {
    setCapturedUri(null);
    setPhase("capture");
    setShowOverlay(true);
  }, []);

  const handleKeep = useCallback(() => {
    if (!capturedUri || !currentAngle) return;
    const newPhoto: CapturedVehiclePhoto = {
      angle: currentAngle.key,
      uri: capturedUri,
    };
    const updated = photos
      .filter((p) => p.angle !== currentAngle.key)
      .concat(newPhoto);
    setPhotos(updated);
    setCapturedUri(null);
    setShowOverlay(true);
    onPhotoKept?.(newPhoto);

    const nextProcessed = new Set(processedAngleKeys);
    nextProcessed.add(currentAngle.key);
    setProcessedAngleKeys(nextProcessed);

    if (isLastAngle) {
      onComplete(updated);
      onClose();
    } else {
      advanceToNext(currentIndex, updated, nextProcessed);
    }
  }, [
    capturedUri,
    currentAngle,
    photos,
    processedAngleKeys,
    isLastAngle,
    currentIndex,
    advanceToNext,
    onComplete,
    onClose,
    onPhotoKept,
  ]);

  // ── Permission gate ───────────────────────────────────────────────────────

  if (!permission) {
    return (
      <Modal visible={visible} animationType="fade" statusBarTranslucent>
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: "#000",
              justifyContent: "center",
              alignItems: "center",
              padding: 24,
            },
          ]}
        >
          <Text variant="bodyMedium" color="#fff" align="center">
            Checking camera permission...
          </Text>
        </View>
      </Modal>
    );
  }

  if (!permission.granted) {
    return (
      <Modal visible={visible} animationType="fade" statusBarTranslucent>
        <View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor: "#000",
              justifyContent: "center",
              alignItems: "center",
              padding: 24,
            },
          ]}
        >
          <Text
            variant="headlineSmall"
            color="#fff"
            align="center"
            style={{ marginBottom: 12 }}
          >
            Camera access required
          </Text>
          <Text
            variant="bodyMedium"
            color="rgba(255,255,255,0.7)"
            align="center"
            style={{ marginBottom: 24 }}
          >
            Please allow camera access to take guided vehicle photos.
          </Text>
          <Pressable
            onPress={requestPermission}
            style={{
              backgroundColor: theme.accent,
              paddingHorizontal: 28,
              paddingVertical: 12,
              borderRadius: 9999,
            }}
          >
            <Text
              variant="bodyMedium"
              color="#fff"
              style={{ fontFamily: fontFamilies.semiBold }}
            >
              Grant Permission
            </Text>
          </Pressable>
          <Pressable onPress={handleDismiss} style={{ marginTop: 16 }}>
            <Text variant="bodyMedium" color="rgba(255,255,255,0.5)">
              Cancel
            </Text>
          </Pressable>
        </View>
      </Modal>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const showExistingReview =
    phase === "existing-review" && existingPhotoForCurrentAngle;

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: "#000" }}>
        {/* Background: camera or captured image or existing image */}
        {showExistingReview ? (
          <Image
            source={{ uri: existingPhotoForCurrentAngle.uri }}
            style={{ flex: 1 }}
            contentFit="cover"
          />
        ) : phase === "capture" ? (
          <CameraView
            ref={cameraRef}
            style={{ flex: 1 }}
            facing="back"
            mode="picture"
          />
        ) : (
          <Image
            source={{ uri: capturedUri! }}
            style={{ flex: 1 }}
            contentFit="cover"
          />
        )}

        {/* Overlay guide (capture always, review toggleable, existing-review always) */}
        {currentAngle &&
          (phase === "capture" ||
            (phase === "review" && showOverlay) ||
            showExistingReview) && (
            <Animated.View
              entering={FadeIn.duration(200)}
              exiting={FadeOut.duration(200)}
              style={[
                StyleSheet.absoluteFill,
                { justifyContent: "center", alignItems: "center" },
              ]}
              pointerEvents="none"
            >
              <Image
                source={currentAngle.overlay}
                style={{
                  width: SCREEN_WIDTH * 0.85,
                  height: SCREEN_HEIGHT * 0.45,
                  transform: currentAngle.mirror ? [{ scaleX: -1 }] : undefined,
                }}
                contentFit="contain"
              />
            </Animated.View>
          )}

        {/* Top bar */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            paddingTop: insets.top + 12,
            paddingHorizontal: 16,
            paddingBottom: 12,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Pressable
            onPress={handleDismiss}
            hitSlop={10}
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: "rgba(0,0,0,0.45)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <X size={20} color="#fff" strokeWidth={2.5} />
          </Pressable>

          <View style={{ alignItems: "center" }}>
            <Text
              variant="bodyMedium"
              color="#fff"
              style={{ fontFamily: fontFamilies.semiBold, fontSize: 15 }}
            >
              {currentAngle.label}
            </Text>
            <Text
              variant="caption"
              color="rgba(255,255,255,0.7)"
              style={{ fontSize: 12, marginTop: 2 }}
            >
              {currentIndex + 1} / {ANGLES.length}
            </Text>
          </View>

          <View style={{ width: 40 }} />
        </View>

        {/* Angle progress dots */}
        <View
          style={{
            position: "absolute",
            top: insets.top + 64,
            left: 0,
            right: 0,
            flexDirection: "row",
            justifyContent: "center",
            gap: 6,
          }}
        >
          {ANGLES.map((angle, i) => {
            const hasPhoto = photos.some((p) => p.angle === angle.key);
            const isProcessed = processedAngleKeys.has(angle.key);
            const isCurrent = i === currentIndex;
            return (
              <View
                key={i}
                style={{
                  width: isCurrent ? 18 : 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: isCurrent
                    ? "#fff"
                    : isProcessed || hasPhoto
                      ? "rgba(255,255,255,0.6)"
                      : "rgba(255,255,255,0.25)",
                }}
              />
            );
          })}
        </View>

        {/* Bottom controls */}
        <View
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            paddingBottom: insets.bottom + 24,
            paddingHorizontal: 24,
            alignItems: "center",
          }}
        >
          {showExistingReview ? (
            /* Existing photo: Keep / Retake */
            <View style={{ width: "100%", gap: 12 }}>
              <View
                style={{
                  flexDirection: "row",
                  gap: 12,
                  justifyContent: "center",
                }}
              >
                <Pressable
                  onPress={handleRetakeExisting}
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    paddingVertical: 14,
                    borderRadius: 16,
                    backgroundColor: "rgba(0,0,0,0.45)",
                  }}
                >
                  <RotateCcw size={18} color="#fff" />
                  <Text
                    variant="bodyMedium"
                    color="#fff"
                    style={{ fontFamily: fontFamilies.semiBold }}
                  >
                    Retake
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleKeepExisting}
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    paddingVertical: 14,
                    borderRadius: 16,
                    backgroundColor: theme.accent,
                  }}
                >
                  <Check size={18} color="#fff" />
                  <Text
                    variant="bodyMedium"
                    color="#fff"
                    style={{ fontFamily: fontFamilies.semiBold }}
                  >
                    {isLastAngle ? "Done" : "Next"}
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : phase === "capture" ? (
            /* Capture button */
            <Pressable
              onPress={handleCapture}
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: "#fff",
                borderWidth: 4,
                borderColor: "rgba(255,255,255,0.35)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <View
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 30,
                  backgroundColor: "#fff",
                }}
              />
            </Pressable>
          ) : (
            /* Review controls */
            <View style={{ width: "100%", gap: 12 }}>
              <Pressable
                onPress={() => setShowOverlay((prev) => !prev)}
                style={{
                  alignSelf: "center",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 6,
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 9999,
                  backgroundColor: "rgba(0,0,0,0.45)",
                }}
              >
                {showOverlay ? (
                  <Eye size={16} color="#fff" />
                ) : (
                  <EyeOff size={16} color="#fff" />
                )}
                <Text variant="labelSmall" color="#fff">
                  {showOverlay ? "Outline on" : "Outline off"}
                </Text>
              </Pressable>

              <View
                style={{
                  flexDirection: "row",
                  gap: 12,
                  justifyContent: "center",
                }}
              >
                <Pressable
                  onPress={handleRetake}
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    paddingVertical: 14,
                    borderRadius: 16,
                    backgroundColor: "rgba(0,0,0,0.45)",
                  }}
                >
                  <RotateCcw size={18} color="#fff" />
                  <Text
                    variant="bodyMedium"
                    color="#fff"
                    style={{ fontFamily: fontFamilies.semiBold }}
                  >
                    Retake
                  </Text>
                </Pressable>

                <Pressable
                  onPress={handleKeep}
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    paddingVertical: 14,
                    borderRadius: 16,
                    backgroundColor: theme.accent,
                  }}
                >
                  <Check size={18} color="#fff" />
                  <Text
                    variant="bodyMedium"
                    color="#fff"
                    style={{ fontFamily: fontFamilies.semiBold }}
                  >
                    {isLastAngle ? "Done" : "Next"}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
