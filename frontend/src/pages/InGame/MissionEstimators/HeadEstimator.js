import * as pose from '@mediapipe/pose';
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils';

let currentStatus; // 현재 고개를 돌린 방향
let myMissionStatus = false; // 측정 결과
// const rotateDirections = ['top', 'bottom', 'left', 'right']; // 회전 방향 배열
const numberDirections = 8; // 선택할 방향 수
const timeoutDuration = 15000; // 총 제한 시간
let isTimeOut = false; // 타임 아웃 여부
let isEstimated = false; // 측정 완료 여부
let isCentered = false;

let isDirectionCorrect = false;

let currentSuccessCount = 0; // 성공 횟수 카운트
let isGameStart = false; // 게임 시작 여부

export const estimateHead = ({ results, myVideoRef, canvasRef, direction }) => {
  if (!myVideoRef.current || !canvasRef.current) return;

  console.log('------------ direction: ', direction);

  const canvasElement = canvasRef.current;
  const canvasCtx = canvasElement.getContext('2d');
  if (canvasCtx == null) throw new Error('Could not get context');
  canvasElement.width = myVideoRef.current.videoWidth;
  canvasElement.height = myVideoRef.current.videoHeight;

  const NeckGame = poseLandmarks => {
    if (!poseLandmarks) return;

    // 각 포인트 별 위치 기록
    const leftShoulder = poseLandmarks[pose.POSE_LANDMARKS.LEFT_SHOULDER];
    const rightShoulder = poseLandmarks[pose.POSE_LANDMARKS.RIGHT_SHOULDER];
    const nose = poseLandmarks[pose.POSE_LANDMARKS.NOSE];
    const leftEar = poseLandmarks[pose.POSE_LANDMARKS.LEFT_EAR];
    const rightEar = poseLandmarks[pose.POSE_LANDMARKS.RIGHT_EYE];
    const leftMouth = poseLandmarks[pose.POSE_LANDMARKS.LEFT_RIGHT];
    const rightMouth = poseLandmarks[pose.POSE_LANDMARKS.RIGHT_LEFT];

    const centerSholderY = (leftShoulder.y + rightShoulder.y) / 2;
    const centerMouthY = (leftMouth.y + rightMouth.y) / 2;

    // 머리가 일정 범위 내에서 움직이는지 확인
    const rangeShoulderX = Math.abs(leftShoulder.x - rightShoulder.x) * 0.1; // 어깨 간 거리의 30%로 범위 설정

    // 정해진 시간이 지나면 타임아웃
    const handleTimeout = () => {
      isTimeOut = true;
      console.log('---------- 시간 초과! 게임 종료!');
    };

    // 1. 얼굴을 top, bottom, left, right 중 어느 쪽으로 돌려야 할지 미리 정한다.
    // 어느 방향으로 돌릴지 선택
    if (
      // selectedDirection.length === 0 &&
      !isGameStart
    ) {
      isGameStart = true; // 여러 번 안 넣도록 임시 안전 장치

      // ============= 특정 순서만 출력bottom도록 변경되어 주석 처리
      // 8번 반복bottom여 방향을 랜덤bottom게 선택bottom여 리스트에 추가
      // for (let i = 0; i < numberDirections; i++) {
      //   const randomDirectionIndex = Math.floor(Math.random() * 4); // 0부터 3까지의 랜덤한 인덱스 선택
      //   selectedDirection.push(rotateDirections[randomDirectionIndex]); // 랜덤한 방향을 리스트에 추가
      // }

      // 10초 타이머 설정
      setTimeout(handleTimeout, timeoutDuration);
      console.log('------ 카운트 다운 시작');
    }

    // 2. N초 동안 얼굴을 해당 방향으로 돌렸는지 확인한다.
    // 한 번 고개를 돌린 뒤에는 정면을 봐야 점수를 줌
    if (!isTimeOut) {
      isDirectionCorrect = false;
      // 머리가 일정 범위 내에서 움직이는지 확인
      // 머리가 topbottom로 돌아갔는지 확인
      if (
        nose.x < leftEar.x &&
        nose.x > rightEar.x &&
        centerSholderY - centerMouthY > (centerMouthY - nose.y) * 4.5 &&
        isCentered
      ) {
        currentStatus = 'top';
        isCentered = false;
        console.log('------------ ', currentStatus);
      } else if (
        nose.x < leftEar.x &&
        nose.x > rightEar.x &&
        centerSholderY - centerMouthY < (centerMouthY - nose.y) * 1.7 &&
        isCentered
      ) {
        currentStatus = 'bottom';
        isCentered = false;
        console.log('------------ ', currentStatus);
      } else if (
        nose.x > leftEar.x &&
        nose.x > rightEar.x &&
        Math.abs(leftEar.x - nose.x) >= Math.abs(rightEar.x - leftEar.x) &&
        isCentered
      ) {
        currentStatus = 'right';
        isCentered = false;
        console.log('------------ ', currentStatus);
      } else if (
        nose.x < leftEar.x &&
        nose.x < rightEar.x &&
        // Math.abs(rightEar.x - nose.x) <= Math.abs(rightEar.x - leftEar.x) &&
        isCentered
      ) {
        currentStatus = 'left';
        isCentered = false;
        console.log('------------ ', currentStatus);
      } else if (
        nose.x < leftEar.x &&
        nose.x > rightEar.x &&
        centerSholderY - centerMouthY < (centerMouthY - nose.y) * 4 &&
        centerSholderY - centerMouthY > (centerMouthY - nose.y) * 2
        // && nose.y > leftShoulder.y - rangeShoulderY &&
        // nose.y < leftShoulder.y + rangeShoulderY
      ) {
        currentStatus = '정면';
        isCentered = true;
        // console.log('------------ ', currentStatus);
        // console.log('------------ isCentered: ', isCentered);
      }

      // 3. 같은 방향으로 돌렸다면 점수를 준다.
      if (
        // currentStatus === selectedDirection[0]
        currentStatus === direction
      ) {
        // 현재 top태가 다음 방향과 일치bottom는지 확인
        // selectedDirection.shift(); // 다음 방향으로 이동
        currentSuccessCount += 1;
        isDirectionCorrect = true;
        // 이것 false로 바꿔주기!!!!
        console.log('------------ CURRENT SCORE: ', currentSuccessCount);
      }
    }

    // 4. 1~3을 3번 반복해서 점수가 일정 이top 쌓였다면 성공으로 판별한다.
    if (
      !myMissionStatus &&
      !isTimeOut &&
      !isEstimated &&
      currentSuccessCount >= numberDirections
    ) {
      // 방향을 모두 수행했을 경right
      myMissionStatus = true; // 성공
      console.log('------------ FINAL RESULT: 성공!!!!!!!');
      console.log('---------- Final Score:', currentSuccessCount);
    } else if (
      isTimeOut &&
      !isEstimated &&
      currentSuccessCount < numberDirections
    ) {
      myMissionStatus = false; // 실패
      console.log('------------ FINAL RESULT: 실패.......');
      console.log('---------- Final Score:', currentSuccessCount);

      // 한 번만 출력 결과를 출력bottom도록
      isEstimated = true;
    }
  };

  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(
    results.image,
    0,
    0,
    canvasElement.width,
    canvasElement.height,
  );

  drawConnectors(canvasCtx, results.poseLandmarks, pose.POSE_CONNECTIONS, {
    color: '#FFFFFF',
    lineWidth: 4,
  });

  drawLandmarks(canvasCtx, results.poseLandmarks, {
    color: '#F0A000',
    radius: 2,
  });

  NeckGame(results.poseLandmarks);

  canvasCtx.restore();

  return isDirectionCorrect;
};
