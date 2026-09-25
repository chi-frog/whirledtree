'use client';

import { memo, useEffect, useRef, useState } from 'react';
import FadeInImage from '../general/FadeInImage';
import { cardBackUri } from '@/app/page';

type Props = {
  loc: string;
  src?: string;
  visible?: boolean;
};

const CardFace = ({
  loc,
  src,
  visible = true,
}: Props) => {
  const resolvedSrc = (src && src !== '') ? src : cardBackUri;

  return (<>
    <FadeInImage
      src={resolvedSrc}
      visible={visible}
      loading={(loc === 'view') ? 'lazy' : 'eager'}
    />
  </>);
};

export default memo(CardFace);