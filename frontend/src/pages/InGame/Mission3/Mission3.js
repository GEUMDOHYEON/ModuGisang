import React, { useRef, useEffect, useContext, useState } from 'react';
import { GameContext, OpenViduContext } from '../../../contexts';
import { Pose } from '@mediapipe/pose';
import { estimateHead } from '../MissionEstimators/HeadEstimator';
import bottomArrow from '../../../assets/arrows/bottom.png';
import topArrow from '../../../assets/arrows/top.png';
import leftArrow from '../../../assets/arrows/left.png';
import rightArrow from '../../../assets/arrows/right.png';

import styled from 'styled-components';

const arrowImages = {
  top: topArrow,
  bottom: bottomArrow,
  left: leftArrow,
  right: rightArrow,
};

const round1 = [
  { direction: 'top', active: false },
  { direction: 'bottom', active: false },
  { direction: 'left', active: false },
  { direction: 'right', active: false },
];

const round2 = [
  { direction: 'bottom', active: false },
  { direction: 'right', active: false },
  { direction: 'left', active: false },
  { direction: 'right', active: false },
];

const Mission3 = () => {
  const {
    inGameMode,
    myMissionStatus,
    setMyMissionStatus,
    isGameLoading,
    setIsGameLoading,
  } = useContext(GameContext);
  const { myVideoRef } = useContext(OpenViduContext);
  const canvasRef = useRef(null);
  const msPoseRef = useRef(null);

  // 화살표 세팅
  const [arrowRound, setArrowRound] = useState([round1, round2]);
  const [currentRoundIdx, setCurrentRoundIdx] = useState(0);
  const [currentArrowIdx, setCurrentArrowIdx] = useState(0);

  useEffect(() => {
    if (inGameMode !== 3 || !myVideoRef.current) return;

    const videoElement = myVideoRef.current;

    msPoseRef.current = new Pose({
      locateFile: file =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });

    msPoseRef.current.setOptions({
      modelComplexity: 1,
      selfieMode: true,
      smoothLandmarks: true,
      enableSegmentation: true,
      smoothSegmentation: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    msPoseRef.current.onResults(results => {
      let direction = arrowRound[currentRoundIdx][currentArrowIdx].direction;
      const result = estimateHead({
        results,
        myVideoRef,
        canvasRef,
        direction,
      });
      handleDirection(result);
      setMyMissionStatus(result);
      if (isGameLoading) setIsGameLoading(false);
    });

    const handleDirection = result => {
      // 해당 동작이 성공했다고 가정
      if (result) {
        let roundIdx = currentRoundIdx;
        let arrowIdx = currentArrowIdx;
        arrowRound[roundIdx][arrowIdx].active = true;

        if (currentRoundIdx === 1 && currentArrowIdx === 3) {
          //게임 끝
          console.log('게임 끝');
        } else if (currentRoundIdx === 0 && currentArrowIdx === 3) {
          setCurrentRoundIdx(roundIdx++);
          setCurrentArrowIdx(0);
        } else {
          setCurrentArrowIdx(arrowIdx++);
        }
      }
    };

    const handleCanPlay = () => {
      let frameCount = 0;
      const frameSkip = 150;

      if (frameCount % (frameSkip + 1) === 0) {
        if (msPoseRef.current !== null) {
          msPoseRef.current.send({ image: videoElement }).then(() => {
            requestAnimationFrame(handleCanPlay);
          });
        }
      }

      frameCount++;
    };

    if (videoElement.readyState >= 3) {
      handleCanPlay();
    } else {
      videoElement.addEventListener('canplay', handleCanPlay);
    }

    return () => {
      videoElement.removeEventListener('canplay', handleCanPlay);
      msPoseRef.current = null;
    };
  }, []);

  return (
    <>
      <Canvas ref={canvasRef} />
      <ArrowBox>
        {arrowRound[currentRoundIdx].map(({ direction, active }) => (
          <Arrows src={arrowImages[direction]} alt={active} />
        ))}

        {/* <Arrows src={leftArrow} alt="bottomArrow" />
        <Arrows src={bottomArrow} alt="bottomArrow" />
        <Arrows src={topArrow} alt="bottomArrow" />
        <Arrows src={bottomArrow} alt="bottomArrow" /> */}
      </ArrowBox>
    </>
  );
};

export default Mission3;

const Canvas = styled.canvas`
  position: fixed;
  top: 0;
  left: 0;

  width: 100vw;
  height: 100vh;
  object-fit: cover;
`;

const ArrowBox = styled.div`
  position: fixed;
  top: 150px;
  width: 100%;
  height: 100px;
  ${({ theme }) => theme.flex.between}
  background-color: ${({ theme }) => theme.colors.lighter.dark};
`;
// 위치 배열 조절하고 판정하는 코드로부터 값 받아오면 색상 변경
const Arrows = styled.img`
  width: 80px;
  height: 50px;
`;
