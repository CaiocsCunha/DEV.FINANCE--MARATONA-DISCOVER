//objeto onde está sendo manipulado o formulario de entrada dos dados
const Modal = {
  open() {
    document.querySelector('.modal-overlay').classList.add('active')
  },
  close() {
    document.querySelector('.modal-overlay').classList.remove('active')
  }
}

const Storage = {
  get() {
    return JSON.parse(localStorage.getItem('dev.finaces:transactions')) || []
  },
  set(transactions) {
    localStorage.setItem(
      'dev.finances:transactions',
      JSON.stringify(transactions)
    )
  }
}

// objeto que armazena as funções que calculam o total de entradas, saidas e o saldo final
const Transaction = {
  all: Storage.get(),

  add(transaction) {
    Transaction.all.push(transaction)

    App.reload()
  },

  remove(index) {
    Transaction.all.splice(index, 1)

    App.reload()
  },

  incomes() {
    let income = 0
    Transaction.all.forEach(transaction => {
      if (transaction.amount > 0) {
        income += transaction.amount
      }
    })

    return income
  },

  expenses() {
    let expense = 0
    Transaction.all.forEach(transaction => {
      if (transaction.amount < 0) {
        expense += transaction.amount
      }
    })

    return expense
  },

  total() {
    return Transaction.incomes() + Transaction.expenses()
  }
}

// objeto onde está sendo feito toda a manipulação do documento HTML
const DOM = {
  transactionsContainer: document.querySelector('#data-table tbody'),

  addTransaction(transaction, index) {
    const tr = document.createElement('tr') //cria uma linha de tabela e atribui a const tr
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index) //chama a função para adicionar dados na linha criada

    DOM.transactionsContainer.appendChild(tr) //cria de fato o <tr></tr>
  },

  innerHTMLTransaction(transaction, index) {
    const CSSclass = transaction.amount > 0 ? 'income' : 'expense'

    const amount = Utils.formatCurrency(transaction.amount)

    const html = `
      <td class="description">${transaction.description} </td>
      <td class="${CSSclass}">R$ ${amount} </td>
      <td class="date"> ${transaction.date} </td>
      <td>
        <img onclick='Transaction.remove(${index})' src="./assets/minus.svg" alt="Remover transação">
      </td>
    `

    return html
  },

  // aqui adiciona os valores atualizados dos totais ao documento HTML
  updateBalance() {
    document.getElementById('incomeDisplay').innerHTML = Utils.formatCurrency(
      Transaction.incomes()
    )

    document.getElementById('expenseDisplay').innerHTML = Utils.formatCurrency(
      Transaction.expenses()
    )

    document.getElementById('totalDisplay').innerHTML = Utils.formatCurrency(
      Transaction.total()
    )
  },

  clearTransactions() {
    DOM.transactionsContainer.innerHTML = ''
  }
}

const Utils = {
  formatAmount(value) {
    value = Number(value.replace(/\.\./g, '')) * 100

    return value
  },

  formatDate(date) {
    const splittedDate = date.split('-')
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
  },

  formatCurrency(value) {
    const signal = Number(value) < 0 ? '-' : ''

    value = String(value).replace(/\D/g, '')

    value = Number(value) / 100

    value = value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })

    return signal + value
  }
}

const Form = {
  description: document.querySelector('input#description'),
  amount: document.querySelector('input#amount'),
  date: document.querySelector('input#date'),

  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value
    }
  },

  validateFields() {
    const { description, amount, date } = Form.getValues()
    if (description.trim() === '' || amount.trim() === '' || date.trim === '') {
      throw new Error('Por favor, preencha todos os campos')
    }
  },

  formatValues() {
    let { description, amount, date } = Form.getValues()

    amount = Utils.formatAmount(amount)

    date = Utils.formatDate(date)
    return {
      description,
      amount,
      date
    }
  },

  clearFields() {
    Form.description.value = ''
    Form.amount.value = ''
    Form.date.value = ''
  },

  submit(event) {
    event.preventDefault()

    try {
      Form.validateFields() //verificar se os campos estão validos
      const transaction = Form.formatValues() //pegar uma transação formatada
      Transaction.add(transaction) //adicionar transação
      Form.clearFields() //limpar todos os campos
      Modal.close() // fechar o modal
    } catch (error) {
      alert(error.message)
    }
  }
}

const App = {
  init() {
    Transaction.all.forEach((transaction, index) => {
      // varre cada posição das transações e envia para ser criada dentro da DOM
      DOM.addTransaction(transaction, index)
    })

    DOM.updateBalance()

    Storage.set(Transaction.all)
  },

  reload() {
    DOM.clearTransactions()
    App.init()
  }
}

App.init()

// substituir os dados do HTML com os dados do JS
