import { ArrowBackIos, Send } from '@mui/icons-material';
import { Box, Container, Divider, IconButton, TextField, Typography } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';

function Message({ text }: { text: string }) {
  return (
    <Box sx={{ p: 1, m: 1, background: '#F0F0F0', borderRadius: 2, width: 'fit-content' }}>
      {text}
    </Box>
  );
}

export default function Home() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');

  const chat = useMutation({
    mutationFn: async (data: string[]): Promise<void> => {
      const newMessages = await fetch('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ messages: data }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const json = await newMessages.json();
      setMessages(json.messages);
    },
  });

  const sendMessage = () => {
    chat.mutate([...messages, input]);
    setInput('');
  };

  return (
    <Container sx={{ py: 4, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Link href={'/'}>
          <IconButton>
            <ArrowBackIos />
          </IconButton>
        </Link>
        <Typography variant="h4">Chat</Typography>
      </Box>
      <Divider sx={{ py: 2 }} />
      <Box sx={{ flexGrow: 1, p: 1 }}>
        {messages.map((message, idx) => (
          <Message key={idx} text={message} />
        ))}
      </Box>
      <Box
        sx={{
          flexShrink: 0,
          height: 60,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <TextField
          variant="outlined"
          size="small"
          sx={{ flexGrow: 1 }}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.keyCode == 13) {
              sendMessage();
            }
          }}
        />
        <IconButton onClick={sendMessage}>
          <Send />
        </IconButton>
      </Box>
    </Container>
  );
}
