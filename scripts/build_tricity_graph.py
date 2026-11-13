
from pathlib import Path
import json
import pandas as pd
import osmnx as ox

# -----------------------------------------
# RIDEFLOW - TRICITY ROAD NETWORK BUILDER
# -----------------------------------------

OUTPUT = Path("data/tricity")
OUTPUT.mkdir(parents=True, exist_ok=True)

# Approximate coverage:
# Chandigarh, Mohali, Kharar, Panchkula, Zirakpur
#
# bbox = (west, south, east, north)
BBOX = (76.55, 30.55, 76.95, 30.85)

ox.settings.use_cache = True
ox.settings.log_console = True
ox.settings.timeout = 180

print("Downloading Tricity driving road network...")

G = ox.graph_from_bbox(
    bbox=BBOX,
    network_type="drive",
    simplify=True,
    retain_all=False,
    truncate_by_edge=True,
)

print("Calculating estimated road speeds...")
G = ox.add_edge_speeds(G)

print("Calculating estimated travel times...")
G = ox.add_edge_travel_times(G)

nodes, edges = ox.convert.graph_to_gdfs(G)

# -----------------------------------------
# EXPORT NODES
# -----------------------------------------

node_df = nodes.reset_index()

node_df = node_df.rename(
    columns={
        "osmid": "node_id",
        "x": "longitude",
        "y": "latitude",
    }
)

node_df = node_df[
    ["node_id", "longitude", "latitude"]
]

node_df.to_csv(
    OUTPUT / "road_nodes.csv",
    index=False,
)

# -----------------------------------------
# EXPORT DIRECTED ROAD EDGES
# -----------------------------------------

edge_df = edges.reset_index()

def clean_value(value):
    if isinstance(value, list):
        return "; ".join(map(str, value))
    if value is None:
        return ""
    try:
        if pd.isna(value):
            return ""
    except (TypeError, ValueError):
        pass
    return str(value)

edge_df["road_name"] = edge_df.get(
    "name", pd.Series("", index=edge_df.index)
).apply(clean_value)

edge_df["road_class"] = edge_df.get(
    "highway", pd.Series("", index=edge_df.index)
).apply(clean_value)

edge_df["oneway"] = edge_df.get(
    "oneway", pd.Series(False, index=edge_df.index)
).apply(lambda value: str(value).lower() in ("true", "1", "yes"))

edge_df["geometry_wkt"] = edge_df["geometry"].apply(
    lambda geometry: geometry.wkt if geometry is not None else ""
)

edge_df = edge_df.rename(
    columns={
        "u": "source_node_id",
        "v": "target_node_id",
        "length": "distance_m",
        "speed_kph": "speed_kph",
        "travel_time": "travel_time_s",
    }
)

edge_df = edge_df[
    [
        "source_node_id",
        "target_node_id",
        "key",
        "distance_m",
        "speed_kph",
        "travel_time_s",
        "road_name",
        "road_class",
        "oneway",
        "geometry_wkt",
    ]
]

edge_df.to_csv(
    OUTPUT / "road_edges.csv",
    index=False,
)

# -----------------------------------------
# SAVE NETWORK METADATA
# -----------------------------------------

metadata = {
    "project": "RideFlow",
    "graph_version": "TRICITY_V1",
    "network_type": "drive",
    "algorithm": "CUSTOM_JAVA_DIJKSTRA",
    "nodes": len(node_df),
    "directed_edges": len(edge_df),
    "bbox": {
        "west": BBOX[0],
        "south": BBOX[1],
        "east": BBOX[2],
        "north": BBOX[3],
    },
    "source": "OpenStreetMap",
}

with open(OUTPUT / "metadata.json", "w", encoding="utf-8") as file:
    json.dump(metadata, file, indent=4)

print("\nROAD NETWORK EXPORTED SUCCESSFULLY")
print("----------------------------------")
print(f"Nodes: {len(node_df):,}")
print(f"Directed edges: {len(edge_df):,}")
print(f"Output folder: {OUTPUT.resolve()}")
print("Graph version: TRICITY_V1")
