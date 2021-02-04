import express from 'express';
import { accountModel } from '../model/accountsModel.js';

const app = express();

app.get('/contas', async (req, res) => {
  try {
    const account = await accountModel.find({}).sort({agencia:1, conta:1});
    res.send(account);
  } catch (error) {
    res.status(500).send("Não conseguimos acessar as contas: " + error);
  }
})

// Create account
app.post('/contas/nova', async (req, res) => {
  try {
    const dataNewAccount = req.body;
    const { agencia, conta } = dataNewAccount;
    const account = await accountModel.findOne({agencia: agencia, conta: conta}, {_id:1});
    if (account) {
      res.status(500).send("Conta já existe nesta agencia - verifique agencia e numero :"+ account);
    } else {
      const newAccount = new accountModel(dataNewAccount);
      await newAccount.save();
      res.send(newAccount);
    }
  } catch (err) {
    res.status(500).send("Não foi possível criar uma conta bancária, verifique o Erro: " + err);
  }
})

// 4. Crie um endpoint para registrar um depósito em uma conta.
app.patch('/contas/deposito/:ag/:cc/:valor', async (req, res) => {
  try {
    const value = req.params.valor;
    const ag = req.params.ag;
    const cc = req.params.cc;

    const validate = await accountModel.countDocuments({ conta: cc })
    if (validate == 1) {
      await accountModel.updateOne({ agencia: ag, conta: cc }, { $inc: { balance: value } })
      res.status(200).send('Depósito efetuado com sucesso')
    } else {
      res.status(404).send('Algo de errado não está certo com a transação')
    }
  } catch (err) {
    res.status(500).send("Algo de errado não está certo: " + err)
  }
})

// 5. Crie um endpoint para registrar um saque em uma conta
app.patch('/contas/saque/:ag/:cc/:valor', async (req, res) => {
  try {
    const tax = 1;
    const value = parseInt(req.params.valor) + tax;
    const ag = req.params.ag;
    const cc = req.params.cc;
    let accBalance = await accountModel.find({ conta: cc }, { _id: 0, agencia: 0, conta: 0, name: 0, __v: 0 })
    accBalance = accBalance[0].balance;
    const validateBal = accBalance - value;
    if (validateBal >= 0) {
      await accountModel.updateOne({ agencia: ag, conta: cc }, { $set: { balance: validateBal } })
      res.status(200).send('Saque efetuado com sucesso')
    } else {
      res.status(404).send('Algo de errado não está certo com a transação: Saldo insuficiente')
    }
  } catch (err) {
    res.status(500).send("Algo de errado não está certo: Verifique os dados da conta e agência. " + err)
  }
})

// 6. Crie um endpoint para consultar o saldo da conta
app.get('/contas/saldo/:ag/:cc', async (req, res) => {
  try {
    const ag = req.params.ag;
    const cc = req.params.cc;
    console.log(ag)
    console.log(cc)

    const accBalance = await accountModel.find({ agencia: ag, conta: cc }, { _id: 0, agencia: 0, conta: 0, __v: 0 })
    res.status(200).send(accBalance);
  } catch (error) {
    res.status(500).send("Confira seus dados e tente novamente: " + error);
  }
})

// 7. Crie um endpoint para excluir uma conta.
app.delete('/contas/encerrar/:ag/:cc', async (req, res) => {
  try {
    const ag = req.params.ag;
    const cc = req.params.cc;
    console.log(ag)
    console.log(cc)

    await accountModel.deleteOne({ agencia: ag, conta: cc })
    const atualizedAcc = await accountModel.find({});
    res.send(atualizedAcc);
  } catch (err) {
    res.send(500).send('Problemas com a exclusão: ' + err);
  }
})

