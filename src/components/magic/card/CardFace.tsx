'use client';

import { memo, } from 'react';
import { cardBackUri } from '@/app/page';
import FadeInImage from '@/components/general/FadeInImage';

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