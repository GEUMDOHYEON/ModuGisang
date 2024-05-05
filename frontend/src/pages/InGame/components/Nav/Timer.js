import React, { useContext } from 'react';
import { GameContext, ChallengeContext } from '../../../../contexts';
import useCheckTime from '../../../../hooks/useCheckTime';
import Countdown from 'react-countdown';
import styled from 'styled-components';

const Timer = () => {
  const { challengeData } = useContext(ChallengeContext);
  const { inGameMode } = useContext(GameContext);
  const { remainingTime, isTimePast } = useCheckTime(challengeData?.wakeTime);

  const CountDownUI = props => {
    const { formatted, milliseconds, completed } = props;
    const { minutes, seconds } = formatted;
    const formattedMS =
      milliseconds / 10 > 10
        ? (milliseconds / 10).toFixed(0)
        : `0${(milliseconds / 10).toFixed(0)}`;

    if (completed) {
      return <span>Time's up!</span>;
    } else {
      return (
        <>
          <TimerText>{minutes}</TimerText>:<TimerText>{seconds}</TimerText>:{' '}
          <TimerText>{formattedMS}</TimerText>
        </>
      );
    }
  };

  if (inGameMode !== 0 || isTimePast) return null;
  return (
    <Wrapper>
      <Countdown
        date={Date.now() + remainingTime}
        intervalDelay={0}
        precision={2}
        zeroPadTime={2}
        onComplete={() => console.log('complete')}
        renderer={CountDownUI}
      />
    </Wrapper>
  );
};

export default Timer;

const Wrapper = styled.div`
  margin: 80px;
  ${({ theme }) => theme.flex.center}
  font: 700 80px 'Jua';
`;

const TimerText = styled.div`
  width: 100px;
  text-align: center;
`;