// 8. Crie um endpoint para realizar transferências entre contas.
app.patch('/contas/tev/:ccOrigem/:ccDestino/:valor', async (req, res) => {
  try {
    const ccDec = req.params.ccOrigem; // ccDev
    const ccInc = req.params.ccDestino; // ccInc
    let value = parseInt(req.params.valor);
    const ccOne = await accountModel.find({ conta: ccDec }, { _id: 0, __v: 0 });
    const ccTwo = await accountModel.find({ conta: ccInc }, { _id: 0, __v: 0 });
    const agenceAccountOne = ccOne[0].agencia;
    const agenceAccountTwo = ccTwo[0].agencia;
    let accuntBalanceOne = ccOne[0].balance;
    let accountBalanceTwo = ccTwo[0].balance;
    // console.log(accuntBalanceOne + 1, accountBalanceTwo - 1)
    agenceAccountOne == agenceAccountTwo ? (accuntBalanceOne -= value) && (accountBalanceTwo += value) : (accuntBalanceOne -= (value + 8)) && (accountBalanceTwo + value)
    await accountModel.bulkWrite([
      { updateOne: { "filter": { conta: ccDec }, "update": { $set: { balance: accuntBalanceOne } } } },
      { updateOne: { "filter": { conta: ccDec }, "update": { $set: { balance: accuntBalanceOne } } } },
    ])
    // console.log(accuntBalanceOne, accountBalanceTwo)
    res.sendStatus(200);
  } catch (err) {
    res.send(500).status('Erro na transação, verifique os dados e tente novamente' + err)
  }
})

// 9. Crie um endpoint para consultar a média do saldo dos clientes de determinada agência.
app.get('/contas/media-agencia/:ag', async (req, res) => {
  try {
    const ag = req.params.ag;
    const average = await accountModel.aggregate([
      { $group: { _id: { agencia: "$agencia" }, balance: { $avg: "$balance" } } },
    ])
    let avg = 0;
    avg = average.find((agency) => {
      let avgValue;
      agency._id.agencia == 99 ? avgValue = agency.balance : '';
      return avgValue
    })
    res.status(200).send(`Agência: ${ag} Média de Saldo: ${avg.balance}`);
  } catch (err) {
    res.status(500).send('Houve um erro na obtenção das médias, cheque as informações: ' + err)
  }
})

// 10. Crie um endpoint para consultar os clientes com o menor saldo em conta.
app.get('/contas/menores-saldos/:limite', async (req, res) => {
  try {
    const limit = parseInt(req.params.limite);
    const data = await accountModel.find({}, { _id: 0, name: 0, __v: 0 }).limit(limit).sort({ balance: 1 })
    res.send(data)
  } catch (err) {
    res.status(500).send('Houve um erro na listagem, por favor cheque as informações: ' + err)
  }
})

// 11. Crie um endpoint para consultar os clientes mais ricos do banco.
app.get('/contas/maiores-saldos/:limite', async (req, res) => {
  try {
    const limit = parseInt(req.params.limite);
    const data = await accountModel.find({}, { _id: 0, __v: 0 }).limit(limit).sort({ balance: -1 })
    res.send(data)
  } catch (err) {
    res.status(500).send('Houve um erro na listagem, por favor cheque as informações: ' + err)
  }
})

// 12. Crie um endpoint que irá transferir o cliente com maior saldo em conta de cada agência para a agência private
app.get('/contas/transfere-clientes-prime', async (req, res) => {
  try {
    let newClientsPrime = await accountModel.aggregate([
      { $match: { agencia: {$lt:99} }},
      { $group: { _id: '$agencia', balance: { $max: '$balance' }}}
    ]);
    //console.log(newClientsPrime);
    //console.log(newClientsPrime.length);
    var i;
    for ( i=1; i < newClientsPrime.length+1; i++ ) {
      const { _id, balance } = newClientsPrime[i];
      let newAccount = await accountModel.findOne({ agencia: _id, balance });
      newAccount.agencia = 99;
      newAccount.save();
      console.log(i);
    } 
    let clientsPrime = await accountModel.find({agencia:99},{_id:0, __v:0});
    res.send(clientsPrime);
  } catch (err) {
    res.status(500).send('Houve um erro na listagem, por favor cheque as informações: ' + err)
  }
})

export { app as accountRouter };