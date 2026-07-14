import type { Player, RoomState } from '../../../shared/types';
import TeamBar from './TeamBar';
import GameFooter from './GameFooter';
import QuizRound from './QuizRound';
import ScrambleRound from './ScrambleRound';
import ReactionRound from './ReactionRound';
import PersonaRound from './PersonaRound';

interface Props {
  room: RoomState;
  me: Player;
  onLeave: () => void;
}

export default function RoundView({ room, me, onLeave }: Props) {
  const round = room.round!;
  const answeredCount = room.players.filter((p) => p.answered).length;
  const teammates = room.players.filter((p) => p.team === me.team);
  const teammatesIn = teammates.filter((p) => p.answered).length;

  return (
    <div className="game">
      <TeamBar room={room} progress={`Round ${round.index + 1}/${round.total}`} />

      {round.game === 'quiz' && <QuizRound round={round} me={me} />}
      {round.game === 'scramble' && <ScrambleRound round={round} me={me} />}
      {round.game === 'reaction' && <ReactionRound round={round} me={me} />}
      {round.game === 'persona' && <PersonaRound round={round} me={me} />}

      <p className="answer-progress">
        {answeredCount}/{room.players.length} done · your team: {teammatesIn}/{teammates.length}
        {me.streak >= 2 && <span className="streak-flame"> · 🔥 {me.streak} streak</span>}
      </p>

      <GameFooter me={me} onLeave={onLeave} />
    </div>
  );
}
