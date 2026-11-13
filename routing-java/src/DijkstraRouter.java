
import java.io.BufferedReader;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import com.sun.net.httpserver.HttpServer;
import com.sun.net.httpserver.HttpExchange;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class DijkstraRouter {

    private static final String NODE_FILE =
            "data/tricity/road_nodes.csv";

    private static final String EDGE_FILE =
            "data/tricity/road_edges.csv";

    private static final double EARTH_RADIUS = 6371000.0;

    // Represents a road intersection.
    static class Node {
        long id;
        double longitude;
        double latitude;

        Node(long id, double longitude, double latitude) {
            this.id = id;
            this.longitude = longitude;
            this.latitude = latitude;
        }
    }

    // Represents a point along a road.
    static class Point {
        double longitude;
        double latitude;

        Point(double longitude, double latitude) {
            this.longitude = longitude;
            this.latitude = latitude;
        }
    }

    // Directed road connection.
    static class Edge {
        long source;
        long target;
        double distance;
        double travelTime;
        List<Point> geometry;

        Edge(long source, long target,
             double distance, double travelTime,
             List<Point> geometry) {

            this.source = source;
            this.target = target;
            this.distance = distance;
            this.travelTime = travelTime;
            this.geometry = geometry;
        }
    }

    // Priority queue state.
    static class State implements Comparable<State> {
        long nodeId;
        double time;

        State(long nodeId, double time) {
            this.nodeId = nodeId;
            this.time = time;
        }

        @Override
        public int compareTo(State other) {
            return Double.compare(this.time, other.time);
        }
    }

    static class RouteResult {
        double totalDistance;
        double totalTime;
        int visitedNodes;
        long startNode;
        long endNode;
        List<Point> coordinates = new ArrayList<>();
    }

    private final Map<Long, Node> nodes = new HashMap<>();

    private final Map<Long, List<Edge>> adjacency =
            new HashMap<>();

    // ---------------- CSV PARSER ----------------

    // Handles quoted fields containing commas.
    private static List<String> parseCsvLine(String line) {

        List<String> values = new ArrayList<>();
        StringBuilder current = new StringBuilder();

        boolean insideQuotes = false;

        for (int i = 0; i < line.length(); i++) {

            char c = line.charAt(i);

            if (c == '"') {

                if (insideQuotes &&
                    i + 1 < line.length() &&
                    line.charAt(i + 1) == '"') {

                    current.append('"');
                    i++;

                } else {
                    insideQuotes = !insideQuotes;
                }

            } else if (c == ',' && !insideQuotes) {

                values.add(current.toString());
                current.setLength(0);

            } else {
                current.append(c);
            }
        }

        values.add(current.toString());

        return values;
    }

    private static Map<String, Integer> getHeader(
            List<String> columns) {

        Map<String, Integer> header = new HashMap<>();

        for (int i = 0; i < columns.size(); i++) {
            header.put(columns.get(i).trim(), i);
        }

        return header;
    }

    private static String field(
            List<String> row,
            Map<String, Integer> header,
            String column) {

        Integer index = header.get(column);

        if (index == null || index >= row.size()) {
            return "";
        }

        return row.get(index).trim();
    }

    // ---------------- LOAD ROAD NODES ----------------

    public void loadNodes() throws IOException {

        System.out.println("Loading road nodes...");

        try (BufferedReader reader =
                     Files.newBufferedReader(Path.of(NODE_FILE))) {

            String headerLine = reader.readLine();

            if (headerLine == null) {
                throw new IOException("Node CSV is empty.");
            }

            Map<String, Integer> header =
                    getHeader(parseCsvLine(headerLine));

            String line;

            while ((line = reader.readLine()) != null) {

                if (line.isBlank()) continue;

                List<String> row = parseCsvLine(line);

                long id = Long.parseLong(
                        field(row, header, "node_id"));

                double longitude = Double.parseDouble(
                        field(row, header, "longitude"));

                double latitude = Double.parseDouble(
                        field(row, header, "latitude"));

                nodes.put(
                        id,
                        new Node(id, longitude, latitude)
                );
            }
        }

        System.out.println("Loaded nodes: " + nodes.size());
    }

    // ---------------- ROAD GEOMETRY ----------------

    private List<Point> parseGeometry(String wkt) {

        List<Point> points = new ArrayList<>();

        if (wkt == null || !wkt.startsWith("LINESTRING")) {
            return points;
        }

        int start = wkt.indexOf('(');
        int end = wkt.lastIndexOf(')');

        if (start < 0 || end <= start) {
            return points;
        }

        String body = wkt.substring(start + 1, end);

        String[] coordinates = body.split(",");

        for (String coordinate : coordinates) {

            String[] parts = coordinate.trim().split("\\s+");

            if (parts.length < 2) continue;

            double longitude = Double.parseDouble(parts[0]);
            double latitude = Double.parseDouble(parts[1]);

            points.add(new Point(longitude, latitude));
        }

        return points;
    }

    // ---------------- LOAD ROAD EDGES ----------------

    public void loadEdges() throws IOException {

        System.out.println("Loading directed road edges...");

        try (BufferedReader reader =
                     Files.newBufferedReader(Path.of(EDGE_FILE))) {

            String headerLine = reader.readLine();

            if (headerLine == null) {
                throw new IOException("Edge CSV is empty.");
            }

            Map<String, Integer> header =
                    getHeader(parseCsvLine(headerLine));

            String line;
            int edgeCount = 0;

            while ((line = reader.readLine()) != null) {

                if (line.isBlank()) continue;

                List<String> row = parseCsvLine(line);

                long source = Long.parseLong(
                        field(row, header, "source_node_id"));

                long target = Long.parseLong(
                        field(row, header, "target_node_id"));

                double distance = Double.parseDouble(
                        field(row, header, "distance_m"));

                double travelTime = Double.parseDouble(
                        field(row, header, "travel_time_s"));

                if (distance <= 0 || travelTime <= 0) {
                    continue;
                }

                if (!nodes.containsKey(source) ||
                    !nodes.containsKey(target)) {
                    continue;
                }

                String wkt = field(row, header, "geometry_wkt");

                List<Point> geometry = parseGeometry(wkt);

                Node sourceNode = nodes.get(source);
                Node targetNode = nodes.get(target);

                if (geometry.size() < 2) {

                    geometry = new ArrayList<>();

                    geometry.add(new Point(
                            sourceNode.longitude,
                            sourceNode.latitude
                    ));

                    geometry.add(new Point(
                            targetNode.longitude,
                            targetNode.latitude
                    ));
                }

                // Ensure geometry follows source -> target.
                Point first = geometry.get(0);
                Point last = geometry.get(geometry.size() - 1);

                double forwardDistance =
                        haversine(
                                sourceNode.latitude,
                                sourceNode.longitude,
                                first.latitude,
                                first.longitude
                        ) +
                        haversine(
                                targetNode.latitude,
                                targetNode.longitude,
                                last.latitude,
                                last.longitude
                        );

                double reverseDistance =
                        haversine(
                                sourceNode.latitude,
                                sourceNode.longitude,
                                last.latitude,
                                last.longitude
                        ) +
                        haversine(
                                targetNode.latitude,
                                targetNode.longitude,
                                first.latitude,
                                first.longitude
                        );

                if (reverseDistance < forwardDistance) {
                    Collections.reverse(geometry);
                }

                Edge edge = new Edge(
                        source,
                        target,
                        distance,
                        travelTime,
                        geometry
                );

                adjacency
                        .computeIfAbsent(
                                source,
                                k -> new ArrayList<>()
                        )
                        .add(edge);

                edgeCount++;
            }

            System.out.println(
                    "Loaded directed edges: " + edgeCount
            );
        }
    }

    // ---------------- DISTANCE CALCULATION ----------------

    private static double haversine(
            double lat1, double lon1,
            double lat2, double lon2) {

        double latDifference =
                Math.toRadians(lat2 - lat1);

        double lonDifference =
                Math.toRadians(lon2 - lon1);

        double a =
                Math.sin(latDifference / 2) *
                Math.sin(latDifference / 2) +

                Math.cos(Math.toRadians(lat1)) *
                Math.cos(Math.toRadians(lat2)) *

                Math.sin(lonDifference / 2) *
                Math.sin(lonDifference / 2);

        double c = 2 * Math.atan2(
                Math.sqrt(a),
                Math.sqrt(1 - a)
        );

        return EARTH_RADIUS * c;
    }

    // ---------------- NEAREST ROAD NODE ----------------

    private Node findNearestNode(
            double latitude,
            double longitude) {

        Node nearest = null;
        double minimumDistance = Double.MAX_VALUE;

        for (Node node : nodes.values()) {

            double distance = haversine(
                    latitude,
                    longitude,
                    node.latitude,
                    node.longitude
            );

            if (distance < minimumDistance) {
                minimumDistance = distance;
                nearest = node;
            }
        }

        if (nearest == null) {
            throw new IllegalStateException(
                    "Road network contains no nodes."
            );
        }

        return nearest;
    }

    // ---------------- DIJKSTRA ALGORITHM ----------------

    public RouteResult findFastestRoute(
            double pickupLat,
            double pickupLon,
            double dropLat,
            double dropLon) {

        Node start = findNearestNode(pickupLat, pickupLon);
        Node destination = findNearestNode(dropLat, dropLon);

        System.out.println("\nPickup road node: " + start.id);
        System.out.println("Destination road node: " + destination.id);

        Map<Long, Double> distances = new HashMap<>();
        Map<Long, Edge> previousEdges = new HashMap<>();

        PriorityQueue<State> queue = new PriorityQueue<>();

        Set<Long> visited = new HashSet<>();

        distances.put(start.id, 0.0);
        queue.add(new State(start.id, 0.0));

        int visitedCount = 0;

        while (!queue.isEmpty()) {

            State current = queue.poll();

            if (visited.contains(current.nodeId)) {
                continue;
            }

            visited.add(current.nodeId);
            visitedCount++;

            if (current.nodeId == destination.id) {
                break;
            }

            List<Edge> outgoing =
                    adjacency.getOrDefault(
                            current.nodeId,
                            Collections.emptyList()
                    );

            for (Edge edge : outgoing) {

                if (visited.contains(edge.target)) {
                    continue;
                }

                double newTime =
                        current.time + edge.travelTime;

                double oldTime = distances.getOrDefault(
                        edge.target,
                        Double.MAX_VALUE
                );

                if (newTime < oldTime) {

                    distances.put(edge.target, newTime);

                    previousEdges.put(edge.target, edge);

                    queue.add(
                            new State(edge.target, newTime)
                    );
                }
            }
        }

        if (!distances.containsKey(destination.id)) {
            throw new IllegalStateException(
                    "No route found between these locations."
            );
        }

        // Reconstruct the shortest-time path.
        List<Edge> routeEdges = new ArrayList<>();

        long current = destination.id;

        while (current != start.id) {

            Edge edge = previousEdges.get(current);

            if (edge == null) {
                throw new IllegalStateException(
                        "Could not reconstruct route."
                );
            }

            routeEdges.add(edge);
            current = edge.source;
        }

        Collections.reverse(routeEdges);

        RouteResult result = new RouteResult();

        result.startNode = start.id;
        result.endNode = destination.id;
        result.visitedNodes = visitedCount;

        for (Edge edge : routeEdges) {

            result.totalDistance += edge.distance;
            result.totalTime += edge.travelTime;

            for (Point point : edge.geometry) {

                if (!result.coordinates.isEmpty()) {

                    Point previous =
                            result.coordinates.get(
                                    result.coordinates.size() - 1
                            );

                    if (haversine(
                            previous.latitude,
                            previous.longitude,
                            point.latitude,
                            point.longitude
                    ) < 0.5) {
                        continue;
                    }
                }

                result.coordinates.add(point);
            }
        }

        return result;
    }

    // ---------------- OUTPUT ----------------

    private static void printRoute(RouteResult result) {

        System.out.println("\n========== RIDEFLOW ROUTE ==========");

        System.out.printf(
                Locale.US,
                "Distance: %.2f km%n",
                result.totalDistance / 1000.0
        );

        System.out.printf(
                Locale.US,
                "Travel time: %.2f minutes%n",
                result.totalTime / 60.0
        );

        System.out.println(
                "Visited nodes: " + result.visitedNodes
        );

        System.out.println(
                "Route coordinates: " + result.coordinates.size()
        );

        System.out.println(
                "Algorithm: Dijkstra (travel-time weight)"
        );

        System.out.println("\nLeaflet coordinates:");

        System.out.println("[");

        for (int i = 0; i < result.coordinates.size(); i++) {

            Point point = result.coordinates.get(i);

            System.out.printf(
                    Locale.US,
                    "  [%.7f, %.7f]%s%n",
                    point.latitude,
                    point.longitude,
                    i == result.coordinates.size() - 1 ? "" : ","
            );
        }

        System.out.println("]");
        System.out.println("====================================");
    }

    // ---------------- HTTP ROUTING API ----------------

    // Reads a numeric field from the small JSON request body.
    // Expected request: {"pickupLat":...,"pickupLon":...,"dropLat":...,"dropLon":...}
    private static double readNumber(String json, String key) {

        Pattern pattern = Pattern.compile(
                "\\\"" + Pattern.quote(key) +
                "\\\"\\s*:\\s*(-?\\d+(?:\\.\\d+)?)"
        );

        Matcher matcher = pattern.matcher(json);

        if (!matcher.find()) {
            throw new IllegalArgumentException(
                    "Missing or invalid field: " + key
            );
        }

        return Double.parseDouble(matcher.group(1));
    }

    private static String createRouteJson(
            RouteResult result,
            double pickupLat,
            double pickupLon,
            double dropLat,
            double dropLon) {

        StringBuilder json = new StringBuilder();

        json.append("{");
        json.append("\"success\":true,");
        json.append("\"algorithm\":\"Dijkstra\",");
        json.append("\"weight\":\"travel_time_s\",");

        json.append("\"distanceKm\":")
                .append(String.format(
                        Locale.US, "%.3f",
                        result.totalDistance / 1000.0
                ))
                .append(",");

        json.append("\"durationMinutes\":")
                .append(String.format(
                        Locale.US, "%.2f",
                        result.totalTime / 60.0
                ))
                .append(",");

        json.append("\"visitedNodes\":")
                .append(result.visitedNodes)
                .append(",");

        json.append("\"routeCoordinates\":[");

        // Include the exact requested pickup coordinate before the snapped road path.
        json.append(String.format(
                Locale.US,
                "[%.7f,%.7f]",
                pickupLat,
                pickupLon
        ));

        // Dijkstra's reconstructed OSM road geometry, in Leaflet [lat, lon] order.
        for (Point point : result.coordinates) {
            json.append(",");
            json.append(String.format(
                    Locale.US,
                    "[%.7f,%.7f]",
                    point.latitude,
                    point.longitude
            ));
        }

        // Include the exact requested destination coordinate.
        json.append(",");
        json.append(String.format(
                Locale.US,
                "[%.7f,%.7f]",
                dropLat,
                dropLon
        ));

        json.append("]}");
        return json.toString();
    }

    private static void sendJson(
            HttpExchange exchange,
            int status,
            String response) throws IOException {

        byte[] bytes = response.getBytes(StandardCharsets.UTF_8);

        exchange.getResponseHeaders().set(
                "Content-Type", "application/json; charset=UTF-8"
        );
        exchange.getResponseHeaders().set(
                "Access-Control-Allow-Origin", "http://localhost:5173"
        );
        exchange.getResponseHeaders().set(
                "Vary", "Origin"
        );

        exchange.sendResponseHeaders(status, bytes.length);

        try (var output = exchange.getResponseBody()) {
            output.write(bytes);
        }
    }

    private static void startHttpServer(DijkstraRouter router) throws IOException {

        // Localhost binding keeps this development service off the public network.
        HttpServer server = HttpServer.create(
                new InetSocketAddress("127.0.0.1", 8081),
                0
        );

        server.createContext("/api/route", exchange -> {

            try {
                String method = exchange.getRequestMethod();

                // Handle browser CORS preflight requests.
                if ("OPTIONS".equalsIgnoreCase(method)) {
                    exchange.getResponseHeaders().set(
                            "Access-Control-Allow-Origin", "http://localhost:5173"
                    );
                    exchange.getResponseHeaders().set(
                            "Access-Control-Allow-Methods", "POST, OPTIONS"
                    );
                    exchange.getResponseHeaders().set(
                            "Access-Control-Allow-Headers", "Content-Type"
                    );
                    exchange.getResponseHeaders().set("Vary", "Origin");
                    exchange.sendResponseHeaders(204, -1);
                    exchange.close();
                    return;
                }

                if (!"POST".equalsIgnoreCase(method)) {
                    sendJson(exchange, 405,
                            "{\"success\":false,\"error\":\"Use POST\"}");
                    return;
                }

                String origin = exchange.getRequestHeaders().getFirst("Origin");
                if (origin != null &&
                        !origin.equals("http://localhost:5173") &&
                        !origin.equals("http://127.0.0.1:5173")) {
                    sendJson(exchange, 403,
                            "{\"success\":false,\"error\":\"Origin not allowed\"}");
                    return;
                }

                String requestBody = new String(
                        exchange.getRequestBody().readAllBytes(),
                        StandardCharsets.UTF_8
                );

                double pickupLat = readNumber(requestBody, "pickupLat");
                double pickupLon = readNumber(requestBody, "pickupLon");
                double dropLat = readNumber(requestBody, "dropLat");
                double dropLon = readNumber(requestBody, "dropLon");

                // Validate coordinate ranges and reject invalid input early.
                if (!Double.isFinite(pickupLat) || !Double.isFinite(pickupLon) ||
                    !Double.isFinite(dropLat) || !Double.isFinite(dropLon) ||
                    pickupLat < -90 || pickupLat > 90 ||
                    dropLat < -90 || dropLat > 90 ||
                    pickupLon < -180 || pickupLon > 180 ||
                    dropLon < -180 || dropLon > 180) {
                    throw new IllegalArgumentException(
                            "Coordinates are outside valid geographic ranges."
                    );
                }

                System.out.println("\nAPI route request received.");

                RouteResult result = router.findFastestRoute(
                        pickupLat, pickupLon, dropLat, dropLon
                );

                String response = createRouteJson(
                        result, pickupLat, pickupLon, dropLat, dropLon
                );

                sendJson(exchange, 200, response);

                System.out.printf(
                        Locale.US,
                        "Route completed: %.2f km, %.2f minutes, %d visited nodes%n",
                        result.totalDistance / 1000.0,
                        result.totalTime / 60.0,
                        result.visitedNodes
                );

            } catch (IllegalArgumentException error) {
                String message = error.getMessage() == null
                        ? "Invalid route request."
                        : error.getMessage();
                String safeMessage = message
                        .replace("\\", "\\\\")
                        .replace("\"", "\\\"")
                        .replace("\r", " ")
                        .replace("\n", " ");
                sendJson(exchange, 400,
                        "{\"success\":false,\"error\":\"" + safeMessage + "\"}");

            } catch (Exception error) {
                error.printStackTrace();
                String message = error.getMessage() == null
                        ? "Unable to calculate route."
                        : error.getMessage();
                String safeMessage = message
                        .replace("\\", "\\\\")
                        .replace("\"", "\\\"")
                        .replace("\r", " ")
                        .replace("\n", " ");
                sendJson(exchange, 500,
                        "{\"success\":false,\"error\":\"" + safeMessage + "\"}");
            }
        });

        server.setExecutor(
                java.util.concurrent.Executors.newFixedThreadPool(4)
        );
        server.start();

        System.out.println("\n======================================");
        System.out.println(" RIDEFLOW DIJKSTRA ROUTING API");
        System.out.println(" Server: http://localhost:8081");
        System.out.println(" Endpoint: POST /api/route");
        System.out.println(" Status: RUNNING");
        System.out.println("======================================");
    }

    // ---------------- MAIN ----------------

    public static void main(String[] args) {

        try {
            DijkstraRouter router = new DijkstraRouter();
            router.loadNodes();
            router.loadEdges();

            // Preserve the original command-line route test.
            if (args.length == 4) {
                double pickupLat = Double.parseDouble(args[0]);
                double pickupLon = Double.parseDouble(args[1]);
                double dropLat = Double.parseDouble(args[2]);
                double dropLon = Double.parseDouble(args[3]);

                RouteResult result = router.findFastestRoute(
                        pickupLat, pickupLon, dropLat, dropLon
                );
                printRoute(result);
                return;
            }

            // No arguments: start the HTTP API for the React application.
            startHttpServer(router);

        } catch (Exception error) {
            System.err.println(
                    "RIDEFLOW ROUTING ERROR: " + error.getMessage()
            );
            error.printStackTrace();
        }
    }
}
