import type { RoomState } from '../../../shared/types';

export default function TeamBar({ room, progress }: { room: RoomState; progress?: string }) {
  return (
    <div className="team-bar">
      <div className="team-bar-side red">
        <span className="team-bar-name">RED</span>
        <span className="team-bar-score">{room.teamScores.red}</span>
      </div>
      {progress && <div className="team-bar-progress">{progress}</div>}
      <div className="team-bar-side blue">
        <span className="team-bar-score">{room.teamScores.blue}</span>
        <span className="team-bar-name">BLUE</span>
      </div>
    </div>
  );
}
