import React from 'react';
import { Puck as Editor } from '@measured/puck';
import '@measured/puck/puck.css';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { ensureHomepagePuckData } from '../puck/homepageVisualConfig';
import { puckConfig } from '../puck/puckConfig';

const PuckEditor: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = React.useState(ensureHomepagePuckData(null));
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    let isMounted = true;

    const loadEditor = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      if (!session) {
        navigate('/admin', { replace: true });
        return;
      }

      const { data: row } = await supabase
        .from('site_visual_config')
        .select('config')
        .eq('id', 'homepage')
        .maybeSingle();

      if (!isMounted) {
        return;
      }

      setData(ensureHomepagePuckData(row?.config));
      setIsReady(true);
    };

    loadEditor().catch(() => {
      if (isMounted) {
        setData(ensureHomepagePuckData(null));
        setIsReady(true);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate('/admin', { replace: true });
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handlePublish = async (nextData: typeof data) => {
    const normalized = ensureHomepagePuckData(nextData);
    setData(normalized);

    const { error } = await supabase
      .from('site_visual_config')
      .upsert(
        {
          id: 'homepage',
          config: normalized,
        },
        {
          onConflict: 'id',
        }
      );

    if (error) {
      console.error(error);
    }
  };

  if (!isReady) {
    return null;
  }

  return (
    <Editor
      config={puckConfig}
      data={data}
      onChange={(nextData) => setData(ensureHomepagePuckData(nextData))}
      onPublish={handlePublish}
    />
  );
};

export default PuckEditor;
