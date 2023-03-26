import { ChatBubbleOutline, DeleteOutline } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
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
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { BaseUrl } from '~/config';
import { queryClient } from '~/query-client';

type Plugin = {
  api_id?: string;
  human_name: string;
  model_name: string;
  human_description: string;
  model_description: string;
  spec_url: string;
  logo_url: string;
};

function AddPluginModal({ open, onClose }: { open: boolean; onClose(): void }) {
  const { control, handleSubmit } = useForm<Plugin>();

  const mutation = useMutation({
    mutationFn: async (data: Plugin) => {
      await fetch(`${BaseUrl}/apis`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      console.log('Sending data: ', data);
      return;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plugins'] });
    },
  });

  const onSubmit = async (data: any) => {
    await mutation.mutateAsync(data);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add Plugin</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Controller
            name="human_name"
            control={control}
            render={({ field }) => (
              <TextField {...field} margin="dense" label="Name for human" required fullWidth />
            )}
          />
          <Controller
            name="model_name"
            control={control}
            render={({ field }) => (
              <TextField {...field} margin="dense" label="Name for model" required fullWidth />
            )}
          />
          <Controller
            name="human_description"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                margin="dense"
                label="Description for human"
                required
                fullWidth
              />
            )}
          />
          <Controller
            name="model_description"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                margin="dense"
                label="Description for model"
                required
                fullWidth
              />
            )}
          />
          <Controller
            name="spec_url"
            control={control}
            render={({ field }) => (
              <TextField {...field} margin="dense" label="URL of spec" required fullWidth />
            )}
          />
          <Controller
            name="logo_url"
            control={control}
            render={({ field }) => (
              <TextField {...field} margin="dense" label="URL of logo" required fullWidth />
            )}
          />

          <LoadingButton
            size="large"
            type="submit"
            sx={{ mt: 2 }}
            variant="contained"
            loading={mutation.isLoading}
          >
            Submit
          </LoadingButton>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PluginCard({ plugin }: { plugin: Plugin }) {
  const mutation = useMutation({
    mutationFn: async () => {
      await fetch(`${BaseUrl}/apis/${plugin.api_id}`, {
        method: 'DELETE',
      });
      console.log(`Deleting plugin ${plugin.human_name}`);
      return;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plugins'] });
    },
  });

  return (
    <Card sx={{ width: 350, boxShadow: 0.5, backgroundColor: '#FAFAFF' }}>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1, position: 'relative' }}>
        <IconButton
          size="small"
          color="error"
          sx={{ position: 'absolute', right: 2, top: 2 }}
          onClick={() => mutation.mutate()}
          disabled={mutation.isSuccess}
        >
          <DeleteOutline />
        </IconButton>

        <Box
          component="img"
          alt="logo"
          src={plugin.logo_url}
          sx={{ width: 100, height: 100, borderRadius: 2 }}
        />
        <Typography variant="h5">{plugin.human_name}</Typography>
        <Typography variant="body1">{plugin.human_description}</Typography>
      </CardContent>
    </Card>
  );
}

export default function Home() {
  const [open, setOpen] = useState(false);

  const query = useQuery({
    queryKey: ['plugins'],
    queryFn: async () => {
      const res = await fetch(`${BaseUrl}/apis`);
      const json = (await res.json()) as Plugin[];
      console.log('Received data: ', json);
      return json;
    },
  });

  const onClose = () => {
    setOpen(false);
  };

  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h3">Plugins</Typography>
        <Link href="/chat" style={{ textDecoration: 'none' }}>
          <Button variant="outlined">
            <ChatBubbleOutline sx={{ mr: 1 }} />
            Chat
          </Button>
        </Link>
      </Box>

      <Divider sx={{ py: 2 }} />
      <Box sx={{ py: 2, display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 2 }}>
        {query.data?.map((plugin, idx) => (
          <PluginCard key={idx} plugin={plugin} />
        ))}
      </Box>

      <AddPluginModal open={open} onClose={onClose} />
      <Fab
        color="primary"
        sx={{ position: 'absolute', bottom: 12, right: 12 }}
        variant="extended"
        onClick={() => setOpen(true)}
      >
        + Add Plugin
      </Fab>
    </Container>
  );
}
