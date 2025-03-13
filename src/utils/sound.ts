// Создаем экземпляры Audio для каждого звука
const buttonSound = new Audio('/sounds/button-click.mp3');
const checkpointSound = new Audio('/sounds/checkpoint.mp3');
const alertSound = new Audio('/sounds/alert.mp3');

// Функция для воспроизведения звука кнопки
export const playButtonSound = () => {
  buttonSound.currentTime = 0;
  buttonSound.play().catch(() => {});
};

// Функция для воспроизведения звука чекпоинта
export const playCheckpointSound = () => {
  checkpointSound.currentTime = 0;
  checkpointSound.play().catch(() => {});
};

// Функция для воспроизведения звука уведомления
export const playAlertSound = () => {
  alertSound.currentTime = 0;
  alertSound.play().catch(() => {});
}; 