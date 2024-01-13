import React, { useState, useEffect } from 'react';
import './App.css'; // Файл со стилями
import axios from 'axios'; 

function App() {
  const [balls, setBalls] = useState([]);
  const [selectedBall, setSelectedBall] = useState(null);
  const [score, setScore] = useState(0);
  const [removedBallsCount, setRemovedBallsCount] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [occupiedCount, setOccupiedCount]=useState(3);
  const [newGamer, setNewGamer]=useState('User');
  const [clicked, setClicked]=useState(0);
  const [result, setResult]= useState({
    name:'',
    score: 0
  });
  const colors = [
    'blue', 'green', 'yellow', 'orange', 'purple', 'cyan', 'pink', 'brown'
  ];


  const setGamer = (e) => 
  {
    const n= e.target.value;
    setNewGamer(n)
  }

  const getInf = async () => {
    try {
      const response = await axios.get('http://localhost:5454/get');
  
      // Если запрос выполнен успешно, обновляем состояние record
      if (response.status === 200) {
        setResult({
          name: response.data.name,
          score: response.data.score
        });
      }
    } catch (err) {
      console.log(err);
      setResult({
        name: "User",
        score: 0
      })
    }
  };

  useEffect(() => {
    getInf();
    const randomBalls = [];
    while (randomBalls.length < 3) {
      const row = Math.floor(Math.random() * 9);
      const col = Math.floor(Math.random() * 9);
      const colorIndex = Math.floor(Math.random() * colors.length); // Выбираем случайный индекс из массива цветов
      const color = colors[colorIndex]; // Получаем цвет по случайному индексу
      randomBalls.push({ row, col, color });
    }
    setBalls(randomBalls);
  }, []);

  const handleCellClick = (row, col) => {
    if (gameOver) return;
  
    const clickedBall = balls.find(ball => ball.row === row && ball.col === col);
  
    if (!selectedBall && clickedBall) {
      setSelectedBall(clickedBall);
    } else if (selectedBall && !clickedBall) {
      const hasPath = isPathExist(selectedBall, { row, col });
      if (hasPath) {
        const updatedBalls = balls.map(ball =>
          (ball.row === selectedBall.row && ball.col === selectedBall.col) ? { ...ball, row, col } : ball
        );
        setBalls(updatedBalls);
        setSelectedBall(null);
  
        addNewBalls(updatedBalls);
      } else {
        setSelectedBall(null);
      }
    } else {
      setSelectedBall(null);
    }
  };
  
  const renderCells = () => {
    const cells = [];
  
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        const ball = balls.find(ball => ball.row === i && ball.col === j);
        const ballStyle = ball ? { backgroundColor: ball.color } : {};
        const isSelected = selectedBall && selectedBall.row === i && selectedBall.col === j;
        const selectedClass = isSelected ? 'selected-cell' : '';
  
        cells.push(
          <div
            key={`${i}-${j}`}
            className={`cell ${gameOver ? 'cell-disabled' : ''} ${selectedClass}`}
            onClick={() => handleCellClick(i, j)}
          >
            {ball && <div className="ball" style={ballStyle}></div>}
          </div>
        );
      }
    }
  
    return cells;
  };
  
  
  const addNewBalls = (updatedBalls) => {
    const emptyCells = [];
    const allCoordinates = new Set();
  
    // Создаем список пустых клеток и запоминаем занятые координаты
    for (const ball of updatedBalls) {
      allCoordinates.add(`${ball.row}-${ball.col}`);
    }
  
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        const coordinates = `${i}-${j}`;
        if (!allCoordinates.has(coordinates)) {
          emptyCells.push({ row: i, col: j });
        }
      }
    }
  
    const newBalls = [];
    const remainingEmptyCells = emptyCells.length;
  
    while (newBalls.length < Math.min(3, remainingEmptyCells) && emptyCells.length > 0) {
      const randomIndex = Math.floor(Math.random() * emptyCells.length);
      const { row, col } = emptyCells.splice(randomIndex, 1)[0];
      const colorIndex = Math.floor(Math.random() * colors.length);
      const color = colors[colorIndex];
      newBalls.push({ row, col, color });
    }
  
    setBalls(prevBalls => [...prevBalls, ...newBalls]);
  };
  
  const isPathExist = (start, end) => {
    const visited = new Set();
    const queue = [start];

    while (queue.length > 0) {
      const current = queue.shift();
      if (current.row === end.row && current.col === end.col) {
        return true;
      }

      visited.add(`${current.row}-${current.col}`);

      const neighbors = getNeighbors(current);
      neighbors.forEach(neighbor => {
        const cellOccupied = balls.some(ball => ball.row === neighbor.row && ball.col === neighbor.col);
        if (!visited.has(`${neighbor.row}-${neighbor.col}`) && !cellOccupied) {
          queue.push(neighbor);
        }
      });
    }

    return false;
  };

  const getNeighbors = ({ row, col }) => {
    const neighbors = [];
    const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]]; // Все возможные направления движения

    for (const [dx, dy] of directions) {
      const newRow = row + dx;
      const newCol = col + dy;

      if (newRow >= 0 && newRow < 9 && newCol >= 0 && newCol < 9) {
        neighbors.push({ row: newRow, col: newCol });
      }
    }

    return neighbors;
  };
  const checkAndRemoveBalls = () => {
    const directions = [
      [1, 0], [0, 1], [1, 1], [1, -1] // Проверяем в 4 направлениях: вправо, вниз, по диагонали вправо-вниз, по диагонали влево-вниз
    ];
  
    let updatedBalls = [...balls];
    let ballsToRemove = [];
  
    for (const ball of balls) {
      for (const direction of directions) {
        let count = 1;
        let currentRow = ball.row;
        let currentCol = ball.col;
  
        const [dx, dy] = direction;
        let nextRow = currentRow + dx;
        let nextCol = currentCol + dy;
  
        while (count < 5 && nextRow >= 0 && nextRow < 9 && nextCol >= 0 && nextCol < 9) {
          const nextBall = balls.find(b => b.row === nextRow && b.col === nextCol);
  
          if (nextBall && nextBall.color === ball.color) {
            count++;
            nextRow += dx;
            nextCol += dy;
          } else {
            break;
          }
        }
  
        if (count >= 5) {
          for (let i = 0; i < count; i++) {
            ballsToRemove.push({ row: currentRow, col: currentCol });
            currentRow += dx;
            currentCol += dy;
          }
        }
      }
    }
  
    if (ballsToRemove.length > 0) {
      updatedBalls = updatedBalls.filter(ball => !ballsToRemove.some(removeBall => removeBall.row === ball.row && removeBall.col === ball.col));
      setBalls(updatedBalls);
      setRemovedBallsCount(prevCount => prevCount + ballsToRemove.length);
      updateScore(ballsToRemove.length);
      ballsToRemove=[];
    }
  };
  
  const updateScore = (removedCount) => {
    let additionalScore = Math.floor((removedCount-4)/2);
    if (additionalScore < 1) additionalScore = 1;
    setScore(prevScore => prevScore + additionalScore);
  };


  

  useEffect(() => {
    checkAndRemoveBalls();
    if (balls.length<81)
    {
      setGameOver(false);
    }
    else 
    {
      setGameOver(true);
    }
  }, [balls]);

  const saveResult = async () =>
  {
    setClicked(1);
    try{
      axios.post('http://localhost:5454/post', {
        
        name: newGamer,
        score: score
      })
    }
    catch(err) {
      console.log(err)
    };
  }

  const restartGame =() => {
    window.location.reload();
  };
  return (
    <div className="game">
      <aside className='record'>
        <p className='recordItems'>&#127881;&#127881;Рекорд&#127881;&#127881;</p>
        <p className='rec'>{result.name} {result.score}</p>
      </aside>
      <div className='registrationField'>
        <input type="text" placeholder='User' onChange={setGamer}/>
        <label htmlFor='Name' >Введите имя</label>
      </div>
      
      <div className="score">Счет: {score}</div>
      <div className="grid">
        {renderCells()}
      </div>
      {gameOver && (
        <div className='game-over'>
          <div className='game-over-message'>
            Игра завершена. Ваш счет: {score}
          </div>
          <div>
          <button className={`restart-button ${clicked ? 'restart-button-disabled': '' }`} onClick={saveResult}>
              сохранить
            </button>
            <button className="restart-button" onClick={restartGame}>
              
              Повторить игру
            </button>
            
          </div>
        </div>
      )}
    </div>
  );
}
export default App;