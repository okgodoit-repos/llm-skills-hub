import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Fab,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import supabase from '~/supabase';

type Form = {
  name_human: string;
  name_model: string;
  description_human: string;
  description_model: string;
  spec_url: string;
  logo_url: string;
};

function AddPluginModal({ open, onClose }: { open: boolean; onClose(): void }) {
  const { control, handleSubmit } = useForm<Form>();

  const mutation = useMutation({
    mutationFn: (data: Form): any => {
      console.log(data);
      return;
    },
  });

  const onSubmit = (data: any) => mutation.mutate(data);

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add Plugin</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="name_human"
            control={control}
            render={({ field }) => (
              <TextField {...field} margin="dense" label="Name for human" fullWidth />
            )}
          />
          <Controller
            name="name_model"
            control={control}
            render={({ field }) => (
              <TextField {...field} margin="dense" label="Name for model" fullWidth />
            )}
          />
          <Controller
            name="description_human"
            control={control}
            render={({ field }) => (
              <TextField {...field} margin="dense" label="Description for human" fullWidth />
            )}
          />
          <Controller
            name="description_model"
            control={control}
            render={({ field }) => (
              <TextField {...field} margin="dense" label="Description for model" fullWidth />
            )}
          />
          <Controller
            name="spec_url"
            control={control}
            render={({ field }) => (
              <TextField {...field} margin="dense" label="URL of spec" fullWidth />
            )}
          />
          <Controller
            name="logo_url"
            control={control}
            render={({ field }) => (
              <TextField {...field} margin="dense" label="URL of logo" fullWidth />
            )}
          />

          <Button size="large" type="submit" sx={{ mt: 2 }} variant="contained">
            Submit
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PluginCard({ plugin }: { plugin: any }) {
  return (
    <Card sx={{ width: 350, boxShadow: 0.5, backgroundColor: '#FAFAFF' }}>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box
          component="img"
          alt="logo"
          src={plugin.logo_url}
          sx={{ width: 100, height: 100, borderRadius: 2 }}
        />
        <Typography variant="h5">{plugin.name}</Typography>
        <Typography variant="body1">{plugin.description}</Typography>
      </CardContent>
    </Card>
  );
}

export default function Home() {
  const [open, setOpen] = useState(false);

  const query = useQuery({
    queryKey: ['plugins'],
    queryFn: async () => {
      const { data } = await supabase.from('plugins').select().throwOnError();
      return data;
    },
  });

  const onClose = () => {
    setOpen(false);
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h3">Plugins</Typography>
      <Divider sx={{ py: 2 }} />
      <Box sx={{ py: 2 }}>
        {query.data?.map((plugin, idx) => (
          <PluginCard key={idx} plugin={plugin} />
        ))}
      </Box>

      <AddPluginModal open={open} onClose={onClose} />
      <Fab
        sx={{ position: 'absolute', bottom: 12, right: 12 }}
        variant="extended"
        onClick={() => setOpen(true)}
      >
        + Add Plugin
      </Fab>
    </Container>
  );
}
