import { useMemo, useState } from "react";
import {
  FlatList,
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { askLLM } from "./services/ollama";

type Occasion =
  | "Wedding"
  | "Pre-Wedding"
  | "Baby Shower"
  | "Real Estate"
  | "Portraits"
  | "Events";

type ScreenStep = "HOME" | "PHOTOGRAPHERS";

type Photographer = {
  id: string;
  name: string;
  specialty: Occasion;
  location: string;
  phone: string;
  startingPrice: string;
  rating: number;
  availability: string;
  responseTime: string;
};

export default function HomeScreen() {
  const [step, setStep] = useState<ScreenStep>("HOME");
  const [showOccasionModal, setShowOccasionModal] = useState(false);
  const [selectedOccasion, setSelectedOccasion] = useState<Occasion | null>(null);
  const [selectedPhotographer, setSelectedPhotographer] = useState<Photographer | null>(null);

  // AI states
  const [aiLoading, setAiLoading] = useState(false);
  const [aiReply, setAiReply] = useState<string>("");
  const [showAiModal, setShowAiModal] = useState(false);

  const occasions: Occasion[] = [
    "Wedding",
    "Pre-Wedding",
    "Baby Shower",
    "Real Estate",
    "Portraits",
    "Events",
  ];

  const photographers: Photographer[] = [
    { id: "w1", name: "Aanya Studios", specialty: "Wedding", location: "Ottawa", phone: "613-555-0123", startingPrice: "$350", rating: 4.8, availability: "Weekends", responseTime: "Under 1 hour" },
    { id: "w2", name: "Royal Knot Photography", specialty: "Wedding", location: "Toronto", phone: "647-555-0188", startingPrice: "$420", rating: 4.7, availability: "Weekends + weekdays", responseTime: "Same day" },
    { id: "w3", name: "Sacred Vows Studio", specialty: "Wedding", location: "Mississauga", phone: "905-555-7722", startingPrice: "$380", rating: 4.6, availability: "Weekends", responseTime: "Under 2 hours" },
    { id: "w4", name: "EverAfter Moments", specialty: "Wedding", location: "Brampton", phone: "289-555-4410", startingPrice: "$400", rating: 4.9, availability: "Weekends", responseTime: "Under 1 hour" },
    { id: "w5", name: "True Love Frames", specialty: "Wedding", location: "Ottawa", phone: "613-555-0991", startingPrice: "$360", rating: 4.5, availability: "Weekends", responseTime: "Same day" },

    { id: "pw1", name: "Candid Vows", specialty: "Pre-Wedding", location: "Ottawa", phone: "613-555-9911", startingPrice: "$280", rating: 4.7, availability: "Weekdays", responseTime: "Under 2 hours" },
    { id: "pw2", name: "LoveStory Studio", specialty: "Pre-Wedding", location: "Toronto", phone: "416-555-8833", startingPrice: "$300", rating: 4.6, availability: "Weekdays + weekends", responseTime: "Same day" },
    { id: "pw3", name: "Promise Frames", specialty: "Pre-Wedding", location: "Scarborough", phone: "416-555-1200", startingPrice: "$290", rating: 4.5, availability: "Weekdays", responseTime: "Under 3 hours" },
    { id: "pw4", name: "The Couple Lens", specialty: "Pre-Wedding", location: "Mississauga", phone: "905-555-3400", startingPrice: "$320", rating: 4.8, availability: "Weekends", responseTime: "Under 1 hour" },
    { id: "pw5", name: "Forever Focus", specialty: "Pre-Wedding", location: "Ottawa", phone: "613-555-7711", startingPrice: "$310", rating: 4.7, availability: "Weekdays + weekends", responseTime: "Same day" },

    { id: "bs1", name: "Bloom Frames", specialty: "Baby Shower", location: "Gatineau", phone: "819-555-2233", startingPrice: "$220", rating: 4.6, availability: "Weekends", responseTime: "Under 2 hours" },
    { id: "bs2", name: "Tiny Toes Studio", specialty: "Baby Shower", location: "Ottawa", phone: "613-555-6677", startingPrice: "$240", rating: 4.8, availability: "Weekends", responseTime: "Under 1 hour" },
    { id: "bs3", name: "Little Moments Co.", specialty: "Baby Shower", location: "Nepean", phone: "613-555-4450", startingPrice: "$230", rating: 4.5, availability: "Weekends", responseTime: "Same day" },
    { id: "bs4", name: "Sweet Beginnings", specialty: "Baby Shower", location: "Kanata", phone: "613-555-3199", startingPrice: "$250", rating: 4.7, availability: "Weekends", responseTime: "Under 2 hours" },
    { id: "bs5", name: "Baby Bloom Photos", specialty: "Baby Shower", location: "Ottawa", phone: "613-555-5521", startingPrice: "$225", rating: 4.6, availability: "Weekdays + weekends", responseTime: "Same day" },

    { id: "re1", name: "Urban Lens", specialty: "Real Estate", location: "Toronto", phone: "416-555-9090", startingPrice: "$300", rating: 4.7, availability: "Weekdays", responseTime: "Under 1 hour" },
    { id: "re2", name: "Prime Property Visuals", specialty: "Real Estate", location: "Mississauga", phone: "905-555-3344", startingPrice: "$350", rating: 4.8, availability: "Weekdays", responseTime: "Same day" },
    { id: "re3", name: "EstateView Media", specialty: "Real Estate", location: "Oakville", phone: "905-555-6111", startingPrice: "$340", rating: 4.6, availability: "Weekdays", responseTime: "Under 2 hours" },
    { id: "re4", name: "HomeSnap Studio", specialty: "Real Estate", location: "Burlington", phone: "905-555-7001", startingPrice: "$320", rating: 4.5, availability: "Weekdays", responseTime: "Same day" },
    { id: "re5", name: "Property Pixel Co.", specialty: "Real Estate", location: "Toronto", phone: "416-555-7781", startingPrice: "$330", rating: 4.7, availability: "Weekdays", responseTime: "Under 2 hours" },

    { id: "pt1", name: "Noor Portraits", specialty: "Portraits", location: "Montreal", phone: "514-555-2000", startingPrice: "$200", rating: 4.7, availability: "Weekends", responseTime: "Same day" },
    { id: "pt2", name: "Urban Face Studio", specialty: "Portraits", location: "Ottawa", phone: "613-555-2200", startingPrice: "$220", rating: 4.8, availability: "Weekdays + weekends", responseTime: "Under 1 hour" },
    { id: "pt3", name: "Pure Portrait Co.", specialty: "Portraits", location: "Laval", phone: "450-555-2100", startingPrice: "$210", rating: 4.6, availability: "Weekends", responseTime: "Under 2 hours" },
    { id: "pt4", name: "TrueYou Photography", specialty: "Portraits", location: "Toronto", phone: "416-555-2400", startingPrice: "$240", rating: 4.5, availability: "Weekdays", responseTime: "Same day" },
    { id: "pt5", name: "Portrait Pulse", specialty: "Portraits", location: "Ottawa", phone: "613-555-2300", startingPrice: "$230", rating: 4.7, availability: "Weekends", responseTime: "Under 2 hours" },

    { id: "ev1", name: "Golden Hour Co.", specialty: "Events", location: "Ottawa", phone: "613-555-4455", startingPrice: "$250", rating: 4.8, availability: "Weekends", responseTime: "Under 1 hour" },
    { id: "ev2", name: "SnapSphere Events", specialty: "Events", location: "Toronto", phone: "416-555-2211", startingPrice: "$280", rating: 4.6, availability: "Weekends + weekdays", responseTime: "Same day" },
    { id: "ev3", name: "Urban Vibe Studio", specialty: "Events", location: "Mississauga", phone: "905-555-8881", startingPrice: "$300", rating: 4.7, availability: "Weekends", responseTime: "Under 2 hours" },
    { id: "ev4", name: "FrameFlow Collective", specialty: "Events", location: "Brampton", phone: "289-555-2701", startingPrice: "$270", rating: 4.5, availability: "Weekends", responseTime: "Same day" },
    { id: "ev5", name: "MomentCraft Media", specialty: "Events", location: "Ottawa", phone: "613-555-2601", startingPrice: "$260", rating: 4.7, availability: "Weekdays + weekends", responseTime: "Under 2 hours" },
  ];

  const filteredPhotographers = useMemo(() => {
    if (!selectedOccasion) return [];
    return photographers.filter((p) => p.specialty === selectedOccasion);
  }, [selectedOccasion]);

  const goHome = () => {
    setStep("HOME");
    setSelectedOccasion(null);
  };

  const pickOccasion = (o: Occasion) => {
    setSelectedOccasion(o);
    setShowOccasionModal(false);
    setStep("PHOTOGRAPHERS");
  };

  const callPhone = async (phone: string) => {
    const url = `tel:${phone}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) await Linking.openURL(url);
    } catch {}
  };

  const smsPhone = async (phone: string) => {
    const url = `sms:${phone}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) await Linking.openURL(url);
    } catch {}
  };

  const askAiForRecommendation = async () => {
    try {
      if (!selectedOccasion || filteredPhotographers.length === 0) return;

      setAiLoading(true);
      setAiReply("");
      setShowAiModal(true);

      const prompt = `You are helping a user pick a photographer.
Occasion: ${selectedOccasion}

Here are available photographers (name, location, rating, starting price):
${filteredPhotographers
  .map((p) => `- ${p.name} (${p.location}), rating ${p.rating}, price ${p.startingPrice}, availability ${p.availability}, response ${p.responseTime}`)
  .join("\n")}

Pick the best 2 choices and explain why in 3-5 lines.
Keep it short and practical.`;

      const reply = await askLLM(prompt);
      setAiReply(reply || "No response received.");
    } catch {
      setAiReply("Sorry, AI request failed. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const TopBar = () => {
    if (step === "HOME") return null;

    return (
      <View style={styles.topBar}>
        <TouchableOpacity onPress={goHome} style={styles.backBtn} activeOpacity={0.85}>
          <Text style={styles.backBtnText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.topBarTitle} numberOfLines={1}>
          {selectedOccasion ?? "Photographers"}
        </Text>

        <TouchableOpacity
          onPress={() => setShowOccasionModal(true)}
          style={styles.changeBtn}
          activeOpacity={0.85}
        >
          <Text style={styles.changeBtnText}>Change</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <TopBar />

      {step === "HOME" && (
        <View style={styles.homeWrapper}>
          <View style={styles.hero}>
            <Text style={styles.heroSmall}>Find a photographer for your special day</Text>

            <Text style={styles.heroTitle}>
              Your moments,{"\n"}your photographer.
            </Text>

            <Text style={styles.heroTagline}>
              One app to explore portfolios and{" "}
              <Text style={styles.link} onPress={() => setShowOccasionModal(true)}>
                connect
              </Text>
              .
            </Text>

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => setShowOccasionModal(true)}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryBtnText}>Choose your occasion</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {step === "PHOTOGRAPHERS" && (
        <View style={{ flex: 1 }}>
          <View style={styles.sectionHeader}>
            <Text style={styles.title}>Photographers</Text>
            <Text style={styles.subtitle}>
              {selectedOccasion ? `Professionals for ${selectedOccasion}` : ""}
            </Text>
          </View>

          {/* AI button */}
          <TouchableOpacity
            style={[styles.primaryBtn, { marginTop: 10 }]}
            onPress={askAiForRecommendation}
            activeOpacity={0.85}
            disabled={!selectedOccasion || filteredPhotographers.length === 0 || aiLoading}
          >
            <Text style={styles.primaryBtnText}>
              {aiLoading ? "Asking AI..." : "Ask AI to recommend"}
            </Text>
          </TouchableOpacity>

          <FlatList
            data={filteredPhotographers}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card}
                activeOpacity={0.85}
                onPress={() => setSelectedPhotographer(item)}
              >
                <View style={styles.cardTopRow}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <Text style={styles.badge}>{item.specialty}</Text>
                </View>

                <Text style={styles.cardMeta}>{item.location}</Text>
                <Text style={styles.cardMeta}>Phone: {item.phone}</Text>

                <View style={styles.metaRow}>
                  <Text style={styles.metaChip}>★ {item.rating.toFixed(1)}</Text>
                  <Text style={styles.metaChip}>{item.availability}</Text>
                  <Text style={styles.metaChip}>{item.responseTime}</Text>
                </View>

                <Text style={styles.cardPrice}>Starting at {item.startingPrice}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Occasion modal */}
      <Modal
        visible={showOccasionModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowOccasionModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowOccasionModal(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose an occasion</Text>
              <Text style={styles.modalSub}>We’ll show matching photographers</Text>
            </View>

            <View style={styles.modalList}>
              {occasions.map((o) => (
                <TouchableOpacity
                  key={o}
                  style={styles.modalItem}
                  onPress={() => pickOccasion(o)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.modalItemText}>{o}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setShowOccasionModal(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* AI modal */}
      <Modal
        visible={showAiModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowAiModal(false)}
      >
        <Pressable style={styles.detailOverlay} onPress={() => setShowAiModal(false)}>
          <Pressable style={styles.detailCard} onPress={() => {}}>
            <Text style={styles.detailName}>AI Recommendation</Text>

            <Text style={{ color: "#101828", fontWeight: "700", lineHeight: 20 }}>
              {aiLoading ? "Thinking..." : aiReply || "No response yet."}
            </Text>

            <TouchableOpacity
              style={styles.detailCloseBtn}
              onPress={() => setShowAiModal(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.detailCloseText}>Close</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Photographer details modal */}
      <Modal
        visible={!!selectedPhotographer}
        animationType="fade"
        transparent
        onRequestClose={() => setSelectedPhotographer(null)}
      >
        <Pressable style={styles.detailOverlay} onPress={() => setSelectedPhotographer(null)}>
          <Pressable style={styles.detailCard} onPress={() => {}}>
            <Text style={styles.detailName}>{selectedPhotographer?.name ?? ""}</Text>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Specialty</Text>
              <Text style={styles.detailValue}>{selectedPhotographer?.specialty ?? ""}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailValue}>{selectedPhotographer?.location ?? ""}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Phone</Text>
              <Text style={styles.detailValue}>{selectedPhotographer?.phone ?? ""}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Starting Price</Text>
              <Text style={styles.detailValue}>{selectedPhotographer?.startingPrice ?? ""}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Rating</Text>
              <Text style={styles.detailValue}>
                ★ {selectedPhotographer ? selectedPhotographer.rating.toFixed(1) : ""}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Availability</Text>
              <Text style={styles.detailValue}>{selectedPhotographer?.availability ?? ""}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Response</Text>
              <Text style={styles.detailValue}>{selectedPhotographer?.responseTime ?? ""}</Text>
            </View>

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.actionPrimary]}
                activeOpacity={0.85}
                onPress={() => selectedPhotographer?.phone && callPhone(selectedPhotographer.phone)}
              >
                <Text style={styles.actionPrimaryText}>Call</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, styles.actionSecondary]}
                activeOpacity={0.85}
                onPress={() => selectedPhotographer?.phone && smsPhone(selectedPhotographer.phone)}
              >
                <Text style={styles.actionSecondaryText}>Message</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.detailCloseBtn}
              onPress={() => setSelectedPhotographer(null)}
              activeOpacity={0.85}
            >
              <Text style={styles.detailCloseText}>Close</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, paddingTop: 16, backgroundColor: "#F6F8FC" },

  homeWrapper: { flex: 1, justifyContent: "flex-start", paddingTop: 70 },

  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingTop: 6,
  },
  backBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
    width: 70,
    alignItems: "center",
  },
  backBtnText: { fontWeight: "800" },
  topBarTitle: { flex: 1, textAlign: "center", fontWeight: "900", fontSize: 16 },
  changeBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CFE0FF",
    backgroundColor: "#EAF2FF",
    width: 70,
    alignItems: "center",
  },
  changeBtnText: { fontWeight: "900", color: "#2B5DB7" },

  hero: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    backgroundColor: "#EAF2FF",
    borderWidth: 1,
    borderColor: "#CFE0FF",
  },
  heroSmall: { fontSize: 13, fontWeight: "700", color: "#2B5DB7" },
  heroTitle: { marginTop: 8, fontSize: 26, fontWeight: "900", lineHeight: 32, color: "#0B1B3A" },
  heroTagline: { marginTop: 8, fontSize: 14, fontWeight: "600", color: "#2A3B5A" },
  link: { color: "#2B5DB7", fontWeight: "900", textDecorationLine: "underline" },
  primaryBtn: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#2B5DB7",
    alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontWeight: "900" },

  sectionHeader: { marginBottom: 8 },
  title: { fontSize: 22, fontWeight: "900", color: "#0B1B3A" },
  subtitle: { marginTop: 4, color: "#667085", fontWeight: "600" },

  listContent: { paddingTop: 12, paddingBottom: 30, gap: 10 },

  card: {
    borderRadius: 16,
    padding: 14,
    backgroundColor: "#fff",
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E8ECF4",
  },
  cardTopRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  cardTitle: { fontSize: 16, fontWeight: "900", flex: 1, color: "#0B1B3A" },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#F2F6FF",
    borderWidth: 1,
    borderColor: "#D9E6FF",
    color: "#2B5DB7",
    fontWeight: "800",
    fontSize: 12,
  },
  cardMeta: { marginTop: 8, color: "#475467", fontWeight: "600" },
  metaRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  metaChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#FAFAFA",
    borderWidth: 1,
    borderColor: "#E6E6E6",
    fontWeight: "800",
    color: "#344054",
    fontSize: 12,
  },
  cardPrice: { marginTop: 10, fontWeight: "900", color: "#101828" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" },
  modalCard: { backgroundColor: "#fff", borderTopLeftRadius: 18, borderTopRightRadius: 18, padding: 16 },
  modalHeader: { marginBottom: 10 },
  modalTitle: { fontSize: 18, fontWeight: "900", color: "#0B1B3A" },
  modalSub: { marginTop: 4, color: "#667085", fontWeight: "600" },
  modalList: { gap: 10, paddingTop: 10, paddingBottom: 10 },
  modalItem: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E6E6E6",
    backgroundColor: "#FAFAFA",
  },
  modalItemText: { fontWeight: "900", color: "#101828" },
  modalCloseBtn: {
    marginTop: 6,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  modalCloseText: { fontWeight: "900", color: "#101828" },

  detailOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "center", padding: 16 },
  detailCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E8ECF4",
  },
  detailName: { fontSize: 20, fontWeight: "900", marginBottom: 12, color: "#0B1B3A" },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#EEF2F6",
  },
  detailLabel: { fontWeight: "800", color: "#475467" },
  detailValue: { fontWeight: "900", color: "#101828" },

  actionRow: { flexDirection: "row", gap: 10, marginTop: 14 },
  actionBtn: { flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  actionPrimary: { backgroundColor: "#2B5DB7" },
  actionPrimaryText: { color: "#fff", fontWeight: "900" },
  actionSecondary: { backgroundColor: "#EAF2FF", borderWidth: 1, borderColor: "#CFE0FF" },
  actionSecondaryText: { color: "#2B5DB7", fontWeight: "900" },

  detailCloseBtn: {
    marginTop: 10,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  detailCloseText: { fontWeight: "900", color: "#101828" },
});
