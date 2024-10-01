import React from 'react';
import thinking from './assets/thinking.svg';
import stats from './assets/stats.svg';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Container,
  Paper,
  Box,
  Grid
} from '@mui/material';

const HowItWorks = () => {
  const cards = [
    {
      id: 1,
      title: 'Одна CLI команда',
      description: 'Настройте свой проект с помощью простого конфигурационного файла и запустите одной CLI командой',
      image: thinking, 
    },
    {
      id: 2,
      title: 'Автоматическая сборка',
      description: 'Весь ваш код упаковывается и отправляется на наши GPU сервера',
      image: thinking,
    },
    {
      id: 3,
      title: 'Логи в реальном времени',
      description: 'Следите за ходом выполнения задачи в реальном времени через панель управления или CLI.',
      image: stats,
    },
    {
      id: 4,
      title: 'Результат работы',
      description: 'После завершения работы легко скачивайте все результаты и данные.',
      image: thinking,
    },
  ];

  const cardStyle = {
    backgroundColor: 'transparent', 
    color: 'white',
    height: '270px',
    width: '100%',
    maxWidth: '400px',
    border: '2px solid white',
    boxShadow: 'none',
  };

  const numberStyle = {
    fontSize: '5rem',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const sectionStyle = {
    width: '80%',
    margin: '0 auto', // Ensure no default margin issues
    padding: '20px',
    color: 'white',
    textAlign: 'center',
  };

  return (
    <section style={sectionStyle}>
      <Typography variant="h4" align="center" gutterBottom>
        Ваш ML Workflow
      </Typography>
      <Container>
        {cards.map((card, index) => (
          <Grid container alignItems="center" justifyContent="space-between" key={card.id} sx={{ mb: 3 }}>
            {index % 2 === 0 && (
              <Grid item sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Box sx={numberStyle}>{card.id}</Box>
              </Grid>
            )}
            <Grid item xs={12} sm={8} md={6}>
              <Box display="flex" justifyContent="space-between">
                <Card component={Paper} sx={cardStyle}>
                  <CardMedia
                    component="img"
                    height="140"
                    marginLeft="110"
                    image={card.image}
                    alt={card.title}
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="div">
                      {card.title}
                    </Typography>
                    <Typography variant="body2">
                      {card.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Grid>
            {index % 2 !== 0 && (
              <Grid item sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Box sx={numberStyle}>{card.id}</Box>
              </Grid>
            )}
          </Grid>
        ))}
      </Container>
    </section>
  );
};

export default HowItWorks;