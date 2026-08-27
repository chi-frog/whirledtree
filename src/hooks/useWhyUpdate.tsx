import { useEffect, useRef } from 'react';

function useWhyUpdate(name: string, props: Record<string, unknown>) {
  const previousProps = useRef<Record<string, unknown>|undefined>(undefined);

  useEffect(() => {
    if (previousProps.current) {
      const allKeys = Object.keys({ ...previousProps.current, ...props });
      const changes: Record<string, { from: unknown; to: unknown }> = {};

      allKeys.forEach((key) => {
        if (previousProps.current![key] !== props[key]) {
          changes[key] = {
            from: previousProps.current![key],
            to: props[key],
          };
        }
      });

      if (Object.keys(changes).length) {
        console.log('[why-did-you-update]', name, changes);
      }
    }

    previousProps.current = props;
  });
};

export default useWhyUpdate;