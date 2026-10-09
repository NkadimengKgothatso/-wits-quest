# System Architecture

How the parts of Wits Quest fit together. The app and the API are separate programs that talk over HTTPS and WebSockets.

```mermaid
graph TD
    subgraph Phone ["Player's phone or browser"]
        App["React app (Vite)<br/>hosted on Vercel"]
        Queue["Offline answer queue<br/>(IndexedDB)"]
        Map["Campus map<br/>(Leaflet)"]
    end

    subgraph Server ["Backend on Render"]
        API["Express REST API<br/>/api and /api/v1"]
        WS["Socket.IO<br/>live battles and ranked queue"]
    end

    subgraph Supabase ["Supabase"]
        DB[("PostgreSQL database")]
        Auth["Supabase Auth<br/>sign-up, login, password reset"]
        Store["Storage<br/>card images"]
    end

    ORS["OpenRouteService<br/>walking directions"]
    FOS["FOSSGIS router<br/>backup walking directions"]

    App <--> Queue
    App <--> Map
    App -->|sign in| Auth
    App <-->|HTTPS + login token| API
    App <-->|WebSocket| WS
    API -->|checks token| Auth
    API <--> DB
    WS <--> DB
    API --> Store
    API -->|walking route| ORS
    API -.->|if OpenRouteService fails| FOS
```

- **The app** shows the map, cards and battles. It signs players in directly with Supabase Auth and sends the login token with every API call.
- **The API** checks the token, applies all the game rules (location, answers, battles, rewards) and reads and writes the database. Live battles run over Socket.IO on the same server, which keeps the match state while it's being played.
- **Supabase** provides the database, login and image storage. It does not generate our API. Every endpoint is our own code.
- **OpenRouteService** is the external API we call for walking directions to the next event. If it fails, the API asks the free **FOSSGIS** walking router instead, and the app draws a straight line only if both fail. Routes are cached for an hour.
