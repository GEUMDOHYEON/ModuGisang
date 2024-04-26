import React from 'react';
import styled, { css } from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faAnglesLeft,
  faHome,
  faUser,
  faUserXmark,
  faUserCheck,
  faTrashCan,
  faSadTear,
  faSpinner,
  faGear,
} from '@fortawesome/free-solid-svg-icons';

const iconList = {
  home: faHome,
  back: faAnglesLeft,
  signin: faUserCheck,
  signout: faUserXmark,
  user: faUser,
  trash: faTrashCan,
  sadFace: faSadTear,
  loading: faSpinner,
  settings: faGear,
};

const Icon = ({ icon, iconStyle, onClickHandler }) => {
  return (
    <IconWrapper
      $iconStyle={iconStyle}
      onClick={e => {
        if (onClickHandler) {
          onClickHandler(e);
        }
      }}
    >
      <FontAwesomeIcon icon={iconList[icon]} />
    </IconWrapper>
  );
};

export default Icon;

const IconWrapper = styled.div`
  width: auto;
  padding: 5px;

  color: ${({ theme }) => theme.colors.text.gray};
  opacity: 1;

  font-size: ${({ $iconStyle }) =>
    $iconStyle.size ? `${$iconStyle.size}px` : '16px'};

  cursor: ${({ $iconStyle }) => ($iconStyle.disable ? 'default' : 'pointer')};

  &:hover {
    color: ${({ theme, $iconStyle }) =>
      $iconStyle.color
        ? theme.colors.primary[$iconStyle.color]
        : theme.colors.secondary.main};
  }

  ${({ $iconStyle }) =>
    $iconStyle.disable &&
    css`
      pointer-events: none;
    `}
`;
