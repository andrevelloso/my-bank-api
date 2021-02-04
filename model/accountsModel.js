import mongoose from 'mongoose';

// 2. Implementar um modelo (schema) para essa coleção

const accSchema = mongoose.Schema({
  agencia: {
    type: Number,
    required: true
  },
  conta: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  balance: {
    type: Number,
    required: true,
    min: 0
  }
});

const accountModel = mongoose.model('accounts', accSchema);

export { accountModel };