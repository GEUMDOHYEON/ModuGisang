import React, { useEffect, useState, useContext, useRef } from 'react';
import { GameContext, OpenViduContext } from '../../../contexts';
import styled from 'styled-components';

const MateVideo = ({ mateId, mateName }) => {
  const mateVideoRef = useRef(null);
  const { mateStreams } = useContext(OpenViduContext);
  const { matesMissionStatus } = useContext(GameContext);
  const [thisMate, setThisMate] = useState(undefined);
  const [mateStatus, setMateStatus] = useState({
    online: false,
    missionCompleted: false,
  });

  useEffect(() => {
    if (mateStreams.length > 0) {
      const thisMate = mateStreams.find(
        mate => JSON.parse(mate.stream.connection.data).userId === `${mateId}`,
      );
      if (thisMate) {
        setThisMate(thisMate);
        setMateStatus(prev => ({ ...prev, online: thisMate?.stream.hasVideo }));
      } else {
        setThisMate(null);
        setMateStatus(prev => ({ ...prev, online: false }));
      }
    } else {
      setThisMate(null);
      setMateStatus(prev => ({ ...prev, online: false }));
    }
  }, [mateStreams]);

  useEffect(() => {
    if (mateStatus.online) {
      thisMate.addVideoElement(mateVideoRef.current);
    }
  }, [thisMate]);

  useEffect(() => {
    if (matesMissionStatus[mateId]) {
      setMateStatus(prev => ({
        ...prev,
        missionCompleted: matesMissionStatus[mateId].missionCompleted,
      }));
    }
  }, [matesMissionStatus]);

  return (
    <Wrapper $mateOnLine={mateStatus.online}>
      {/* <StatusIcon $isCompleted={mateStatus.missionCompleted} /> */}
      {mateStatus.online ? (
        <Video
          ref={mateVideoRef}
          autoPlay
          playsInline
          $isCompleted={mateStatus.missionCompleted}
        />
      ) : (
        <EmptyVideo>Zzz...</EmptyVideo>
      )}

      <UserName $isActive={!mateStatus.online}>{mateName}</UserName>
    </Wrapper>
  );
};

export default MateVideo;

const Wrapper = styled.div`
  position: relative;

  width: 100%;
  height: 15vh;
  margin-bottom: 40px;

  display: flex;
  ${({ theme }) => theme.flex.center}
  flex-direction: column;

  box-shadow: ${({ theme }) => theme.boxShadow.basic};
  background-color: ${({ $mateOnLine, theme }) =>
    $mateOnLine ? 'transparent' : theme.colors.lighter.light};
  border-radius: ${({ theme }) => theme.radius.basic};

  border: ${({ $mateOnLine, theme }) =>
    $mateOnLine
      ? `2px solid ${theme.colors.lighter.light}`
      : `2px solid ${theme.colors.text.gray}`};
`;

const Video = styled.video`
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;

  border-radius: ${({ theme }) => theme.radius.basic};
  border: ${({ $isCompleted, theme }) =>
    $isCompleted
      ? `2px solid ${theme.colors.primary.emerald}`
      : `2px solid ${theme.colors.system.red}`};
`;

const StatusIcon = styled.div`
  position: absolute;
  top: 10px;
  right: 15px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${({ $isCompleted, theme }) =>
    $isCompleted ? theme.colors.system.green : theme.colors.system.red};
`;

const UserName = styled.span`
  position: absolute;
  width: 98%;
  bottom: -50px;

  padding: 3px 10px;
  border-radius: ${({ theme }) => theme.radius.light};
  color: ${({ theme }) => theme.colors.system.black};
  background-color: ${({ theme }) => theme.colors.lighter.light};

  text-shadow: ${({ theme }) => theme.boxShadow.text};
  text-align: center;
  font-weight: 800;
  margin-bottom: 8px;
`;

const EmptyVideo = styled.div`
  width: 100%;
  height: 100%;
  ${({ theme }) => theme.flex.center};
  color: ${({ theme }) => theme.colors.text.gray};
  font-size: 20px;
  margin: auto;
`;
