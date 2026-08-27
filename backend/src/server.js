require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`=============================================`);
  console.log(`🚀 Trello Clone Backend Sunucusu Başlatıldı!`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`🔧 Ortam: ${process.env.NODE_ENV || 'development'}`);
  console.log(`=============================================`);
});
