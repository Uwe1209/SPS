import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Animated,
} from "react-native";
import { LineChart } from "react-native-chart-kit";
import { AnimatedCircularProgress } from "react-native-circular-progress";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import { db } from "../firebase/FirebaseConfig";
import {
  doc,
  onSnapshot,
  collection,
  query,
  orderBy,
  limit,
} from "firebase/firestore";

const screenWidth = Dimensions.get("window").width;

// ---- Timestamp helpers ----
function toDateAny(ts) {
  if (ts && typeof ts.toDate === "function") return ts.toDate();
  if (ts && typeof ts === "object" && "seconds" in ts)
    return new Date(ts.seconds * 1000);
  if (typeof ts === "string" || typeof ts === "number") return new Date(ts);
  return null;
}
function formatMY(ts) {
  const d = toDateAny(ts);
  if (!d || isNaN(d.getTime())) return "Invalid Date";
  return d.toLocaleString("en-MY", { timeZone: "Asia/Kuala_Lumpur" });
}

// ---- Helper ----
const num = (v) => (Number.isFinite(+v) ? +v : 0);
const sanitize = (arr) => arr.map(num);

export default function IoTDashboard() {
  const [live, setLive] = useState(null);
  const [history, setHistory] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const soundRef = useRef(null);

  // Load alert sound
  useEffect(() => {
    (async () => {
      const { sound } = await Audio.Sound.createAsync(
        require("../../assets/alert.mp3")
      );
      soundRef.current = sound;
    })();
    return () => soundRef.current && soundRef.current.unloadAsync();
  }, []);

  const triggerFeedback = async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      if (soundRef.current) await soundRef.current.replayAsync();
    } catch {}
  };

  // Live listener
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "readings", "latest"), (snap) => {
      if (snap.exists()) setLive(snap.data());
    });
    return () => unsub();
  }, []);

  // History listener
  useEffect(() => {
    const q = query(
      collection(db, "readings", "latest", "history"),
      orderBy("timestamp", "desc"),
      limit(40)
    );
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => d.data()).reverse();
      setHistory(list);
    });
    return () => unsub();
  }, []);

  // Alerts
  useEffect(() => {
    if (!live) return;
    const { temperature, humidity, soil, rainPercent } = live;
    const t = num(temperature),
      h = num(humidity),
      s = num(soil),
      r = num(rainPercent);
    const newA = [];
    if (t > 35) newA.push("🔥 High Temperature");
    if (t < 15) newA.push("❄️ Low Temperature");
    if (h < 40) newA.push("💧 Low Humidity");
    if (s < 30) newA.push("🌱 Soil Dry");
    if (r > 70) newA.push("🌧️ Heavy Rain");
    if (JSON.stringify(newA) !== JSON.stringify(alerts)) {
      setAlerts(newA);
      if (newA.length) triggerFeedback();
    }
  }, [live]);

  if (!live)
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#00b894" />
        <Text>Loading IoT data...</Text>
      </View>
    );

  // Extract data
  const t = num(live.temperature);
  const h = num(live.humidity);
  const s = num(live.soil);
  const r = num(live.rainPercent);
  const m = num(live.motionCount);
  const snd = num(live.soundEvents);
  const d = num(live.distance);
  const a = num(live.angle);

  const labels = history.map((h, i) =>
    i % 4 === 0 ? formatMY(h.timestamp).split(", ")[1] ?? "" : ""
  );
  const temps = sanitize(history.map((x) => x.temperature));
  const hums = sanitize(history.map((x) => x.humidity));
  const soils = sanitize(history.map((x) => x.soil));
  const rains = sanitize(history.map((x) => x.rainPercent));
  const motions = sanitize(history.map((x) => x.motionCount));
  const sounds = sanitize(history.map((x) => x.soundEvents));
  const dists = sanitize(history.map((x) => x.distance));
  const angs = sanitize(history.map((x) => x.angle));

  return (
    <ScrollView style={{ flex: 1, padding: 15, backgroundColor: "#f9f9f9" }}>
      <Text style={{ fontSize: 26, fontWeight: "bold", marginBottom: 10 }}>
        🌿 SmartPlant Dashboard
      </Text>

      {/* Alerts */}
      {alerts.length > 0 && (
        <View style={{ marginBottom: 15 }}>
          {alerts.map((msg, i) => (
            <View
              key={i}
              style={{
                backgroundColor: msg.includes("High")
                  ? "#ff7675"
                  : msg.includes("Low")
                  ? "#fdcb6e"
                  : "#74b9ff",
                padding: 10,
                borderRadius: 10,
                marginBottom: 6,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "600" }}>{msg}</Text>
            </View>
          ))}
        </View>
      )}

      {/* 3x3 Gauges */}
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
          backgroundColor: "#fff",
          borderRadius: 20,
          paddingVertical: 20,
          marginBottom: 20,
          paddingHorizontal: 5,
        }}
      >
        <Gauge title="Temperature" value={t} unit="°C" colors={["#ff7f50", "#ff4500"]} />
        <Gauge title="Humidity" value={h} unit="%" colors={["#6dd5fa", "#2980b9"]} />
        <Gauge title="Soil" value={s} unit="%" colors={["#00b894", "#26de81"]} />
        <Gauge title="Rain" value={r} unit="%" colors={["#74b9ff", "#0984e3"]} />
        <Gauge title="Motion" value={m} unit="" colors={["#fab1a0", "#d63031"]} />
        <Gauge title="Sound" value={snd} unit="" colors={["#a29bfe", "#6c5ce7"]} />
        <Gauge title="Distance" value={d} unit="cm" colors={["#55efc4", "#00cec9"]} />
        <Gauge title="Servo" value={a} unit="°" colors={["#fd79a8", "#e84393"]} />
        <Gauge title="Uptime" value={100} unit="%" colors={["#ffeaa7", "#fbc531"]} />
      </View>

      {/* Charts */}
      <ChartBlock
        title="🌡️ Temperature & Humidity"
        labels={labels}
        datasets={[
          { data: temps, color: () => "#e17055" },
          { data: hums, color: () => "#0984e3" },
        ]}
        legends={["Temperature (°C)", "Humidity (%)"]}
      />

      <ChartBlock
        title="🌱 Soil Moisture"
        labels={labels}
        datasets={[{ data: soils, color: () => "#00b894" }]}
        legends={["Soil (%)"]}
      />

      <ChartBlock
        title="🌧️ Rain Activity"
        labels={labels}
        datasets={[{ data: rains, color: () => "#00cec9" }]}
        legends={["Rain (%)"]}
      />

      <ChartBlock
        title="🚶 Motion Activity"
        labels={labels}
        datasets={[{ data: motions, color: () => "#d63031" }]}
        legends={["Motion Count"]}
      />

      <ChartBlock
        title="🎵 Sound Activity"
        labels={labels}
        datasets={[{ data: sounds, color: () => "#6c5ce7" }]}
        legends={["Sound Events"]}
      />

      <ChartBlock
        title="📏 Distance & Servo Angle"
        labels={labels}
        datasets={[
          { data: dists, color: () => "#0984e3" },
          { data: angs, color: () => "#ff7675" },
        ]}
        legends={["Distance (cm)", "Servo (°)"]}
      />
    </ScrollView>
  );
}

