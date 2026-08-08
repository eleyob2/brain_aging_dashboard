// Centralized data + configuration for the Brain Interaction Explorer.
// Values approximate real standardized-beta ranges reported in You et al. (2025), Brain
// Communications, UK Biobank N=24,912 — the closest published study. That paper measured
// hippocampal volume, whole-brain grey/white matter and general tract integrity, not these
// exact 5 anatomical ROIs, so figures below are mapped onto the closest matching region as an
// illustrative proxy. The study found lifestyle × APOE-e4 interactions were largely NON-significant
// (mostly linear, independent effects) — pathways here reflect independent associations, not confirmed synergy.

// Real effect sizes are small (roughly -0.21 to 0.10), so the color scale is domained to
// that actual data range instead of -1..1, making differences visible. Shared by SketchfabBrain
// (region colors) and the legend, so they always stay in sync.
export const SCALE_MIN = -0.22;
export const SCALE_MAX = 0.1;

export const nodes = [
  { roi: "left_amygdala", label: "Left amygdala", system: "limbic", alz: "memory/emotion", carrier_female_toy: -0.045, carrier_male_toy: -0.045, noncarrier_female_toy: 0, noncarrier_male_toy: 0, apoe_e4_effect: -0.045, age_effect: 0, sex_modifier_female: 0, alcohol_interaction: 0, diet_interaction: 0, smoking_interaction: 0, ad_link_score: 0.65, note: "Real finding: APOE e4 carriers had significantly smaller hippocampal volume than non-carriers (standardized ß -0.042 to -0.048, You et al. 2025). Mapped onto amygdala as an anatomical proxy — hippocampus was the region actually measured; no sex-specific breakdown was published." },
  { roi: "left_cerebellar_exterior", label: "Left cerebellar exterior", system: "cerebellar", alz: "aging vulnerability", carrier_female_toy: 0, carrier_male_toy: 0, noncarrier_female_toy: 0, noncarrier_male_toy: 0, apoe_e4_effect: 0, age_effect: 0, sex_modifier_female: 0, alcohol_interaction: 0, diet_interaction: 0.05, smoking_interaction: 0, ad_link_score: 0.4, note: "Real finding: moderate/unfavourable lifestyle was associated with smaller grey matter and total brain volume vs. favourable lifestyle (standardized ß 0.004–0.096, You et al. 2025). No cerebellum-specific figure was published; value shown is the general grey-matter lifestyle association." },
  { roi: "splenium_corpus_callosum_md", label: "Splenium of corpus callosum (MD)", system: "white matter", alz: "microstructure", carrier_female_toy: 0, carrier_male_toy: 0, noncarrier_female_toy: 0, noncarrier_male_toy: 0, apoe_e4_effect: 0, age_effect: 0, sex_modifier_female: 0, alcohol_interaction: -0.13, diet_interaction: 0, smoking_interaction: 0, ad_link_score: 0.5, note: "Real finding: high-level drinking was associated with poorer white matter tract integrity (standardized ß -0.105 to -0.152, You et al. 2025). No splenium-specific figure was published; value is the general high-drinking white-matter association." },
  { roi: "paracentral_volume", label: "Paracentral volume", system: "cortical", alz: "cortical volume", carrier_female_toy: 0, carrier_male_toy: 0, noncarrier_female_toy: 0, noncarrier_male_toy: 0, apoe_e4_effect: 0, age_effect: 0, sex_modifier_female: 0, alcohol_interaction: 0, diet_interaction: 0.06, smoking_interaction: 0, ad_link_score: 0.38, note: "Real finding: favourable lifestyle was associated with larger grey matter volume vs. unfavourable lifestyle (standardized ß 0.004–0.096, You et al. 2025). No paracentral-specific figure was published; general grey-matter lifestyle value shown." },
  { roi: "superior_fronto_occipital_fasciculus_axd", label: "Superior fronto-occipital fasciculus (AxD)", system: "white matter", alz: "tract microstructure", carrier_female_toy: 0, carrier_male_toy: 0, noncarrier_female_toy: 0, noncarrier_male_toy: 0, apoe_e4_effect: 0, age_effect: 0, sex_modifier_female: 0, alcohol_interaction: 0, diet_interaction: 0, smoking_interaction: -0.15, ad_link_score: 0.45, note: "Real finding: current smoking was associated with poorer white matter tract markers (standardized ß -0.014 to -0.209, You et al. 2025). No SFOF-specific figure was published; general smoking white-matter association shown." },
];

// Positions as % of the SketchfabBrain image container, tuned to the lateral brain illustration.
export const REGION_OVERLAYS = [
  { id: "left_amygdala", label: "Amygdala", x: 54, y: 62 },
  { id: "left_cerebellar_exterior", label: "Cerebellar", x: 50, y: 38 },
  { id: "splenium_corpus_callosum_md", label: "Splenium CC", x: 62, y: 48 },
  { id: "paracentral_volume", label: "Paracentral", x: 48, y: 22 },
  { id: "superior_fronto_occipital_fasciculus_axd", label: "SFOF AxD", x: 40, y: 38 },
];

export const edges = [
  { source: "APOE-e4", target: "Left amygdala", group: "carrier pathway", label: "? hippocampal-proxy volume (ß -0.04 to -0.05)" },
  { source: "APOE-e4", target: "Splenium MD", group: "carrier pathway", label: "worse WM tract integrity" },
  { source: "APOE-e4", target: "SFOF AxD", group: "carrier pathway", label: "worse WM tract integrity" },
  { source: "Excessive alcohol", target: "Splenium MD", group: "lifestyle pathway", label: "associated, ß -0.11 to -0.15" },
  { source: "Healthy diet", target: "Paracentral volume", group: "lifestyle pathway", label: "associated, ß 0.004–0.10" },
  { source: "Smoking", target: "SFOF AxD", group: "lifestyle pathway", label: "associated, ß -0.01 to -0.21" },
  { source: "Smoking", target: "Brain structure", group: "global pathway", label: "broad impact" },
  { source: "Brain structure", target: "AD vulnerability", group: "global pathway", label: "conceptual route" },
  { source: "Left amygdala", target: "AD vulnerability", group: "carrier pathway", label: "limbic relevance" },
];

export const metrics = [
  { value: "carrier_female_toy", label: "APOE-e4 Carrier Female" },
  { value: "carrier_male_toy", label: "APOE-e4 Carrier Male" },
  { value: "noncarrier_female_toy", label: "Non-carrier Female" },
  { value: "noncarrier_male_toy", label: "Non-carrier Male" },
  { value: "apoe_e4_effect", label: "APOE-e4 Effect" },
  { value: "age_effect", label: "Age Effect" },
  { value: "alcohol_interaction", label: "Alcohol Interaction" },
  { value: "diet_interaction", label: "Diet Interaction" },
  { value: "ad_link_score", label: "AD Link Score" },
];

export const pathways = [
  { value: "all", label: "All Pathways" },
  { value: "carrier pathway", label: "Carrier Pathway" },
  { value: "lifestyle pathway", label: "Lifestyle Pathway" },
  { value: "global pathway", label: "Global Pathway" },
];
