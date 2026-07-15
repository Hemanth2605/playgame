import type { ChatMessage, Player, RoomState } from '../../../shared/types';
import TeamBar from './TeamBar';
import GameFooter from './GameFooter';
import QuizRound from './QuizRound';
import ScrambleRound from './ScrambleRound';
import ReactionRound from './ReactionRound';
import PersonaRound from './PersonaRound';
import TeamChat from './TeamChat';

interface Props {
  room: RoomState;
  me: Player;
  chat: ChatMessage[];
  onLeave: () => void;
}

export default function RoundView({ room, me, chat, onLeave }: Props) {
  const round = room.round!;
  const answeredCount = room.players.filter((p) => p.answered).length;
  const teammates = room.players.filter((p) => p.team === me.team);
  const teammatesIn = teammates.filter((p) => p.answered).length;

  // Reaction Rush is always a free-for-all; captain mode only governs the
  // thinking games. The server enforces this too — this only shapes the UI.
  const captainMode = room.settings.answerMode === 'captain' && round.game !== 'reaction';
  const canAnswer = !captainMode || me.isCaptain;
  const captain = teammates.find((p) => p.isCaptain);

  return (
    <div className="game">
      <TeamBar room={room} progress={`Round ${round.index + 1}/${round.total}`} />

      {round.game === 'quiz' && <QuizRound round={round} me={me} canAnswer={canAnswer} />}
      {round.game === 'scramble' && <ScrambleRound round={round} me={me} canAnswer={canAnswer} />}
      {round.game === 'reaction' && <ReactionRound round={round} me={me} />}
      {round.game === 'persona' && <PersonaRound round={round} me={me} canAnswer={canAnswer} />}

      <TeamChat
        me={me}
        messages={chat}
        note={
          !captainMode
            ? undefined
            : canAnswer
              ? '🧢 You are captain — your team is advising you.'
              : `🧢 ${captain ? captain.name : 'Your captain'} answers for the team — tell them what to pick.`
        }
      />

      <p className="answer-progress">
        {answeredCount}/{room.players.length} done · your team: {teammatesIn}/{teammates.length}
        {me.streak >= 2 && <span className="streak-flame"> · 🔥 {me.streak} streak</span>}
      </p>

      <GameFooter me={me} onLeave={onLeave} />
    </div>
  );
}
