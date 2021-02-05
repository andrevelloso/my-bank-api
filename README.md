# my-bank-api

## Está em execução em https://av-bank-api.herokuapp.com/contas

Este projeto demonstra a integração de API em NodeJS com persistencia de dados no MongoDB Atlas (Cloud)
e CD (Continuos Deploy) no Heroku (PAAS)

Lembre-se de informar URL de conexão e porta no arquivo ".env" ou registar nas variaveis de ambiente
MONGODB=
PORT=

## Poderá utilizar as seguintes rotas HTTP

no body da mensagem utilize o formato JSON com o seguinte modelo:

{ agencia: 10,
conta: 1040,
name: Mario Caetano,
balance: 550
}

## Consultar Todas as Contas

### GET https://av-bank-api.herokuapp.com/contas

## Criar uma conta nova

### POST https://av-bank-api.herokuapp.com/contas/nova

## Efetuar um Deposito na conta

### PATCH https://av-bank-api.herokuapp.com/contas/deposito/:ag/:cc/:valor

## Efetuar um Saque na conta ( debita tarifa de $ 1 alem do valor)

### PATCH https://av-bank-api.herokuapp.com/contas/saque/:ag/:cc/:valor

## Consultar Saldo de uma conta

### GET https://av-bank-api.herokuapp.com/contas/saldo/:ag/:cc

## Encerrar uma conta

### DELETE https://av-bank-api.herokuapp.com/contas/encerrar/:ag/:cc

## Realizar Transferencia entre contas

### PATCH https://av-bank-api.herokuapp.com/contas/tev/:ccOrigem/:ccDestino/:valor

## Consultar Saldo médio de uma agência

### GET https://av-bank-api.herokuapp.com/contas/media-agencia/:ag

## Consultar Menores Saldos de cada agência

### GET https://av-bank-api.herokuapp.com/contas/menores-saldos/:limite

## Consultar Maiores Saldos de cada agência

### GET https://av-bank-api.herokuapp.com/contas/maiores-saldos/:limite

## Transfere a conta com o maior saldo de cada agência para agência PRIME (99)

### GET https://av-bank-api.herokuapp.com/contas/transfere-clientes-prime
