class Validator {
  static isValid(value) {
    throw new Error("Not implemented")
  }
}

class FioValidator extends Validator {
  static isValid(value) { return value.trim().split(/\s+/).length === 3 }
}

class EmailValidator extends Validator {
  static isValid(value) { return /[a-z\._0-9]@(ya|yandex)\.(ru|ua|by|kz|com)/.test(value) }
}

class PhoneFormatValidator extends Validator {
  static isValid(value) { return /\+7\(\d{3}\)\d{3}-\d{2}-\d{2}/.test(value.trim()) }
}

class PhoneSumValidator extends Validator {
  static isValid(value) { return value.replace(/\D+/g, '').split('').reduce((sum, val) => sum + Number(val), 0) <= 30 }
}

const RESPONSES = [
  {"status": "success"},
  {"status": "error", "reason": "Something was wrong"},
  {"status": "progress", "timeout": 1000}
]

class MyForm {
  get VALIDATORS() {
    return {
      fio: [FioValidator],
      email: [EmailValidator],
      phone: [PhoneFormatValidator, PhoneSumValidator]
    }
  }

  constructor(form, resultContainer) {
    this.form = form
    this.inputs = Array.from(this.form.getElementsByTagName("input"))
    this.resultContainer = resultContainer
    this.form.addEventListener('submit', (e) => {
      e.preventDefault()

      this.validate().isValid && this.submit()

      return false
    })
  }

  getData() {
    return this.inputs.reduce((mem, input) => {
      mem[input.name] = input.value
      return mem
    }, {})
  }

  setData(data = {}) {
    this.inputs.forEach(input => data[input.name] && input.setAttribute("value", data[input.name]))
  }

  validate() {
    const invalids = this.inputs
      .filter(input => !this.VALIDATORS[input.name].every(validator => validator.isValid(input.value)))
      .map(input => input.name)

    this.inputs.forEach(input => {
      invalids.indexOf(input.name) >= 0 ?
        input.classList.add('error') :
        input.classList.remove('error')
    })

    return {
      isValid: invalids.length === 0,
      errorFields: invalids
    }
  }

  submit() {
    fetch(this.form.action)
      .then(response => response.json())
      .then(json => {
        switch (json.status) {
          case 'progress':
            setTimeout(this.submit.bind(this), json.timeout)
            break;

          case 'success':
            this.resultContainer.classList.add('success')
            this.resultContainer.innerHTML = "Success"
            break;

          case 'error':
            this.resultContainer.classList.add('error')
            this.resultContainer.innerHTML = json.reason
            break;
        }
      })
  }
}

const formElement = document.forms["myForm"]
const resultContainer = document.getElementById('resultContainer')
const myForm = new MyForm(formElement, resultContainer)
