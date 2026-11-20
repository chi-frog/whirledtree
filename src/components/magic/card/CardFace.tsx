'use client';

import { Dispatch, memo, SetStateAction, } from 'react';
import { cardBackUri } from '@/app/page';
import FadeInImage from '@/components/general/FadeInImage';

type Props = {
  loc: string;
  src?: string;
  visible?: boolean;
  setLoaded?:Dispatch<SetStateAction<boolean>>
};

const CardFace = ({
  loc,
  src,
  visible = true,
  setLoaded,
}: Props) => {
  const resolvedSrc = (src && src !== '') ? src : cardBackUri;

  return (
    <FadeInImage
      src={resolvedSrc}
      visible={visible}
      loading={(loc === 'view') ? 'lazy' : 'eager'}
      setLoaded={setLoaded}
    />);
};

export default memo(CardFace);