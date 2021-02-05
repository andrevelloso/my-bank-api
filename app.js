import express from 'express';
import mongoose from 'mongoose';
import { accountRouter } from './routes/accountRoutes.js';
import pkg from 'dotenv';
const {dotenv} = pkg;

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true
    });
  } catch (error) { console.log('Não foi possível conectar ao Atlas MongoDB: ' + error) }
})();

const app = express();
app.use(express.json());
app.use(accountRouter);

// Definição de porta e inicialização do app 
const APP_PORT = process.env.PORT || 3001;
app.listen(APP_PORT, () => {console.log('API conectada com sucesso na porta ' + APP_PORT);})
