
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Boxes,
  BrainCircuit,
  CheckCircle2,
  Clock3,
  Code2,
  Database,
  GitBranch,
  Gauge,
  Layers3,
  LockKeyhole,
  MapPin,
  Network,
  Route,
  Search,
  ShieldCheck,
  Table2,
  Workflow,
  Zap,
  Users,
  CarFront,
  FileCode2,
  History,
  Server,
  Timer,
  Map,
} from "lucide-react";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import "./StudyPages.css";

/* =========================================================
   SHARED COMPONENTS
========================================================= */

type Topic = {
  icon: LucideIcon;
  number: string;
  title: string;
  description: string;
  points: string[];
};

function StudyHeader({
  label,
  title,
  accent,
  description,
  icon: Icon,
}: {
  label: string;
  title: string;
  accent: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <section className="study-hero">
      <Link to="/" className="study-back">
        <ArrowLeft size={16} /> Back to RideFlow
      </Link>

      <div className="study-hero-content">
        <div className="study-eyebrow">
          <Icon size={16} />
          {label}
        </div>

        <h1>
          {title}
          <br />
          <span>{accent}</span>
        </h1>

        <p>{description}</p>
      </div>
    </section>
  );
}

function StudyStats({
  items,
}: {
  items: { value: string; label: string }[];
}) {
  return (
    <div className="study-stats">
      {items.map((item) => (
        <div className="study-stat" key={item.label}>
          <strong>{item.value}</strong>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function TopicCard({ topic }: { topic: Topic }) {
  const Icon = topic.icon;

  return (
    <article className="topic-card">
      <div className="topic-topline">
        <span>{topic.number}</span>
        <Icon size={21} />
      </div>

      <h3>{topic.title}</h3>
      <p>{topic.description}</p>

      <ul>
        {topic.points.map((point) => (
          <li key={point}>
            <CheckCircle2 size={15} />
            {point}
          </li>
        ))}
      </ul>
    </article>
  );
}

function CodePanel({
  title,
  language,
  children,
}: {
  title: string;
  language: string;
  children: string;
}) {
  return (
    <div className="study-code-panel">
      <div className="study-code-header">
        <div className="code-dots">
          <i />
          <i />
          <i />
        </div>
        <span>{title}</span>
        <small>{language}</small>
      </div>
      <pre>
        <code>{children}</code>
      </pre>
    </div>
  );
}

function StudyFooter() {
  return (
    <div className="study-footer">
      <div>
        <span className="study-footer-label">RIDEFLOW PROJECT</span>
        <h3>Technology behind every journey.</h3>
        <p>
          Explore how algorithms and database systems work together
          to power our mobility platform.
        </p>
      </div>

      <Link to="/" className="study-home-button">
        Return home <ArrowUpRight size={17} />
      </Link>
    </div>
  );
}

function SectionHeading({
  label,
  title,
  description,
}: {
  label: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="study-section-heading">
      <span>{label}</span>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}

function Note({
  icon: Icon,
  children,
}: {
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <div className="study-note">
      <Icon size={19} />
      <p>{children}</p>
    </div>
  );
}

/* =========================================================
   ADSA PAGE — REAL RIDEFLOW DIJKSTRA IMPLEMENTATION
========================================================= */

const adsaTopics: Topic[] = [
  {
    number: "01 / GRAPH MODEL",
    icon: Network,
    title: "Road network as a graph",
    description:
      "RideFlow converts the Tricity road network into a graph so that a computer can calculate a route.",
    points: [
      "A vertex represents a road intersection or mapped road point.",
      "An edge represents a road connection between two nodes.",
      "Edges are directed, so one-way roads can be represented.",
      "The graph is loaded from road_nodes.csv and road_edges.csv.",
    ],
  },
  {
    number: "02 / WEIGHTED EDGES",
    icon: Gauge,
    title: "Travel-time weights",
    description:
      "Every road connection has a distance and an estimated travel time.",
    points: [
      "distance_m stores the length of a road segment.",
      "travel_time_s stores its estimated travel time in seconds.",
      "RideFlow currently optimizes travel time.",
      "All edge weights must be positive for this implementation.",
    ],
  },
  {
    number: "03 / DATA STRUCTURES",
    icon: Boxes,
    title: "How Java stores the graph",
    description:
      "Java collections allow the router to store road nodes and quickly explore connected roads.",
    points: [
      "HashMap stores nodes using their IDs.",
      "Another HashMap stores adjacency lists.",
      "ArrayList stores outgoing edges from a node.",
      "PriorityQueue selects the next lowest-time state.",
    ],
  },
  {
    number: "04 / ALGORITHM",
    icon: GitBranch,
    title: "Dijkstra's algorithm",
    description:
      "Dijkstra explores possible paths and keeps the best known travel time to each reachable node.",
    points: [
      "Start node gets a distance of zero.",
      "Other nodes initially have infinite distance.",
      "The minimum-time node is removed from the priority queue.",
      "A neighbour is updated when a faster path is found.",
    ],
  },
  {
    number: "05 / PATH RECONSTRUCTION",
    icon: Route,
    title: "Building the final route",
    description:
      "After reaching the destination, RideFlow uses previously stored edges to rebuild the route.",
    points: [
      "previousEdges stores the edge used to reach each node.",
      "The algorithm walks backwards from destination to source.",
      "The edge list is reversed into travel order.",
      "Distance, time and road geometry are combined.",
    ],
  },
  {
    number: "06 / API INTEGRATION",
    icon: Workflow,
    title: "Java routing API",
    description:
      "The Java program exposes a local HTTP endpoint that the RideFlow frontend can call.",
    points: [
      "The endpoint is POST /api/route.",
      "The request contains pickup and drop coordinates.",
      "The response contains distance, duration and route coordinates.",
      "The frontend can draw the returned path on its map.",
    ],
  },
];

export function AdsaPage() {
  return (
    <div className="study-page adsa-page">
      <StudyHeader
        label="ADSA · ALGORITHM DESIGN & ANALYSIS"
        title="Shortest paths."
        accent="Smarter journeys."
        description="The algorithmic intelligence behind RideFlow. Our Java routing engine models the Tricity road network as a directed weighted graph and uses Dijkstra's algorithm to find the fastest estimated route."
        icon={BrainCircuit}
      />

      <main className="study-content">
        <StudyStats
          items={[
            { value: "Dijkstra", label: "Routing algorithm" },
            { value: "Java", label: "Implementation language" },
            { value: "O((V+E) log V)", label: "Typical heap-based complexity" },
          ]}
        />

        <section className="study-section">
          <SectionHeading
            label="START WITH THE BASICS"
            title="What problem are we solving?"
            description="Imagine a passenger wants to travel from Chandigarh University to Elante Mall. There may be several possible roads. RideFlow needs to find a route with the lowest estimated travel time."
          />

          <div className="domain-grid">
            <div className="domain-card">
              <MapPin size={20} />
              <div>
                <h3>Pickup location</h3>
                <p>The passenger's selected starting coordinate.</p>
              </div>
            </div>
            <div className="domain-card">
              <MapPin size={20} />
              <div>
                <h3>Destination</h3>
                <p>The location where the passenger wants to go.</p>
              </div>
            </div>
            <div className="domain-card">
              <Network size={20} />
              <div>
                <h3>Road graph</h3>
                <p>Road intersections connected by weighted road segments.</p>
              </div>
            </div>
            <div className="domain-card">
              <Timer size={20} />
              <div>
                <h3>Goal</h3>
                <p>Find the connected path with minimum estimated travel time.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="study-section">
          <SectionHeading
            label="CONCEPTS USED IN OUR CODE"
            title="The building blocks of Dijkstra"
            description="These are the actual concepts used by DijkstraRouter.java, explained in simple language."
          />

          <div className="topic-grid">
            {adsaTopics.map((topic) => (
              <TopicCard topic={topic} key={topic.number} />
            ))}
          </div>
        </section>

        <section className="study-section study-split">
          <SectionHeading
            label="HOW IT WORKS"
            title="From pickup to destination"
            description="Think of each road intersection as a point on a network. The algorithm checks connected roads and keeps improving the estimated time until it reaches the destination."
          />

          <div className="algorithm-flow">
            {[
              [
                "01",
                "Read road data",
                "Load road nodes and road edges from the two CSV files.",
              ],
              [
                "02",
                "Find nearest nodes",
                "Use the Haversine formula to find the road node closest to pickup and destination.",
              ],
              [
                "03",
                "Initialize",
                "Set the pickup node time to zero and add it to the priority queue.",
              ],
              [
                "04",
                "Select minimum",
                "Remove the node with the lowest known travel time from the queue.",
              ],
              [
                "05",
                "Relax connected roads",
                "Calculate current time plus edge travel time. Update a neighbour if this is faster.",
              ],
              [
                "06",
                "Reconstruct route",
                "Follow previous edges backwards, reverse the path and calculate final distance and time.",
              ],
            ].map(([number, title, detail]) => (
              <div className="algorithm-step" key={number}>
                <span className="algorithm-step-number">{number}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="study-section">
          <SectionHeading
            label="REAL JAVA IMPLEMENTATION"
            title="How our graph is stored"
            description="These are the core structures used in your actual Java file."
          />

          <CodePanel title="DijkstraRouter.java" language="JAVA">
{`// Store all road nodes using their IDs
private final Map<Long, Node> nodes =
    new HashMap<>();

// Store outgoing roads for every node
private final Map<Long, List<Edge>> adjacency =
    new HashMap<>();

// Priority queue chooses the smallest travel time
PriorityQueue<State> queue =
    new PriorityQueue<>();

// Store the best known time to each node
Map<Long, Double> distances =
    new HashMap<>();

// Remember the edge used to reach each node
Map<Long, Edge> previousEdges =
    new HashMap<>();`}
          </CodePanel>

          <Note icon={BookOpen}>
            <strong>Simple explanation:</strong> Think of the adjacency list
            as a notebook. Each road intersection has a list of roads that
            leave it. The priority queue tells the algorithm which reachable
            intersection is currently cheapest in terms of travel time.
          </Note>
        </section>

        <section className="study-section">
          <SectionHeading
            label="THE MOST IMPORTANT OPERATION"
            title="Edge relaxation"
            description="Relaxation means checking whether reaching a neighbour through the current road gives us a faster route."
          />

          <CodePanel title="DijkstraRouter.java" language="JAVA">
{`double newTime =
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
}`}
          </CodePanel>

          <div className="complexity-grid">
            <div>
              <Gauge size={21} />
              <h3>Example</h3>
              <strong>10 + 5 = 15</strong>
              <p>
                If we reach a road node in 10 seconds and the next road takes
                5 seconds, the new estimated time is 15 seconds.
              </p>
            </div>
            <div>
              <CheckCircle2 size={21} />
              <h3>Decision</h3>
              <strong>15 less than 20</strong>
              <p>
                If the old route took 20 seconds, replace it with the new
                15-second route and remember the new predecessor edge.
              </p>
            </div>
          </div>
        </section>

        <section className="study-section">
          <SectionHeading
            label="REAL CODE EXAMPLE"
            title="Finding the nearest road node"
            description="Before running Dijkstra, RideFlow maps the exact pickup and destination coordinates to nearby nodes in its road graph."
          />

          <CodePanel title="DijkstraRouter.java" language="JAVA">
{`private Node findNearestNode(
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

    return nearest;
}`}
          </CodePanel>

          <Note icon={Map}>
            <strong>Haversine formula:</strong> This formula estimates the
            distance between two geographic coordinates on Earth. Our
            implementation checks the loaded nodes and selects the closest
            one. This nearest-node search is a linear scan through the nodes.
          </Note>
        </section>

        <section className="study-section">
          <SectionHeading
            label="ROUTE RECONSTRUCTION"
            title="How the final path is created"
            description="Dijkstra stores the previous edge for every improved node. Once the destination is reached, the algorithm walks backwards through those edges."
          />

          <CodePanel title="DijkstraRouter.java" language="JAVA">
{`List<Edge> routeEdges = new ArrayList<>();

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

Collections.reverse(routeEdges);`}
          </CodePanel>

          <Note icon={Route}>
            <strong>Think of it like breadcrumbs:</strong> Each edge tells us
            which road we used to reach the current node. We follow those
            breadcrumbs backwards, then reverse them to get the correct
            pickup-to-destination order.
          </Note>
        </section>

        <section className="study-section">
          <SectionHeading
            label="COMPLEXITY ANALYSIS"
            title="How efficient is our algorithm?"
            description="For an adjacency-list graph with a binary heap, Dijkstra is commonly expressed with the following complexity."
          />

          <div className="complexity-grid">
            <div>
              <Clock3 size={21} />
              <h3>Time complexity</h3>
              <strong>O((V + E) log V)</strong>
              <p>
                V means vertices or road nodes. E means edges or road
                connections. The priority queue helps select the next
                lowest-time node efficiently.
              </p>
            </div>
            <div>
              <Boxes size={21} />
              <h3>Space complexity</h3>
              <strong>O(V + E)</strong>
              <p>
                The graph, adjacency lists, distance map, predecessor map
                and visited set store information about nodes and edges.
              </p>
            </div>
          </div>

          <Note icon={Gauge}>
            <strong>Implementation detail:</strong> Your Java implementation
            uses Java's PriorityQueue and may insert multiple states for the
            same node. Already-visited states are skipped when removed.
            The complexity shown here is the standard heap-based
            adjacency-list analysis.
          </Note>
        </section>

        <section className="study-section">
          <SectionHeading
            label="SYSTEM INTEGRATION"
            title="How Java connects to RideFlow"
            description="The React application sends coordinates to the Java HTTP API. Java calculates the route and sends the result back as JSON."
          />

          <div className="integration-flow">
            <div>
              <MapPin />
              <strong>React frontend</strong>
              <span>Pickup and destination</span>
            </div>
            <ArrowRight />
            <div>
              <Server />
              <strong>HTTP request</strong>
              <span>POST /api/route</span>
            </div>
            <ArrowRight />
            <div>
              <BrainCircuit />
              <strong>Java Dijkstra</strong>
              <span>Fastest path</span>
            </div>
            <ArrowRight />
            <div>
              <Map />
              <strong>Route response</strong>
              <span>Coordinates and duration</span>
            </div>
          </div>

          <CodePanel title="Example API request" language="JSON">
{`{
  "pickupLat": 30.7,
  "pickupLon": 76.7,
  "dropLat": 30.7,
  "dropLon": 76.8
}`}
          </CodePanel>

          <CodePanel title="Example API response structure" language="JSON">
{`{
  "success": true,
  "algorithm": "Dijkstra",
  "weight": "travel_time_s",
  "distanceKm": 12.5,
  "durationMinutes": 24.0,
  "visitedNodes": 120,
  "routeCoordinates": [
    [30.7, 76.7],
    [30.71, 76.72],
    [30.7, 76.8]
  ]
}`}
          </CodePanel>

          <Note icon={Zap}>
            <strong>Important:</strong> The coordinates and numeric values
            above are illustrative examples of the response structure, not
            a real route calculation. Your actual Java API returns values
            calculated from its loaded road CSV files. It uses estimated
            travel-time weights, not live traffic prediction.
          </Note>
        </section>

        <StudyFooter />
      </main>
    </div>
  );
}

/* =========================================================
   DBMS PAGE — REAL RIDEFLOW DATABASE
========================================================= */

const dbmsTopics: Topic[] = [
  {
    number: "01 / RELATIONAL MODEL",
    icon: Table2,
    title: "Tables and relationships",
    description:
      "RideFlow stores different types of information in separate but connected PostgreSQL tables.",
    points: [
      "Users store passenger and driver account information.",
      "Drivers connect driver profiles to users.",
      "Vehicles connect vehicles to their drivers.",
      "Bookings and rides store the journey lifecycle.",
    ],
  },
  {
    number: "02 / KEYS",
    icon: Network,
    title: "Primary and foreign keys",
    description:
      "Keys help identify records and connect related information across tables.",
    points: [
      "A primary key uniquely identifies a row.",
      "A foreign key points to a related table.",
      "A booking belongs to a user.",
      "A ride refers to its booking and assigned vehicle.",
    ],
  },
  {
    number: "03 / NORMALIZATION",
    icon: Layers3,
    title: "Normalization",
    description:
      "Instead of putting every detail in one huge table, RideFlow separates information by purpose.",
    points: [
      "User information is stored in users.",
      "Driver-specific information is stored in drivers.",
      "Vehicle information is stored in vehicles.",
      "This reduces repeated data and update problems.",
    ],
  },
  {
    number: "04 / TRANSACTIONS",
    icon: Activity,
    title: "ACID properties",
    description:
      "Database transactions keep important ride operations reliable.",
    points: [
      "Atomicity: all transaction steps succeed or roll back.",
      "Consistency: database rules remain valid.",
      "Isolation: simultaneous operations are controlled.",
      "Durability: committed changes are saved.",
    ],
  },
  {
    number: "05 / TRIGGERS",
    icon: Workflow,
    title: "Automatic database actions",
    description:
      "Triggers automatically execute functions when certain database events happen.",
    points: [
      "Ride insert trigger records a ride event.",
      "Ride update trigger records status changes.",
      "Timestamp triggers maintain updated_at fields.",
      "This creates an audit trail of important changes.",
    ],
  },
  {
    number: "06 / VIEWS",
    icon: Search,
    title: "Views and reports",
    description:
      "Views turn raw database records into useful summaries without repeatedly writing complex joins.",
    points: [
      "v_driver_performance summarizes driver activity.",
      "v_vehicle_demand summarizes booking demand.",
      "v_monthly_revenue summarizes completed ride revenue.",
      "v_ride_event_history displays ride event records.",
    ],
  },
  {
    number: "07 / SPATIAL DATABASE",
    icon: MapPin,
    title: "PostgreSQL and PostGIS",
    description:
      "RideFlow stores geographic positions so that pickup and drop locations can be handled as spatial data.",
    points: [
      "Pickup and drop coordinates are stored as geography.",
      "Driver location is stored in driver_locations.",
      "PostGIS adds geographic operations to PostgreSQL.",
      "Spatial indexes can speed up nearby-location queries.",
    ],
  },
  {
    number: "08 / DATA INTEGRITY",
    icon: ShieldCheck,
    title: "Constraints and validation",
    description:
      "Database rules prevent invalid information from being stored.",
    points: [
      "NOT NULL prevents missing required values.",
      "UNIQUE prevents duplicate values in selected columns.",
      "CHECK validates values such as status and vehicle type.",
      "Foreign keys protect relationships between tables.",
    ],
  },
  {
    number: "09 / PERFORMANCE",
    icon: Gauge,
    title: "Indexes and optimization",
    description:
      "Indexes help PostgreSQL find records without scanning every row.",
    points: [
      "Primary keys have supporting indexes.",
      "Indexes can improve frequent lookup queries.",
      "GiST indexes are useful for spatial data.",
      "EXPLAIN ANALYZE helps inspect query performance.",
    ],
  },
];

const databaseTables = [
  {
    name: "users",
    icon: Users,
    purpose: "Stores account information for people using RideFlow.",
    fields: "id, full_name, email, phone, password_hash, role, created_at, updated_at",
    example: "A passenger or driver has one account record.",
  },
  {
    name: "drivers",
    icon: Users,
    purpose: "Stores information specific to a driver.",
    fields: "id, user_id, license_number, license_verified, is_available, rating",
    example: "Connects a driver profile to their users record.",
  },
  {
    name: "vehicles",
    icon: CarFront,
    purpose: "Stores the vehicles associated with drivers.",
    fields: "id, driver_id, vehicle_type, registration_number, make, model, color, capacity",
    example: "A driver can have a Bike, Auto, Mini, Sedan or SUV.",
  },
  {
    name: "bookings",
    icon: MapPin,
    purpose: "Stores the passenger's ride request.",
    fields: "id, user_id, pickup_address, dropoff_address, pickup_location, dropoff_location, vehicle_type, distance_km, estimated_duration_minutes, estimated_fare, status, scheduled_for",
    example: "A passenger requests a Bike from one location to another.",
  },
  {
    name: "driver_locations",
    icon: Map,
    purpose: "Stores the driver's geographic location and movement details.",
    fields: "driver_id, location, heading, speed_kmh, updated_at",
    example: "The system can store the driver's latest reported position.",
  },
  {
    name: "rides",
    icon: Route,
    purpose: "Stores the actual ride created from a booking.",
    fields: "id, booking_id, driver_id, vehicle_id, status, actual_distance_km, final_fare, accepted_at, started_at, completed_at",
    example: "Tracks a ride from acceptance to completion.",
  },
  {
    name: "ride_events",
    icon: History,
    purpose: "Stores events associated with a ride.",
    fields: "id, ride_id, actor_user_id, event_type, event_data, created_at",
    example: "Records events such as ride_requested and ride_status_changed.",
  },
];

export function DbmsPage() {
  return (
    <div className="study-page dbms-page">
      <StudyHeader
        label="DBMS · DATABASE MANAGEMENT SYSTEMS"
        title="Reliable data."
        accent="Intelligent systems."
        description="The database foundation behind RideFlow. We use PostgreSQL and PostGIS to store users, drivers, vehicles, bookings, ride information, geographic locations and event history."
        icon={Database}
      />

      <main className="study-content">
        <StudyStats
          items={[
            { value: "7", label: "Main application tables" },
            { value: "PostgreSQL", label: "Database system" },
            { value: "PostGIS", label: "Geographic extension" },
          ]}
        />

        <section className="study-section">
          <SectionHeading
            label="START WITH THE BASICS"
            title="What is a DBMS?"
            description="Imagine running a ride-booking service using notebooks. One notebook contains passengers, another contains drivers, and another contains bookings. A DBMS does this digitally and connects all the information safely."
          />

          <div className="domain-grid">
            <div className="domain-card">
              <Database size={20} />
              <div>
                <h3>Database</h3>
                <p>Where RideFlow stores its application records.</p>
              </div>
            </div>
            <div className="domain-card">
              <Table2 size={20} />
              <div>
                <h3>Tables</h3>
                <p>Organized collections of rows and columns.</p>
              </div>
            </div>
            <div className="domain-card">
              <Network size={20} />
              <div>
                <h3>Relationships</h3>
                <p>Connections between related records.</p>
              </div>
            </div>
            <div className="domain-card">
              <ShieldCheck size={20} />
              <div>
                <h3>Integrity</h3>
                <p>Rules that help prevent invalid data.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="study-section">
          <SectionHeading
            label="CONCEPTS USED IN RIDEFLOW"
            title="The DBMS concepts behind every ride"
            description="These concepts are connected to the actual database objects and queries created for RideFlow."
          />

          <div className="topic-grid dbms-topic-grid">
            {dbmsTopics.map((topic) => (
              <TopicCard topic={topic} key={topic.number} />
            ))}
          </div>
        </section>

        <section className="study-section">
          <SectionHeading
            label="ACTUAL DATABASE STRUCTURE"
            title="Meet our seven main tables"
            description="Each table has a specific responsibility. Together, they store the information needed to manage the RideFlow booking and ride lifecycle."
          />

          <div className="domain-grid">
            {databaseTables.map((table) => {
              const Icon = table.icon;

              return (
                <div className="domain-card" key={table.name}>
                  <Icon size={20} />
                  <div>
                    <h3>{table.name}</h3>
                    <p>{table.purpose}</p>
                    <p>
                      <strong>Example:</strong> {table.example}
                    </p>
                    <p>
                      <strong>Columns:</strong> {table.fields}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <Note icon={BookOpen}>
            <strong>How to explain this:</strong> We don't store everything
            in one table. For example, a driver's account is in users,
            driver-specific details are in drivers, and their vehicle
            information is in vehicles. The foreign keys connect them.
          </Note>
        </section>

        <section className="study-section">
          <SectionHeading
            label="RELATIONSHIPS"
            title="How the tables are connected"
            description="Follow the data from a user account to a completed ride."
          />

          <div className="integration-flow">
            <div>
              <Users />
              <strong>users</strong>
              <span>Account information</span>
            </div>
            <ArrowRight />
            <div>
              <CarFront />
              <strong>drivers</strong>
              <span>Driver profile</span>
            </div>
            <ArrowRight />
            <div>
              <Database />
              <strong>vehicles</strong>
              <span>Driver's vehicle</span>
            </div>
            <ArrowRight />
            <div>
              <Route />
              <strong>rides</strong>
              <span>Ride record</span>
            </div>
          </div>

          <div className="domain-grid">
            <div className="domain-card">
              <Users size={19} />
              <div>
                <h3>users → bookings</h3>
                <p>
                  bookings.user_id connects a booking to the passenger's
                  users record.
                </p>
              </div>
            </div>
            <div className="domain-card">
              <Database size={19} />
              <div>
                <h3>bookings → rides</h3>
                <p>
                  rides.booking_id connects the actual ride to the original
                  booking request.
                </p>
              </div>
            </div>
            <div className="domain-card">
              <CarFront size={19} />
              <div>
                <h3>drivers → vehicles</h3>
                <p>
                  vehicles.driver_id identifies the driver associated with
                  the vehicle.
                </p>
              </div>
            </div>
            <div className="domain-card">
              <History size={19} />
              <div>
                <h3>rides → ride_events</h3>
                <p>
                  ride_events.ride_id connects event history to a ride.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="study-section">
          <SectionHeading
            label="SQL IN ACTION"
            title="How we retrieve ride information"
            description="This query combines multiple tables to display the ride, its booking, the driver and the driver's account."
          />

          <CodePanel title="ride-details.sql" language="SQL">
{`SELECT
    r.id AS ride_id,
    r.status AS ride_status,
    b.status AS booking_status,
    u.full_name AS driver_name,
    d.is_available,
    v.registration_number
FROM public.rides r
JOIN public.bookings b
    ON b.id = r.booking_id
LEFT JOIN public.drivers d
    ON d.id = r.driver_id
LEFT JOIN public.users u
    ON u.id = d.user_id
LEFT JOIN public.vehicles v
    ON v.id = r.vehicle_id;`}
          </CodePanel>

          <Note icon={Search}>
            <strong>Simple explanation:</strong> JOIN combines matching
            information from different tables. Instead of storing the
            driver's name again in every ride, we retrieve it through
            the driver's user account.
          </Note>
        </section>

        <section className="study-section">
          <SectionHeading
            label="DATABASE VIEWS"
            title="Reports without rewriting complex queries"
            description="We created database views to make reporting easier. A view is like a saved query that can be read using SELECT."
          />

          <div className="domain-grid">
            {[
              [
                "v_driver_performance",
                "Shows driver ratings, availability and ride performance.",
              ],
              [
                "v_vehicle_demand",
                "Compares bookings and completed rides by vehicle type.",
              ],
              [
                "v_monthly_revenue",
                "Summarizes completed rides and revenue by month.",
              ],
              [
                "v_ride_event_history",
                "Displays the event history recorded for rides.",
              ],
            ].map(([name, description]) => (
              <div className="domain-card" key={name}>
                <Database size={19} />
                <div>
                  <h3>{name}</h3>
                  <p>{description}</p>
                </div>
              </div>
            ))}
          </div>

          <CodePanel title="view-query.sql" language="SQL">
{`-- Driver performance
SELECT *
FROM public.v_driver_performance;

-- Vehicle demand
SELECT *
FROM public.v_vehicle_demand;

-- Monthly revenue
SELECT *
FROM public.v_monthly_revenue;

-- Ride event history
SELECT *
FROM public.v_ride_event_history
ORDER BY created_at DESC;`}
          </CodePanel>

          <Note icon={Activity}>
            <strong>Real project example:</strong> We queried these views
            in Supabase and retrieved driver performance, vehicle demand,
            monthly revenue and ride event history from the stored data.
          </Note>
        </section>

        <section className="study-section study-split">
          <SectionHeading
            label="TRANSACTIONS"
            title="What happens when a ride starts?"
            description="A ride operation may update multiple records. A transaction helps keep these changes consistent."
          />

          <div className="algorithm-flow">
            {[
              [
                "01",
                "Check the ride",
                "Identify the ride that needs to start.",
              ],
              [
                "02",
                "Update ride status",
                "Change the ride status to in_progress.",
              ],
              [
                "03",
                "Update timestamp",
                "The database records when the ride started.",
              ],
              [
                "04",
                "Record the event",
                "The status-change trigger records the change in ride_events.",
              ],
              [
                "05",
                "Commit",
                "The database saves the successful transaction.",
              ],
            ].map(([number, title, detail]) => (
              <div className="algorithm-step" key={number}>
                <span className="algorithm-step-number">{number}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="study-section">
          <SectionHeading
            label="REAL DATABASE FUNCTION"
            title="Starting a ride using SQL"
            description="We tested a PostgreSQL function called start_ride. It starts a ride using its ride ID and returns the updated ride record."
          />

          <CodePanel title="start-ride.sql" language="SQL">
{`-- Start a ride using its ride ID
SELECT *
FROM public.start_ride(
    '7f861dd5-97bf-4a69-93ca-0d352587532f'
);

-- Check the ride timestamps
SELECT
    id,
    status,
    accepted_at,
    started_at,
    completed_at
FROM public.rides
WHERE id =
    '7f861dd5-97bf-4a69-93ca-0d352587532f';`}
          </CodePanel>

          <Note icon={CheckCircle2}>
            <strong>What we verified:</strong> The tested ride changed to
            in_progress, and its accepted_at and started_at timestamps
            were populated. This is an actual database operation, not
            just an example query.
          </Note>
        </section>

        <section className="study-section">
          <SectionHeading
            label="TRIGGERS AND AUDIT HISTORY"
            title="How the database records changes automatically"
            description="A trigger tells PostgreSQL to run a function when a particular event happens, such as inserting or updating a ride."
          />

          <div className="domain-grid">
            <div className="domain-card">
              <Activity size={19} />
              <div>
                <h3>trg_ride_insert_event</h3>
                <p>Runs after a ride is inserted.</p>
              </div>
            </div>
            <div className="domain-card">
              <History size={19} />
              <div>
                <h3>trg_ride_update_event</h3>
                <p>Runs after a ride is updated.</p>
              </div>
            </div>
            <div className="domain-card">
              <Clock3 size={19} />
              <div>
                <h3>trg_ride_status_timestamps</h3>
                <p>Runs before a ride status update.</p>
              </div>
            </div>
            <div className="domain-card">
              <Database size={19} />
              <div>
                <h3>trg_rides_updated_at</h3>
                <p>Maintains the ride updated_at timestamp.</p>
              </div>
            </div>
          </div>

          <CodePanel title="trigger-check.sql" language="SQL">
{`SELECT
    event_object_table AS table_name,
    trigger_name,
    action_timing,
    event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table = 'rides'
ORDER BY trigger_name;`}
          </CodePanel>

          <CodePanel title="event-history.sql" language="SQL">
{`SELECT *
FROM public.v_ride_event_history
ORDER BY created_at DESC;`}
          </CodePanel>

          <Note icon={History}>
            <strong>Simple explanation:</strong> A trigger is like an
            automatic assistant inside the database. When a ride changes
            status, the trigger can record that event without the
            application having to manually create every audit record.
          </Note>
        </section>

        <section className="study-section">
          <SectionHeading
            label="POSTGIS"
            title="Storing real-world locations"
            description="A ride-booking application needs more than names and phone numbers. It also needs geographic coordinates."
          />

          <CodePanel title="spatial-data.sql" language="SQL">
{`-- Booking pickup and drop coordinates
SELECT
    id,
    pickup_address,
    dropoff_address,
    ST_AsText(pickup_location::geometry)
        AS pickup_coordinates,
    ST_AsText(dropoff_location::geometry)
        AS drop_coordinates
FROM public.bookings;

-- Driver location records
SELECT
    driver_id,
    ST_AsText(location::geometry)
        AS current_coordinates,
    heading,
    speed_kmh,
    updated_at
FROM public.driver_locations;`}
          </CodePanel>

          <Note icon={MapPin}>
            <strong>Simple explanation:</strong> PostGIS adds location
            features to PostgreSQL. A geography point can represent a
            pickup, destination or driver's location. This lets us work
            with real geographic positions instead of storing only
            plain text addresses.
          </Note>
        </section>

        <section className="study-section">
          <SectionHeading
            label="ACID PROPERTIES"
            title="Why database transactions matter"
            description="Suppose two passengers try to get the same available driver at almost the same time. Database transaction rules help prevent conflicting updates."
          />

          <div className="reliability-grid">
            <div>
              <ShieldCheck size={22} />
              <h3>Atomicity</h3>
              <p>
                All required changes succeed together, or the transaction
                is rolled back.
              </p>
            </div>
            <div>
              <CheckCircle2 size={22} />
              <h3>Consistency</h3>
              <p>
                Database constraints keep records within valid rules.
              </p>
            </div>
            <div>
              <LockKeyhole size={22} />
              <h3>Isolation</h3>
              <p>
                Concurrent operations are controlled to avoid conflicting
                changes.
              </p>
            </div>
          </div>

          <div className="reliability-grid">
            <div>
              <Database size={22} />
              <h3>Durability</h3>
              <p>
                Once a transaction commits, its changes are persisted
                by the database.
              </p>
            </div>
            <div>
              <Table2 size={22} />
              <h3>Constraints</h3>
              <p>
                Primary keys, foreign keys and check constraints protect
                data integrity.
              </p>
            </div>
            <div>
              <Gauge size={22} />
              <h3>Indexes</h3>
              <p>
                Indexes help the database locate records more efficiently.
              </p>
            </div>
          </div>
        </section>

        <section className="study-section">
          <SectionHeading
            label="LIVE DATABASE VALIDATION"
            title="We don't just create tables. We test them."
            description="During development, we executed SQL queries in the Supabase SQL Editor to verify the database structure, relationships, triggers, views and ride lifecycle."
          />

          <div className="domain-grid">
            {[
              [
                "Table verification",
                "Checked the application tables and their stored records.",
              ],
              [
                "Relationship verification",
                "Joined rides, bookings, drivers, users and vehicles.",
              ],
              [
                "Trigger verification",
                "Queried information_schema.triggers to inspect ride triggers.",
              ],
              [
                "Ride lifecycle",
                "Started and completed a ride, then checked the updated records.",
              ],
              [
                "Analytics verification",
                "Queried driver performance, vehicle demand and revenue views.",
              ],
              [
                "Data integrity checks",
                "Ran queries to find missing or inconsistent relationships.",
              ],
            ].map(([title, detail]) => (
              <div className="domain-card" key={title}>
                <CheckCircle2 size={19} />
                <div>
                  <h3>{title}</h3>
                  <p>{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <Note icon={BookOpen}>
          <strong>Presentation note:</strong> The current RideFlow database
          has seven main application tables, tested views and ride triggers.
          Features such as payment processing, refunds, advanced location
          history and large-scale partitioning are possible future
          extensions, not claims about the current implementation.
        </Note>

        <StudyFooter />
      </main>
    </div>
  );
}
