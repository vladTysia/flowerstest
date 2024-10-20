import React, {useEffect, useState} from "react";
import {Box, Button, Card, CardMedia, CardContent, Snackbar, Typography} from "@mui/material";
import { useTimer } from 'use-timer';
import dayjs from "dayjs";
import flowersData from './flowersData';
import './App.css';

const gameModes = {
  menu: 'menu',
  challenge: 'challenge',
  test: 'test'
};

function App() {
  const [gameState, setGameState] = useState(gameModes.menu);
  const { time, start: startTimer, pause, reset: resetTimer } = useTimer({
    initialTime: 1200000,
    step: 1000,
    timerType: 'DECREMENTAL',
  });
  const [challenge, setChallenge] = useState({});
  const [open, setOpen] = useState(false);
  const [isTestFinished, setIsTestFinished] = useState(false);
  const [score, setScore] = useState(0);
  const [showedFlowersCount, setShowedFlowersCount] = useState(0);

  const handleStartChallenge = () => {
    setGameState(gameModes.challenge);
    generateChallenge();
  }
  const handleStartTest = () => {
    startTimer();
    generateChallenge();
    setGameState(gameModes.test);
  }

  const handleFinishTest = () => {
    pause();
    resetTimer();
    setIsTestFinished(true);
  }
  const handleCloseTest = () => {
    setScore(0);
    pause();
    resetTimer();
    setShowedFlowersCount(0);
    setChallenge({});
    setGameState(gameModes.menu);
    setIsTestFinished(false);
  }

  const getRandomFlowers = (correctAnswer) => {
    const randomFlowers = [];
    const usedIndices = new Set();
    const randomCorrectIndex = Math.floor(Math.random() * 4);

    while (randomFlowers.length < 4 && randomFlowers.length < flowersData.length) {
      const randomIndex = Math.floor(Math.random() * flowersData.length);
      if (!usedIndices.has(randomIndex)) {
        const flower = flowersData[randomIndex];
        randomFlowers.push(`${flower.polishName} (${flower.latName})`);
        usedIndices.add(randomIndex);
      }
    }
    if (!randomFlowers.includes(correctAnswer)) {
      randomFlowers[randomCorrectIndex] = correctAnswer;
    }

    return randomFlowers;
  }

  const handleSelectAnswer = (answer) => {
    if (challenge.correctAnswer === answer) {
      setOpen(true);
      setScore(score + 1);
    }
    setShowedFlowersCount(showedFlowersCount + 1);
    generateChallenge();
  }

  const generateChallenge = () => {
    const randomNumber = Math.floor(Math.random() * flowersData.length);
    const flower = flowersData[randomNumber];
    const correctAnswer = `${flower.polishName} (${flower.latName})`;
    const answerFlowers = getRandomFlowers(correctAnswer);

    const challengeObj = {
      image: flower.image,
      answers: answerFlowers,
      correctAnswer
    };
    setChallenge(challengeObj);
  }

  useEffect(() => {
    generateChallenge();
  }, []);

  if (gameState === gameModes.menu) {
    return (
      <Box sx={{
        display: 'flex', flexDirection: 'column',
        width: 200, justifyContent: 'space-between',
        height: 100, margin: '0px auto', marginTop: '30%'
      }}>
        <Button variant="contained" onClick={handleStartChallenge}>Start challenge</Button>
        <Button variant="outlined" onClick={handleStartTest}>Start test (20min)</Button>
      </Box>
    );
  }

  if (!time) {
    handleFinishTest();
  }
    return (
      <Box sx={{
        width: 350, margin: '0px auto',
        paddingTop: 10,
      }}>
        <Button variant="outlined" onClick={handleCloseTest}>Stop {gameState}</Button>
        {
          gameState === gameModes.test && (
            <Typography variant="subtitle1" sx={{marginTop: 1}}>
              Time: {dayjs(time).format("mm:ss")}
            </Typography>
          )
        }
        <Typography variant="h5" sx={{marginTop: 2}}>
          Your scores: {score} / {showedFlowersCount}
        </Typography>
        {
          !isTestFinished && (
            <Card sx={{ width: 350, marginTop: 4 }}>
              <CardMedia
                component="img"
                alt="flower image"
                height="200"
                image={challenge.image}
              />
              <CardContent sx={{display: 'fex'}}>
                {
                  challenge.answers.map((answer, index) => (
                    <Button
                      size="medium"
                      key={answer}
                      variant="outlined"
                      onClick={() => handleSelectAnswer(answer)}
                      sx={{marginTop: 2, marginLeft: 1}}
                    >
                      {answer}
                    </Button>
                  ))
                }
              </CardContent>
            </Card>
          )
        }
        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          open={open}
          autoHideDuration={1100}
          onClose={() => setOpen(false)}
          message="Correct"
        />
      </Box>
    )
}

export default App;
