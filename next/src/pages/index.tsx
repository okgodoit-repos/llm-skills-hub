import { Box, Container, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';

import supabase from '~/supabase';

export default function Home() {
  const query = useQuery({
    queryKey: ['plugins'],
    queryFn: async () => {
      const { data } = await supabase.from('plugins').select().throwOnError();
      return data;
    },
  });

  return (
    <Container>
      <Typography variant="h1">Skills Repo</Typography>
      {query.data?.map((plugin, idx) => (
        <Box key={idx}>{JSON.stringify(plugin)}</Box>
      ))}
    </Container>
  );
}
