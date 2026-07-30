import streamlit as st
import pandas as pd
import plotly.express as px

st.set_page_config(layout="wide", page_title="Brain Aging Interactions Dashboard")

@st.cache_data
def load_data():
    df = pd.read_csv("data/brain_aging_interactions.csv")
    return df

df = load_data()

st.title("Brain‑aging interaction dashboard")
st.markdown("Mapping genetic–environmental interactions from Chen et al. (Cereb Cortex, 2024). [1][4]")

# Sidebar filters
st.sidebar.header("Filters")
factor_filter = st.sidebar.multiselect(
    "Factor",
    options=sorted(df["factor_name"].unique()),
    default=sorted(df["factor_name"].unique())
)
region_filter = st.sidebar.multiselect(
    "Brain region",
    options=sorted(df["region_name"].unique()),
    default=sorted(df["region_name"].unique())
)
interaction_type_filter = st.sidebar.multiselect(
    "Interaction type",
    options=sorted(df["interaction_type"].unique()),
    default=sorted(df["interaction_type"].unique())
)

df_sel = df[
    df["factor_name"].isin(factor_filter) &
    df["region_name"].isin(region_filter) &
    df["interaction_type"].isin(interaction_type_filter)
]

# View 1: Heatmap region × factor
st.subheader("Interaction density: region × factor")
heat = (
    df_sel
    .groupby(["region_name", "factor_name"], as_index=False)
    .agg(n_signals=("signal_id", "count"))
)
fig_heat = px.imshow(
    heat.pivot(index="region_name", columns="factor_name", values="n_signals"),
    labels=dict(x="Factor", y="Brain region", color="# interactions"),
    aspect="auto"
)
st.plotly_chart(fig_heat, use_container_width=True)

# View 2: Factor burden
st.subheader("Number of interactions by factor")
fig_bar = px.histogram(
    df_sel,
    x="factor_name",
    color="interaction_type",
    labels={"factor_name": "Factor", "count": "# interactions"},
    barmode="stack"
)
st.plotly_chart(fig_bar, use_container_width=True)

# View 3: Region detail
st.subheader("Region detail")
selected_region = st.selectbox("Select region", sorted(df_sel["region_name"].unique()))
df_region = df_sel[df_sel["region_name"] == selected_region]
st.dataframe(df_region[
    ["factor_name", "interaction_type", "direction", "sex_specific", "effect_size", "p_value"]
])