/** ---- Gauge ---- */
function Gauge({ title, value, unit, colors }) {
  const anim = useRef(new Animated.Value(value)).current;
  const [display, setDisplay] = useState(value);
  useEffect(() => {
    Animated.timing(anim, { toValue: value, duration: 600, useNativeDriver: false }).start();
  }, [value]);
  anim.addListener(({ value }) => setDisplay(value));

  const midColor = colors[1];

  return (
    <View style={{ alignItems: "center", width: "30%", marginVertical: 10 }}>
      <AnimatedCircularProgress
        size={100}
        width={10}
        fill={Math.min(display, 100)}
        tintColor={midColor}
        backgroundColor="#ecf0f1"
        rotation={0}
      >
        {() => (
          <Text style={{ fontSize: 18, fontWeight: "700", color: midColor }}>
            {display.toFixed(1)}
            {unit}
          </Text>
        )}
      </AnimatedCircularProgress>
      <Text style={{ fontWeight: "600", marginTop: 5, color: midColor }}>{title}</Text>
    </View>
  );
}

/** ---- Chart Block ---- */
function ChartBlock({ title, labels, datasets, legends }) {
  const screenWidth = Dimensions.get("window").width;
  const allValues = datasets.flatMap((ds) => ds.data);
  let minY = Math.min(...allValues);
  let maxY = Math.max(...allValues);
  if (minY === maxY) {
    minY -= 1;
    maxY += 1;
  }
  const padding = (maxY - minY) * 0.1;
  const yMin = Math.max(0, Math.floor(minY - padding));
  const yMax = Math.ceil(maxY + padding);

  return (
    <View
      style={{
        backgroundColor: "#fff",
        paddingTop: 10,
        paddingRight: 20,
        borderRadius: 15,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
        alignItems: "center",
      }}
    >
      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 5 }}>{title}</Text>

      {datasets[0].data.length ? (
        <LineChart
          data={{ labels: labels.slice(-10), datasets, legend: legends }}
          width={screenWidth - 50}
          height={240}
          withInnerLines={true}
          withOuterLines={true}
          bezier
          fromZero={false}
          yAxisMin={yMin}
          yAxisMax={yMax}
          yLabelsOffset={7}
          formatYLabel={(v) => `${Math.round(Number(v))}`}
          chartConfig={{
            backgroundColor: "#fff",
            backgroundGradientFrom: "#fff",
            backgroundGradientTo: "#fff",
            decimalPlaces: 1,
            color: (o = 1) => `rgba(0,0,0,${o})`,
            labelColor: (o = 1) => `rgba(0,0,0,${o})`,
            propsForDots: { r: "3.5", strokeWidth: "1.5", stroke: "#636e72" },
            propsForBackgroundLines: {
              stroke: "#dfe6e9",
              strokeDasharray: "3 3",
            },
          }}
          style={{
            marginTop: 0, // reduce top empty space
            borderRadius: 15,
            alignSelf: "center",
          }}
        />
      ) : (
        <Text style={{ marginTop: 10, color: "#636e72" }}>No data yet</Text>
      )}
    </View>
  );
}
