import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavBar, SimpleBtn } from '../../components';
import { AccountContext, UserContext } from '../../contexts';
import { userServices, challengeServices } from '../../apis';
import useFetch from '../../hooks/useFetch';

import * as S from '../../styles/common';

const MyStreak = () => {
  const navigate = useNavigate();
  const { fetchData } = useFetch();
  const [isUserInfoLoading, setIsUserInfoLoading] = useState(true);
  const { accessToken, userId } = useContext(AccountContext);
  const { userInfo, setUserInfo } = useContext(UserContext);
  const { userName, streakDays, medals, affirmation } = userInfo;

  const getCallendar = async ({ accessToken, userId, month }) => {
    const response = await fetchData(() =>
      challengeServices.getCallendarInfo({ accessToken, userId, month }),
    );
    console.log(response);
  };

  const handleClickOnDate = async ({ accessToken, userId, date }) => {
    const response = await fetchData(() =>
      challengeServices.getCallendarInfoByDate({ accessToken, userId, date }),
    );
    console.log(response);
  };

  useEffect(() => {
    getCallendar({ accessToken, userId, month: 4 });
  }, []);

  return (
    <>
      <NavBar />
      <S.PageWrapper>
        <div>유저아이디: {userId}</div>
        <div>유저이름: {userName}</div>
        <div>연속일수: {streakDays}</div>
        <div>금메달: {medals.gold}</div>
        <div>은메달: {medals.silver}</div>
        <div>동메달: {medals.bronze}</div>
        <div>오늘의한마디: {affirmation}</div>
        <SimpleBtn
          onClickHandler={() => {
            handleClickOnDate({ accessToken, userId, date: '2024-05-09' });
          }}
          btnName="5월 9일 확인하기"
        />
      </S.PageWrapper>
    </>
  );
};

export default MyStreak;
