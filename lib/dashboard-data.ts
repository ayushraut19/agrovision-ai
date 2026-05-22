export const weather = {
  location: "Farm Field A",
  temperature: 28,
  humidity: 62,
  windSpeed: 12,
  condition: "Partly Cloudy",
};

export const weeklyHealth = [
  { day: "Mon", value: 72 },
  { day: "Tue", value: 74 },
  { day: "Wed", value: 71 },
  { day: "Thu", value: 76 },
  { day: "Fri", value: 78 },
  { day: "Sat", value: 77 },
  { day: "Sun", value: 78 },
];

export type AlertPriority = "High" | "Medium" | "Low";

export type AlertCategory = "disease" | "irrigation" | "weather" | "fertilizer";

export type SmartAlert = {
  id: string;
  category: AlertCategory;
  title: string;
  message: string;
  field: string;
  timestamp: string;
  priority: AlertPriority;
};

export const smartAlerts: SmartAlert[] = [
  {
    id: "alt-001",
    category: "disease",
    title: "Early Leaf Blight detected",
    message: "Visual symptoms match early-stage blight on lower canopy.",
    field: "North Plot B",
    timestamp: "2h ago",
    priority: "High",
  },
  {
    id: "alt-002",
    category: "disease",
    title: "Rust spots on wheat",
    message: "Mild rust pattern identified — monitor spread over 48 hours.",
    field: "East Ridge",
    timestamp: "5h ago",
    priority: "Medium",
  },
  {
    id: "alt-003",
    category: "irrigation",
    title: "Zone 3 moisture below target",
    message: "Soil moisture at 41% — increase irrigation cycle duration.",
    field: "West Terrace",
    timestamp: "1h ago",
    priority: "High",
  },
  {
    id: "alt-004",
    category: "irrigation",
    title: "Schedule adjustment suggested",
    message: "Upcoming heat wave — shift watering to early morning.",
    field: "All zones",
    timestamp: "Today, 8:00 AM",
    priority: "Low",
  },
  {
    id: "alt-005",
    category: "weather",
    title: "Heavy rain expected tomorrow",
    message: "65% precipitation forecast — delay foliar spray applications.",
    field: "Regional",
    timestamp: "6h ago",
    priority: "Medium",
  },
  {
    id: "alt-006",
    category: "weather",
    title: "High wind advisory",
    message: "Gusts up to 45 km/h may affect open-field crops.",
    field: "South Field",
    timestamp: "Today, 6:30 AM",
    priority: "High",
  },
  {
    id: "alt-007",
    category: "fertilizer",
    title: "Nitrogen boost recommended",
    message: "Corn flowering stage — apply balanced NPK within 3 days.",
    field: "South Field",
    timestamp: "3h ago",
    priority: "Medium",
  },
  {
    id: "alt-008",
    category: "fertilizer",
    title: "Micronutrient supplement",
    message: "Tomato plot showing zinc deficiency indicators.",
    field: "North Plot B",
    timestamp: "Yesterday",
    priority: "Low",
  },
];

export type ReportStatus = "ready" | "processing" | "review" | "archived";

export type CropReport = {
  id: string;
  cropName: string;
  healthStatus: "Healthy" | "Moderate" | "At Risk" | "Critical";
  dateMonitored: string;
  diseaseDetected: string;
  healthPercentage: number;
  status: ReportStatus;
};

export const cropReports: CropReport[] = [
  {
    id: "rpt-001",
    cropName: "Tomato — North Plot B",
    healthStatus: "At Risk",
    dateMonitored: "May 21, 2026",
    diseaseDetected: "Early Leaf Blight",
    healthPercentage: 78,
    status: "ready",
  },
  {
    id: "rpt-002",
    cropName: "Wheat — East Ridge",
    healthStatus: "Moderate",
    dateMonitored: "May 20, 2026",
    diseaseDetected: "Rust spots (mild)",
    healthPercentage: 71,
    status: "review",
  },
  {
    id: "rpt-003",
    cropName: "Corn — South Field",
    healthStatus: "Healthy",
    dateMonitored: "May 19, 2026",
    diseaseDetected: "None detected",
    healthPercentage: 92,
    status: "ready",
  },
  {
    id: "rpt-004",
    cropName: "Soybean — West Terrace",
    healthStatus: "Critical",
    dateMonitored: "May 18, 2026",
    diseaseDetected: "Root rot suspected",
    healthPercentage: 54,
    status: "processing",
  },
  {
    id: "rpt-005",
    cropName: "Rice — Delta Block A",
    healthStatus: "Healthy",
    dateMonitored: "May 15, 2026",
    diseaseDetected: "None detected",
    healthPercentage: 88,
    status: "archived",
  },
];

export type IrrigationStatus =
  | "Active"
  | "Scheduled"
  | "Paused"
  | "Offline";

export type GrowthStage =
  | "Seedling"
  | "Vegetative"
  | "Flowering"
  | "Fruiting"
  | "Harvest Ready";

export type Field = {
  id: string;
  name: string;
  cropType: string;
  sizeAcres: number;
  irrigationStatus: IrrigationStatus;
  growthStage: GrowthStage;
  soilMoisture: number;
  active: boolean;
};

export const fields: Field[] = [
  {
    id: "fld-001",
    name: "North Plot B",
    cropType: "Tomato",
    sizeAcres: 12.4,
    irrigationStatus: "Active",
    growthStage: "Fruiting",
    soilMoisture: 68,
    active: true,
  },
  {
    id: "fld-002",
    name: "East Ridge",
    cropType: "Wheat",
    sizeAcres: 28.0,
    irrigationStatus: "Scheduled",
    growthStage: "Vegetative",
    soilMoisture: 55,
    active: true,
  },
  {
    id: "fld-003",
    name: "South Field",
    cropType: "Corn",
    sizeAcres: 45.5,
    irrigationStatus: "Active",
    growthStage: "Flowering",
    soilMoisture: 72,
    active: true,
  },
  {
    id: "fld-004",
    name: "West Terrace",
    cropType: "Soybean",
    sizeAcres: 18.2,
    irrigationStatus: "Paused",
    growthStage: "Seedling",
    soilMoisture: 41,
    active: true,
  },
  {
    id: "fld-005",
    name: "Delta Block A",
    cropType: "Rice",
    sizeAcres: 32.8,
    irrigationStatus: "Offline",
    growthStage: "Harvest Ready",
    soilMoisture: 38,
    active: false,
  },
  {
    id: "fld-006",
    name: "Orchard Lane",
    cropType: "Apple",
    sizeAcres: 9.6,
    irrigationStatus: "Active",
    growthStage: "Fruiting",
    soilMoisture: 61,
    active: false,
  },
];

export const summary = {
  cropHealth: weeklyHealth[weeklyHealth.length - 1].value,
  alertCount: smartAlerts.length,
  reportCount: cropReports.length,
  fieldCount: fields.length,
  activeFieldCount: fields.filter((f) => f.active).length,
};
