import React from 'react';
import { Render } from '@measured/puck';
import { supabase } from '../../lib/supabase';
import { puckConfig } from './puckConfig';
import { normalizePuckData } from './puckData';

export const PuckRenderer: React.FC = () => {
  const [data, setData] = React.useState<ReturnType<typeof normalizePuckData> | null>(null);
  const [resolved, setResolved] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;

    const loadConfig = async () => {
      const { data: row, error } = await supabase
        .from('site_visual_config')
        .select('config')
        .eq('id', 'homepage')
        .maybeSingle();

      if (!isMounted) {
        return;
      }

      if (error || !row?.config) {
        setData(null);
        setResolved(true);
        return;
      }

      const nextData = normalizePuckData(row.config);
      setData(nextData.content.length > 0 ? nextData : null);
      setResolved(true);
    };

    loadConfig().catch(() => {
      if (isMounted) {
        setData(null);
        setResolved(true);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!resolved || !data) {
    return null;
  }

  return <Render config={puckConfig} data={data} />;
};

export default PuckRenderer;

