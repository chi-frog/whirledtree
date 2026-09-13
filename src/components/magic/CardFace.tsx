'use client';

import { memo, useEffect, useRef, useState } from 'react';
import FadeInImage from '../general/FadeInImage';
import { cardBackUri } from '@/app/page';

type Props = {
  loc: string;
  src?: string;
  onLoad?: () => void;
  visible?: boolean;
  height?: string;
};

const CardFace = ({
  loc,
  src,
  visible = true,
  height,
  onLoad,
}: Props) => {
  const resolvedSrc = src ?? cardBackUri;

  return (<>
    <FadeInImage
      src={resolvedSrc}
      visible={visible}
    />
  </>);

  /*return (
    <img
      src={resolvedSrc}
      loading={loc === 'view' ? 'lazy' : 'eager'}
      draggable={false}
      alt=""
      style={{
        width: '100%',
        ...(height ? { height } : {}),
        marginTop: 'auto',
        position: 'absolute',
        objectFit: 'cover',
        visibility: visible ? 'visible' : 'hidden',
        opacity: loaded ? 1 : 0,
        transition: loc === 'view' ? 'opacity 0.15s ease-in' : undefined,
        userSelect: 'none',
        WebkitUserSelect: 'none',
      }}
    />
  );*/
};

export default memo(CardFace);