import app from './app.js';
import { config } from 'dotenv';

config();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`SNC-TAX Backend running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
