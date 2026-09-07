
import "./Dashboard.css";
import StatsBar from "../components/StatsBar";
import FilterBar from "../components/FilterBar";
import KanbanBoard from "../components/KanbanBoard";

export default function Dashboard() {
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>FlowTask AI</h1>
          <p>Stay focused. Finish more.</p>
        </div>
      </header>

      <StatsBar />
      <FilterBar />
      <KanbanBoard />
    </div>
  );
}
